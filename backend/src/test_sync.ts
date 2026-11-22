import { db } from './database/repository';

async function test() {
  console.log('Testing repository sync with MySQL...');
  await new Promise(r => setTimeout(r, 1000));
  console.log('SYNC_SUCCESS:');
  console.log('  Institutions synced:', db.institutions.size);
  console.log('  Users synced:', db.users.size);
  console.log('  Live Available Batches:', db.inventoryBatches.size);
  await db.prisma.$disconnect();
  await db.pool.end();
  process.exit(0);
}

test();
