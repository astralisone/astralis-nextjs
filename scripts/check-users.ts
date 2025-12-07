import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      orgId: true,
      organization: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('Users:');
  users.forEach(u => {
    console.log(`- ${u.email} | orgId: ${u.orgId || 'NULL'} | org: ${u.organization?.name || 'NONE'}`);
  });

  // Check organizations
  const orgs = await prisma.organization.findMany({
    select: { id: true, name: true },
    take: 5
  });
  console.log('\nOrganizations:');
  orgs.forEach(o => console.log(`- ${o.id}: ${o.name}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
