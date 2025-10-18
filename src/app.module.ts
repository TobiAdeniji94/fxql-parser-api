import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { FxqlModule } from './fxql/fxql.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { loggerConfig } from './config/logger.config';
import { ValidationConfigService } from './config/validation-config.service';
import { IdempotencyRecord } from './common/entities/idempotency-record.entity';
import { IdempotencyService } from './common/services/idempotency.service';
import { RedisThrottlerStorageService } from './common/services/redis-throttler-storage.service';
import { ApiKeyThrottlerGuard } from './common/guards/api-key-throttler.guard';
import { MetricsService } from './common/services/metrics.service';
import { MetricsController } from './common/controllers/metrics.controller';
import { AuditLog } from './common/entities/audit-log.entity';
import { AuditService } from './common/services/audit.service';

@Module({
  imports: [
    LoggerModule.forRoot(loggerConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([IdempotencyRecord, AuditLog]),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: config.get('validationRules.rate_limits.default_ttl_seconds', 60) * 1000,
            limit: config.get('validationRules.rate_limits.default_limit', 10),
          },
          {
            name: 'burst',
            ttl: 1000, // 1 second
            limit: 3, // Max 3 requests per second burst
          },
        ],
        storage: new RedisThrottlerStorageService(),
      }),
    }),
    DatabaseModule, 
    FxqlModule
  ],
  controllers: [AppController, MetricsController],
  providers: [
    ValidationConfigService,
    IdempotencyService,
    RedisThrottlerStorageService,
    MetricsService,
    AuditService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyThrottlerGuard,
    },
  ],
  exports: [IdempotencyService, MetricsService, AuditService],
})

export class AppModule {}
