import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { CustomForbiddenException } from '../exceptions/custom.exceptions';
import { FxqlErrorCode } from '../constants/error-codes';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  // replace with environment variables
  private readonly validApiKeys = process.env.API_KEYS?.split(',') || [];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // Handle missing API_KEYS configuration gracefully
    if (!this.validApiKeys || this.validApiKeys.length === 0) {
      throw new CustomForbiddenException(
        'API key authentication is not configured',
        FxqlErrorCode.API_KEY_NOT_CONFIGURED,
      );
    }

    if (!apiKey) {
      throw new CustomForbiddenException(
        'API key is required',
        FxqlErrorCode.MISSING_API_KEY,
        [{ message: 'Include x-api-key header in your request' }],
      );
    }

    if (!this.validApiKeys.includes(apiKey)) {
      throw new CustomForbiddenException(
        'Invalid API key',
        FxqlErrorCode.INVALID_API_KEY,
      );
    }

    return true;
  }
}
