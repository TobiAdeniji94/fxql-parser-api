import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxqlEntry } from '../fxql/entities/fxql-entry.entity';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            username: process.env.DB_USERNAME || 'fxql_user',
            password: process.env.DB_PASSWORD || 'securepassword',
            database: process.env.DB_NAME || 'fxql_db',
            entities: [FxqlEntry],
            synchronize: false,
            autoLoadEntities: false
        }),
    ],
})
export class DatabaseModule {}
