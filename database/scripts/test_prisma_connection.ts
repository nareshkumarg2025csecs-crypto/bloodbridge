import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Prisma connection to bloodbridge_dev...');
  const usersCount = await prisma.user.count();
  const instCount = await prisma.institution.count();
  const branchCount = await prisma.institutionBranch.count();
  const groupCount = await prisma.bloodGroup.count();
  const phenoCount = await prisma.bloodPhenotype.count();
  const compCount = await prisma.bloodComponent.count();
  const unitCount = await prisma.bloodInventoryUnit.count();

  console.log('PRISMA_CONNECT_SUCCESS');
  console.log('Database Records Verified through Prisma Client:', {
    users: usersCount,
    institutions: instCount,
    branches: branchCount,
    bloodGroups: groupCount,
    rarePhenotypes: phenoCount,
    bloodComponents: compCount,
    inventoryUnits: unitCount
  });

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('Prisma connection error:', e);
  await prisma.$disconnect();
  process.exit(1);
});
