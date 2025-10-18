import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ApiKeyScope {
  READ = 'read',
  WRITE = 'write',
  ADMIN = 'admin',
}

export enum ApiKeyStatus {
  ACTIVE = 'active',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

@Entity('api_keys')
@Index(['keyHash'], { unique: true })
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  keyHash: string; // SHA-256 hash of the API key

  @Column({ type: 'varchar', length: 100 })
  name: string; // Friendly name for the key

  @Column({ type: 'simple-array' })
  scopes: ApiKeyScope[];

  @Column({
    type: 'enum',
    enum: ApiKeyStatus,
    default: ApiKeyStatus.ACTIVE,
  })
  status: ApiKeyStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRotatedAt?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  createdBy?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
