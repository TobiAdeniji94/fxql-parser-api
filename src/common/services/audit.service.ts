import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';
import { createHash } from 'crypto';

export interface AuditLogDto {
  action: AuditAction;
  apiKeyId?: string;
  apiKeyName?: string;
  requestId?: string;
  method?: string;
  endpoint?: string;
  statusCode?: number;
  errorCode?: string;
  requestPayload?: any;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event
   */
  async log(dto: AuditLogDto): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        action: dto.action,
        apiKeyId: dto.apiKeyId,
        apiKeyName: dto.apiKeyName,
        requestId: dto.requestId,
        method: dto.method,
        endpoint: dto.endpoint,
        statusCode: dto.statusCode,
        errorCode: dto.errorCode,
        requestPayloadHash: dto.requestPayload ? this.hashPayload(dto.requestPayload) : undefined,
        metadata: dto.metadata,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent,
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      // Don't fail the request if audit logging fails
      this.logger.error('Failed to save audit log:', error);
    }
  }

  /**
   * Log API request
   */
  async logApiRequest(
    requestId: string,
    method: string,
    endpoint: string,
    statusCode: number,
    apiKeyId?: string,
    apiKeyName?: string,
    errorCode?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      action: AuditAction.API_REQUEST,
      requestId,
      method,
      endpoint,
      statusCode,
      apiKeyId,
      apiKeyName,
      errorCode,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log rate limit exceeded
   */
  async logRateLimitExceeded(
    apiKeyId: string,
    apiKeyName: string,
    endpoint: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log({
      action: AuditAction.RATE_LIMIT_EXCEEDED,
      apiKeyId,
      apiKeyName,
      endpoint,
      ipAddress,
      metadata: { timestamp: new Date().toISOString() },
    });
  }

  /**
   * Log authentication failure
   */
  async logAuthenticationFailed(
    endpoint: string,
    ipAddress?: string,
    userAgent?: string,
    reason?: string,
  ): Promise<void> {
    await this.log({
      action: AuditAction.AUTHENTICATION_FAILED,
      endpoint,
      ipAddress,
      userAgent,
      metadata: { reason },
    });
  }

  /**
   * Log API key creation
   */
  async logApiKeyCreated(
    apiKeyId: string,
    apiKeyName: string,
    createdBy?: string,
  ): Promise<void> {
    await this.log({
      action: AuditAction.API_KEY_CREATED,
      apiKeyId,
      apiKeyName,
      metadata: { createdBy },
    });
  }

  /**
   * Log API key rotation
   */
  async logApiKeyRotated(apiKeyId: string, apiKeyName: string): Promise<void> {
    await this.log({
      action: AuditAction.API_KEY_ROTATED,
      apiKeyId,
      apiKeyName,
    });
  }

  /**
   * Log API key revocation
   */
  async logApiKeyRevoked(apiKeyId: string, apiKeyName: string): Promise<void> {
    await this.log({
      action: AuditAction.API_KEY_REVOKED,
      apiKeyId,
      apiKeyName,
    });
  }

  /**
   * Get audit logs for an API key
   */
  async getAuditLogsForApiKey(
    apiKeyId: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { apiKeyId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get audit logs by action
   */
  async getAuditLogsByAction(
    action: AuditAction,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Hash request payload for audit trail (privacy)
   */
  private hashPayload(payload: any): string {
    const payloadString = JSON.stringify(payload);
    return createHash('sha256').update(payloadString).digest('hex');
  }
}
