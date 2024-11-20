import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  // replace with environment variables
  private readonly validApiKeys = process.env.API_KEYS?.split(',') || ['key1', 'key2', 'key3'];

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || !this.validApiKeys.includes(apiKey)) {
      throw new ForbiddenException('Invalid API key');
    }

    return true;
  }
}
