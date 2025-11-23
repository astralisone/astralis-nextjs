const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPassword() {
  try {
    const user = await prisma.users.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✓ User found:', user.email);
    console.log('  Password hash:', user.password.substring(0, 20) + '...');

    const testPassword = 'TestPass123';
    const isValid = await bcrypt.compare(testPassword, user.password);

    console.log('\nPassword test:');
    console.log('  Input:', testPassword);
    console.log('  Valid:', isValid ? '✅ YES' : '❌ NO');

    if (!isValid) {
      console.log('\n❌ Password does not match! This is why login is failing.');
    } else {
      console.log('\n✅ Password matches! Issue must be elsewhere.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();
