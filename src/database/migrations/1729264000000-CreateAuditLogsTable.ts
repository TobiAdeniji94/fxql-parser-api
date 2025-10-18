import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateAuditLogsTable1729264000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'apiKeyId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'apiKeyName',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'requestId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'method',
            type: 'varchar',
            length: '10',
            isNullable: true,
          },
          {
            name: 'endpoint',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'statusCode',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'errorCode',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'requestPayloadHash',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create composite index for querying by API key and time
    await queryRunner.query(`
      CREATE INDEX "IDX_AUDIT_APIKEY_CREATED" 
      ON audit_logs ("apiKeyId", "createdAt");
    `);

    // Create index for querying by action and time
    await queryRunner.query(`
      CREATE INDEX "IDX_AUDIT_ACTION_CREATED" 
      ON audit_logs ("action", "createdAt");
    `);

    // Create index for request ID lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_AUDIT_REQUEST_ID" 
      ON audit_logs ("requestId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs', true);
  }
}
