import { AppDataSource } from '../data-source';

/**
 * Script to create the next month's partition for fxql_entries table
 * Run this monthly via cron or scheduled task
 */
async function createNextMonthPartition() {
  try {
    await AppDataSource.initialize();
    
    const queryRunner = AppDataSource.createQueryRunner();
    
    // Calculate next month's date range
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthAfter = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    
    const partitionName = `fxql_entries_y${nextMonth.getFullYear()}_m${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
    const fromDate = nextMonth.toISOString().split('T')[0];
    const toDate = monthAfter.toISOString().split('T')[0];
    
    // Check if partition already exists
    const checkQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE tablename = '${partitionName}';
    `;
    
    const existing = await queryRunner.query(checkQuery);
    
    if (existing.length > 0) {
      console.log(`Partition ${partitionName} already exists.`);
      await queryRunner.release();
      await AppDataSource.destroy();
      return;
    }
    
    // Create new partition
    await queryRunner.query(`
      CREATE TABLE ${partitionName} PARTITION OF fxql_entries
      FOR VALUES FROM ('${fromDate}') TO ('${toDate}');
    `);
    
    console.log(`✅ Created partition: ${partitionName}`);
    console.log(`   Date range: ${fromDate} to ${toDate}`);
    
    await queryRunner.release();
    await AppDataSource.destroy();
    
  } catch (error) {
    console.error('❌ Error creating partition:', error);
    process.exit(1);
  }
}

createNextMonthPartition();
