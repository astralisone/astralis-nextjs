#!/usr/bin/env tsx
/**
 * Create Test User Script
 * Creates a test user for development/seeding purposes
 */

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/utils/crypto';

const prisma = new PrismaClient();

async function createTestUser() {
  console.log('👤 Creating test user...');
  console.log('');

  try {
    // Check if user already exists
    const existing = await prisma.users.findUnique({
      where: { email: 'test@astralisone.com' },
    });

    if (existing) {
      console.log('✅ Test user already exists:');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Name: ${existing.name}`);
      console.log(`   Role: ${existing.role}`);
      console.log('');
      return existing;
    }

    // Create organization first
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
      console.log(`✅ Created: ${organization.name} (${organization.id})`);
    }

    // Hash the password
    const hashedPassword = await hashPassword('Test123!');

    // Create test user
    const user = await prisma.users.create({
      data: {
        email: 'test@astralisone.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
        orgId: organization.id,
      },
    });

    console.log('');
    console.log('🎉 Test user created successfully!');
    console.log('');
    console.log('✅ Login credentials:');
    console.log('   Email: test@astralisone.com');
    console.log('   Password: Test123!');
    console.log('   Role: ADMIN');
    console.log(`   Organization: ${organization.name}`);
    console.log('');

    return user;
  } catch (error) {
    console.error('❌ Failed to create test user:');
    console.error(error);
    throw error;
  }
}

createTestUser()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
