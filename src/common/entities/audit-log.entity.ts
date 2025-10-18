import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  API_REQUEST = 'api_request',
  API_KEY_CREATED = 'api_key_created',
  API_KEY_ROTATED = 'api_key_rotated',
  API_KEY_REVOKED = 'api_key_revoked',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  AUTHENTICATION_FAILED = 'authentication_failed',
  VALIDATION_ERROR = 'validation_error',
}

@Entity('audit_logs')
@Index(['apiKeyId', 'createdAt'])
@Index(['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  action: AuditAction;

  @Column({ type: 'varchar', length: 255, nullable: true })
  apiKeyId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apiKeyName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  requestId?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  endpoint?: string;

  @Column({ type: 'int', nullable: true })
  statusCode?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  errorCode?: string;

  @Column({ type: 'text', nullable: true })
  requestPayloadHash?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt: Date;
}
