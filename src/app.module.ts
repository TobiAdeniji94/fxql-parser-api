import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { FxqlModule } from './fxql/fxql.module';

@Module({
  imports: [DatabaseModule, FxqlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
