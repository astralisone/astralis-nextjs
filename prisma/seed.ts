import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Step 1: Create or find the test user first
  let user = await prisma.users.findUnique({
    where: { email: 'test@astralisone.com' },
  });

  if (!user) {
    console.log('👤 Creating test user...');
    const hashedPassword = await hashPassword('Test123!');
    user = await prisma.users.create({
      data: {
        email: 'test@astralisone.com',
        name: 'Test Admin',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Created user: ${user.email} (${user.id})`);
  } else {
    console.log(`✅ Found existing user: ${user.email} (${user.id})`);
    // Ensure user has ADMIN role
    if (user.role !== 'ADMIN') {
      user = await prisma.users.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
      console.log(`   Updated role to ADMIN`);
    }
  }

  // Step 2: Create or find organization, using user's ID as the org ID for consistency
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

  // Step 3: Link user to organization if not already linked
  if (user.orgId !== organization.id) {
    console.log('🔗 Linking user to organization...');
    user = await prisma.users.update({
      where: { id: user.id },
      data: { orgId: organization.id },
    });
    console.log(`✅ User linked to organization`);
  }

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test credentials:');
  console.log('  Email: test@astralisone.com');
  console.log('  Password: Test123!');
  console.log('  Role: ADMIN');
  console.log(`  Organization: ${organization.name}`);
  console.log('');
  console.log('Add to your .env / .env.production:');
  console.log(`  DEFAULT_USER_ID=${user.id}`);
  console.log(`  DEFAULT_ORG_ID=${organization.id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
