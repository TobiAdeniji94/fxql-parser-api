import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxqlEntry } from './entities/fxql-entry.entity';
import { FxqlService } from './fxql.service';
import { FxqlController } from './fxql.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FxqlEntry])],
  providers: [FxqlService],
  controllers: [FxqlController],
})
export class FxqlModule {}
