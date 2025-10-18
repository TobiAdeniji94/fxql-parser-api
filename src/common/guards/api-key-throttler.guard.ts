import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class ApiKeyThrottlerGuard extends ThrottlerGuard {
  /**
   * Override to generate throttle key based on API key instead of IP
   */
  protected generateKey(
    context: ExecutionContext,
    suffix: string,
    name: string,
  ): string {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] || 'anonymous';
    
    // Create per-API-key throttle key
    return `${apiKey}:${name}:${suffix}`;
  }

  /**
   * Override to provide custom error message with API key context
   */
  protected async throwThrottlingException(
    context: ExecutionContext,
  ): Promise<void> {
    throw new ThrottlerException(
      `Rate limit exceeded. Please try again later.`,
    );
  }
}
