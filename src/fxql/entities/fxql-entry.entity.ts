import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('fxql_entries')
export class FxqlEntry {
  @PrimaryGeneratedColumn('uuid')
  EntryId: string;

  @Column({ type: 'char', length: 3 })
  sourceCurrency: string;

  @Column({ type: 'char', length: 3 })
  destinationCurrency: string;

  @Column('decimal', { precision: 10, scale: 5 })
  buyPrice: number;

  @Column('decimal', { precision: 10, scale: 5 })
  sellPrice: number;

  @Column('integer')
  capAmount: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
