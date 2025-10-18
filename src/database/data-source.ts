import { DataSource } from 'typeorm';
import { FxqlEntry } from '../fxql/entities/fxql-entry.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [FxqlEntry],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
  synchronize: false, // Disabled for production safety
  extra: process.env.DB_SSL_ENABLED === 'true'
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {},
});
