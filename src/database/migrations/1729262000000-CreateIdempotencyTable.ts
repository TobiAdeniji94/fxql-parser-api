import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateIdempotencyTable1729262000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'idempotency_records',
        columns: [
          {
            name: 'idempotencyKey',
            type: 'varchar',
            length: '255',
            isPrimary: true,
          },
          {
            name: 'apiKey',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'requestHash',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'response',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'statusCode',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create composite index for cleanup queries
    await queryRunner.query(`
      CREATE INDEX "IDX_IDEMPOTENCY_APIKEY_EXPIRES" 
      ON idempotency_records ("apiKey", "expiresAt");
    `);

    // Create index for efficient expiration cleanup
    await queryRunner.query(`
      CREATE INDEX "IDX_IDEMPOTENCY_EXPIRES" 
      ON idempotency_records ("expiresAt");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('idempotency_records', true);
  }
}
