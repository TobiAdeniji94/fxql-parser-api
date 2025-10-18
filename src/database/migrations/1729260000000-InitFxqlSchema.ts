import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class InitFxqlSchema1729260000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'fxql_entries',
        columns: [
          {
            name: 'EntryId',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'sourceCurrency',
            type: 'char',
            length: '3',
            isNullable: false,
          },
          {
            name: 'destinationCurrency',
            type: 'char',
            length: '3',
            isNullable: false,
          },
          {
            name: 'buyPrice',
            type: 'decimal',
            precision: 10,
            scale: 5,
            isNullable: false,
          },
          {
            name: 'sellPrice',
            type: 'decimal',
            precision: 10,
            scale: 5,
            isNullable: false,
          },
          {
            name: 'capAmount',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
        indices: [
          {
            name: 'IDX_FXQL_CURRENCIES_CREATED',
            columnNames: ['sourceCurrency', 'destinationCurrency', 'createdAt'],
          },
        ],
      }),
      true,
    );

    // Enable UUID extension if not already enabled
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('fxql_entries', true);
  }
}
