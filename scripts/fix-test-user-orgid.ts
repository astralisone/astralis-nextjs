/**
 * Fix Test User Organization ID
 *
 * This script ensures the test@example.com user has a valid orgId.
 * Run this after Phase 1 authentication setup to fix the session issue.
 *
 * Usage: npx tsx scripts/fix-test-user-orgid.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking test user organization status...\n');

  // Find test user
  const testUser = await prisma.users.findUnique({
    where: { email: 'test@example.com' },
    include: { organization: true },
  });

  if (!testUser) {
    console.log('❌ Test user (test@example.com) not found!');
    console.log('Please create a test user first.\n');
    process.exit(1);
  }

  console.log(`✅ Found test user: ${testUser.email}`);
  console.log(`   ID: ${testUser.id}`);
  console.log(`   Name: ${testUser.name}`);
  console.log(`   Role: ${testUser.role}`);
  console.log(`   Current orgId: ${testUser.orgId || 'NULL'}\n`);

  // Check if user already has an organization
  if (testUser.orgId && testUser.organization) {
    console.log('✅ User already has an organization:');
    console.log(`   Org ID: ${testUser.organization.id}`);
    console.log(`   Org Name: ${testUser.organization.name}\n`);
    console.log('✨ No fix needed! User is ready to go.\n');
    return;
  }

  // User needs an organization
  console.log('⚠️  User has no organization. Creating one...\n');

  // Check if any organization exists
  const existingOrg = await prisma.organization.findFirst();

  let orgId: string;

  if (existingOrg) {
    console.log(`✅ Found existing organization: ${existingOrg.name}`);
    console.log(`   Using org ID: ${existingOrg.id}\n`);
    orgId = existingOrg.id;
  } else {
    console.log('📦 No organizations exist. Creating "Test Organization"...\n');
    const newOrg = await prisma.organization.create({
      data: {
        name: 'Test Organization',
      },
    });
    console.log(`✅ Created organization: ${newOrg.name}`);
    console.log(`   Org ID: ${newOrg.id}\n`);
    orgId = newOrg.id;
  }

  // Update user with orgId
  console.log('🔧 Updating test user with organization...\n');
  const updatedUser = await prisma.users.update({
    where: { id: testUser.id },
    data: { orgId },
    include: { organization: true },
  });

  console.log('✅ Test user updated successfully!');
  console.log(`   Email: ${updatedUser.email}`);
  console.log(`   Org ID: ${updatedUser.orgId}`);
  console.log(`   Organization: ${updatedUser.organization?.name}\n`);

  console.log('🎉 FIX COMPLETE!\n');
  console.log('📋 NEXT STEPS:');
  console.log('   1. Sign out of the application');
  console.log('   2. Sign in again with test@example.com');
  console.log('   3. Try creating a pipeline - the error should be gone!\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
