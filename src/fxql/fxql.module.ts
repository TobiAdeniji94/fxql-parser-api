import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxqlEntry } from './entities/fxql-entry.entity';
import { FxqlService } from './fxql.service';
import { FxqlController } from './fxql.controller';
import { ValidationConfigService } from '../config/validation-config.service';
import { IdempotencyRecord } from '../common/entities/idempotency-record.entity';
import { IdempotencyService } from '../common/services/idempotency.service';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';
import { MetricsService } from '../common/services/metrics.service';
import { MetricsInterceptor } from '../common/interceptors/metrics.interceptor';
import { AuditLog } from '../common/entities/audit-log.entity';
import { AuditService } from '../common/services/audit.service';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([FxqlEntry, IdempotencyRecord, AuditLog])],
  providers: [
    FxqlService, 
    ValidationConfigService, 
    IdempotencyService, 
    IdempotencyInterceptor,
    MetricsService,
    MetricsInterceptor,
    AuditService,
    AuditInterceptor,
  ],
  controllers: [FxqlController],
})
export class FxqlModule {}
