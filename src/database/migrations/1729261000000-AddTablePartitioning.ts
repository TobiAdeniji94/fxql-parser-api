import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTablePartitioning1729261000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Note: This migration converts the existing table to a partitioned table
    // In production, you may want to migrate data differently to avoid downtime
    
    // Step 1: Rename existing table
    await queryRunner.query(`ALTER TABLE fxql_entries RENAME TO fxql_entries_old`);

    // Step 2: Create new partitioned parent table
    await queryRunner.query(`
      CREATE TABLE fxql_entries (
        "EntryId" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sourceCurrency" char(3) NOT NULL,
        "destinationCurrency" char(3) NOT NULL,
        "buyPrice" decimal(10,5) NOT NULL,
        "sellPrice" decimal(10,5) NOT NULL,
        "capAmount" integer NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        PRIMARY KEY ("EntryId", "createdAt")
      ) PARTITION BY RANGE ("createdAt");
    `);

    // Step 3: Create initial partitions for current and next 3 months
    const now = new Date();
    const partitions = [];
    
    for (let i = 0; i < 4; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      
      const partitionName = `fxql_entries_y${date.getFullYear()}_m${String(date.getMonth() + 1).padStart(2, '0')}`;
      const fromDate = date.toISOString().split('T')[0];
      const toDate = nextDate.toISOString().split('T')[0];
      
      partitions.push({ name: partitionName, from: fromDate, to: toDate });
    }

    for (const partition of partitions) {
      await queryRunner.query(`
        CREATE TABLE ${partition.name} PARTITION OF fxql_entries
        FOR VALUES FROM ('${partition.from}') TO ('${partition.to}');
      `);
    }

    // Step 4: Create composite index on partitioned table
    await queryRunner.query(`
      CREATE INDEX "IDX_FXQL_CURRENCIES_CREATED" 
      ON fxql_entries ("sourceCurrency", "destinationCurrency", "createdAt");
    `);

    // Step 5: Create index on individual currency lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_FXQL_SOURCE_CURRENCY" 
      ON fxql_entries ("sourceCurrency");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_FXQL_DEST_CURRENCY" 
      ON fxql_entries ("destinationCurrency");
    `);

    // Step 6: Migrate existing data (if any) from old table
    await queryRunner.query(`
      INSERT INTO fxql_entries 
      SELECT * FROM fxql_entries_old;
    `);

    // Step 7: Drop old table
    await queryRunner.query(`DROP TABLE fxql_entries_old`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate non-partitioned table
    await queryRunner.query(`ALTER TABLE fxql_entries RENAME TO fxql_entries_partitioned`);

    await queryRunner.query(`
      CREATE TABLE fxql_entries (
        "EntryId" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "sourceCurrency" char(3) NOT NULL,
        "destinationCurrency" char(3) NOT NULL,
        "buyPrice" decimal(10,5) NOT NULL,
        "sellPrice" decimal(10,5) NOT NULL,
        "capAmount" integer NOT NULL,
        "createdAt" timestamp NOT NULL DEFAULT now()
      );
    `);

    // Migrate data back
    await queryRunner.query(`
      INSERT INTO fxql_entries 
      SELECT * FROM fxql_entries_partitioned;
    `);

    // Recreate original index
    await queryRunner.query(`
      CREATE INDEX "IDX_FXQL_CURRENCIES_CREATED" 
      ON fxql_entries ("sourceCurrency", "destinationCurrency", "createdAt");
    `);

    await queryRunner.query(`DROP TABLE fxql_entries_partitioned CASCADE`);
  }
}
