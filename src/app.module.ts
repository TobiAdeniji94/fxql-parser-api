import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { FxqlModule } from './fxql/fxql.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { ValidationConfigService } from './config/validation-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 10
    }]),
    DatabaseModule, 
    FxqlModule
  ],
  controllers: [AppController],
  providers: [
    ValidationConfigService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
  ],
})

export class AppModule {}
