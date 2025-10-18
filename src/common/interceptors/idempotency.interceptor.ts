import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Optional,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IdempotencyService } from '../services/idempotency.service';
import { MetricsService } from '../services/metrics.service';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly idempotencyService: IdempotencyService,
    @Optional() private readonly metricsService?: MetricsService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const idempotencyKey = request.headers['idempotency-key'];
    const apiKey = request.headers['x-api-key'];

    // If no idempotency key provided, proceed normally
    if (!idempotencyKey) {
      return next.handle();
    }

    // Check for cached response
    const cached = await this.idempotencyService.getCachedResponse(
      idempotencyKey,
      apiKey,
    );

    if (cached) {
      // Track idempotency cache hit
      if (this.metricsService) {
        this.metricsService.incrementIdempotencyHits(apiKey);
      }
      
      // Return cached response
      response.status(cached.statusCode);
      response.setHeader('X-Idempotency-Replayed', 'true');
      return of(cached.response);
    }

    // Proceed with request and cache the response
    return next.handle().pipe(
      tap(async (data) => {
        const statusCode = response.statusCode;
        
        // Only cache successful responses (2xx)
        if (statusCode >= 200 && statusCode < 300) {
          await this.idempotencyService.cacheResponse(
            idempotencyKey,
            apiKey,
            request.body,
            data,
            statusCode,
          );
        }
      }),
    );
  }
}
