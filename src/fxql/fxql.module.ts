import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxqlEntry } from './entities/fxql-entry.entity';
import { FxqlService } from './fxql.service';
import { FxqlController } from './fxql.controller';
import { ValidationConfigService } from '../config/validation-config.service';
import { IdempotencyRecord } from '../common/entities/idempotency-record.entity';
import { IdempotencyService } from '../common/services/idempotency.service';
import { IdempotencyInterceptor } from '../common/interceptors/idempotency.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([FxqlEntry, IdempotencyRecord])],
  providers: [FxqlService, ValidationConfigService, IdempotencyService, IdempotencyInterceptor],
  controllers: [FxqlController],
})
export class FxqlModule {}
