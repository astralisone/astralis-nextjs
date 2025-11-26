import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creating test user...');

  const email = 'test@astralisone.com';
  const password = 'Test123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  // Check if user already exists
  const existing = await prisma.users.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('✅ Test user already exists:', email);
    console.log('   ID:', existing.id);
    console.log('   Role:', existing.role);
    return;
  }

  // Create organization first
  let organization = await prisma.organization.findFirst({
    where: { name: 'Test Organization' },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
        slug: 'test-org',
      },
    });
    console.log('✅ Created organization:', organization.name);
  }

  // Create test user
  const user = await prisma.users.create({
    data: {
      email,
      name: 'Test Admin',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      timezone: 'UTC',
      orgId: organization.id,
    },
  });

  console.log('');
  console.log('✅ Test user created successfully!');
  console.log('');
  console.log('Test credentials:');
  console.log('  Email:', email);
  console.log('  Password:', password);
  console.log('  Role:', user.role);
  console.log('  Organization:', organization.name);
}

main()
  .catch((e) => {
    console.error('❌ Failed to create test user:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
