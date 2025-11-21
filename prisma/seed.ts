import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/utils/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if test user exists
  const existingUser = await prisma.users.findUnique({
    where: { email: 'test@astralisone.com' },
  });

  if (!existingUser) {
    console.log('❌ Test user not found. Skipping seed.');
    return;
  }

  console.log(`✅ Found test user: ${existingUser.email}`);

  // Create or find organization
  let organization = await prisma.organization.findFirst({
    where: { name: 'Test Organization' },
  });

  if (!organization) {
    console.log('📦 Creating Test Organization...');
    organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
      },
    });
    console.log(`✅ Created organization: ${organization.name} (${organization.id})`);
  } else {
    console.log(`✅ Found existing organization: ${organization.name} (${organization.id})`);
  }

  // Update test user with organization and admin role
  if (!existingUser.orgId || existingUser.role !== 'ADMIN') {
    console.log('🔧 Updating test user with organization and admin role...');
    const updatedUser = await prisma.users.update({
      where: { id: existingUser.id },
      data: {
        orgId: organization.id,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Updated user: ${updatedUser.email}`);
    console.log(`   - Organization: ${organization.name}`);
    console.log(`   - Role: ${updatedUser.role}`);
  } else {
    console.log('✅ Test user already configured correctly');
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Test credentials:');
  console.log('  Email: test@astralisone.com');
  console.log('  Password: Test123!');
  console.log('  Role: ADMIN');
  console.log(`  Organization: ${organization.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
