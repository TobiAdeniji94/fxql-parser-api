import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Optional,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../services/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@Optional() private readonly auditService?: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.auditService) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const requestId = request.id || request.headers['x-request-id'];
    const method = request.method;
    const endpoint = request.route?.path || request.url;
    const apiKey = request.headers['x-api-key'];
    const ipAddress = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap({
        next: async () => {
          const statusCode = response.statusCode;

          // Log successful API requests
          if (statusCode >= 200 && statusCode < 300) {
            await this.auditService.logApiRequest(
              requestId,
              method,
              endpoint,
              statusCode,
              undefined, // API key ID (would need validation service)
              apiKey ? this.maskApiKey(apiKey) : 'anonymous',
              undefined,
              ipAddress,
              userAgent,
            );
          }
        },
        error: async (error) => {
          const statusCode = error.status || 500;
          const errorCode = error.response?.code || 'UNKNOWN';

          // Log failed API requests
          await this.auditService.logApiRequest(
            requestId,
            method,
            endpoint,
            statusCode,
            undefined,
            apiKey ? this.maskApiKey(apiKey) : 'anonymous',
            errorCode,
            ipAddress,
            userAgent,
          );

          // Log authentication failures
          if (statusCode === 401 || statusCode === 403) {
            await this.auditService.logAuthenticationFailed(
              endpoint,
              ipAddress,
              userAgent,
              error.message,
            );
          }
        },
      }),
    );
  }

  private maskApiKey(key: string): string {
    if (!key || key.length < 8) return '***';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  }
}
