import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { CustomForbiddenException } from '../exceptions/custom.exceptions';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  // replace with environment variables
  private readonly validApiKeys = process.env.API_KEYS?.split(',') || [];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    // Handle missing API_KEYS configuration gracefully
    if (!this.validApiKeys || this.validApiKeys.length === 0) {
      throw new CustomForbiddenException('API key authentication is not configured');
    }

    if (!apiKey || !this.validApiKeys.includes(apiKey)) {
      throw new CustomForbiddenException('Invalid API key');
    }

    return true;
  }
}
