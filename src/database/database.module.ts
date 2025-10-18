import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxqlEntry } from '../fxql/entities/fxql-entry.entity';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            entities: [FxqlEntry],
            synchronize: false, // Disabled - use migrations instead
            autoLoadEntities: true,
            migrations: ['dist/database/migrations/*.js'],
            migrationsRun: true, // Auto-run pending migrations on startup
            extra: process.env.DB_SSL_ENABLED === 'true'
                ? {
                    ssl: {
                        rejectUnauthorized: false,
                    },
                }
                : {},
        }),
    ],
})
export class DatabaseModule {}
