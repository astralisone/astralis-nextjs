const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('⚠️  Test user already exists');
      console.log('  Email: test@example.com');
      console.log('  User ID:', existingUser.id);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('TestPass123', 12);

    // Create organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Organization',
      }
    });

    console.log('✓ Created organization:', org.id);

    // Create user
    const user = await prisma.users.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'ADMIN',
        orgId: org.id,
        isActive: true,
      }
    });

    console.log('✓ Created user:', user.id);
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Org:', user.orgId);

    // Create verification token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.VerificationToken.create({
      data: {
        identifier: user.email,
        token: token,
        expires: tokenExpiry,
      }
    });

    console.log('✓ Created verification token');
    console.log('  Token:', token);

    console.log('\n✅ Test user created successfully!');
    console.log('\nLogin credentials:');
    console.log('  Email: test@example.com');
    console.log('  Password: TestPass123');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
