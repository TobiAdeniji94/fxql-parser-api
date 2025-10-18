import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('idempotency_records')
@Index(['apiKey', 'expiresAt'])
export class IdempotencyRecord {
  @PrimaryColumn('varchar', { length: 255 })
  idempotencyKey: string;

  @Column('varchar', { length: 255 })
  apiKey: string;

  @Column('text')
  requestHash: string;

  @Column('jsonb')
  response: any;

  @Column('int')
  statusCode: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
