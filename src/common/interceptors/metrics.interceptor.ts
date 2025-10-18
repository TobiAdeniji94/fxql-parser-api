import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const startTime = Date.now();
    const method = request.method;
    const endpoint = request.route?.path || request.url;
    const apiKey = request.headers['x-api-key'] || 'anonymous';

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = response.statusCode;

          // Track request metrics
          this.metricsService.incrementRequestsTotal(method, endpoint, statusCode, apiKey);
          this.metricsService.observeRequestDuration(method, endpoint, statusCode, duration);

          // Track success
          if (statusCode >= 200 && statusCode < 300) {
            this.metricsService.incrementRequestsSuccess(apiKey);
          }
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const statusCode = error.status || 500;

          // Track request metrics
          this.metricsService.incrementRequestsTotal(method, endpoint, statusCode, apiKey);
          this.metricsService.observeRequestDuration(method, endpoint, statusCode, duration);

          // Track failure
          const errorCode = error.response?.code || 'UNKNOWN';
          this.metricsService.incrementRequestsFailure(apiKey, errorCode);
        },
      }),
    );
  }
}
