/**
 * Verify Session Fix
 *
 * This script verifies that the session structure is correct and all users
 * have valid organization IDs.
 *
 * Usage: npx tsx scripts/verify-session-fix.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
}

async function main() {
  console.log('🔍 SESSION FIX VERIFICATION\n');
  console.log('='.repeat(60));
  console.log();

  const results: CheckResult[] = [];

  // Check 1: NextAuth config callbacks
  console.log('1️⃣  Checking NextAuth configuration...');
  try {
    const authConfigPath = path.join(process.cwd(), 'src/lib/auth/config.ts');
    const authConfig = fs.readFileSync(authConfigPath, 'utf-8');

    const hasJwtOrgId = authConfig.includes('token.orgId = user.orgId') ||
                        authConfig.includes('token.orgId = dbUser.orgId');
    const hasSessionOrgId = authConfig.includes('session.user.orgId = token.orgId');

    if (hasJwtOrgId && hasSessionOrgId) {
      results.push({
        name: 'NextAuth Callbacks',
        status: 'PASS',
        message: 'jwt() and session() callbacks properly add orgId'
      });
    } else {
      results.push({
        name: 'NextAuth Callbacks',
        status: 'FAIL',
        message: 'Missing orgId in jwt() or session() callbacks'
      });
    }
  } catch (error) {
    results.push({
      name: 'NextAuth Callbacks',
      status: 'FAIL',
      message: `Error reading auth config: ${error}`
    });
  }

  // Check 2: TypeScript types
  console.log('2️⃣  Checking TypeScript type definitions...');
  try {
    const typesPath = path.join(process.cwd(), 'src/types/next-auth.d.ts');
    const types = fs.readFileSync(typesPath, 'utf-8');

    const hasSessionType = types.includes('orgId: string') &&
                          types.match(/interface\s+Session/);
    const hasUserType = types.match(/interface\s+User[\s\S]*?orgId:\s*string/);
    const hasJwtType = types.match(/interface\s+JWT[\s\S]*?orgId:\s*string/);

    if (hasSessionType && hasUserType && hasJwtType) {
      results.push({
        name: 'TypeScript Types',
        status: 'PASS',
        message: 'Session, User, and JWT interfaces include orgId'
      });
    } else {
      results.push({
        name: 'TypeScript Types',
        status: 'FAIL',
        message: 'Missing orgId in Session, User, or JWT interface'
      });
    }
  } catch (error) {
    results.push({
      name: 'TypeScript Types',
      status: 'FAIL',
      message: `Error reading type definitions: ${error}`
    });
  }

  // Check 3: Database - organizations exist
  console.log('3️⃣  Checking organizations in database...');
  try {
    const orgCount = await prisma.organization.count();

    if (orgCount > 0) {
      results.push({
        name: 'Organizations',
        status: 'PASS',
        message: `Found ${orgCount} organization(s) in database`
      });
    } else {
      results.push({
        name: 'Organizations',
        status: 'WARN',
        message: 'No organizations found - users cannot be assigned'
      });
    }
  } catch (error) {
    results.push({
      name: 'Organizations',
      status: 'FAIL',
      message: `Database error: ${error}`
    });
  }

  // Check 4: Database - users with orgId
  console.log('4️⃣  Checking users\' organization assignments...');
  try {
    const totalUsers = await prisma.users.count();
    const usersWithOrg = await prisma.users.count({
      where: { orgId: { not: null } }
    });
    const usersWithoutOrg = totalUsers - usersWithOrg;

    if (totalUsers === 0) {
      results.push({
        name: 'User Organization Assignment',
        status: 'WARN',
        message: 'No users found in database'
      });
    } else if (usersWithoutOrg === 0) {
      results.push({
        name: 'User Organization Assignment',
        status: 'PASS',
        message: `All ${totalUsers} user(s) have valid orgId`
      });
    } else {
      results.push({
        name: 'User Organization Assignment',
        status: 'FAIL',
        message: `${usersWithoutOrg} of ${totalUsers} user(s) missing orgId!`
      });

      // List users without orgId
      const orphanedUsers = await prisma.users.findMany({
        where: { orgId: null },
        select: { id: true, email: true, name: true }
      });

      console.log('\n   ⚠️  Users without organization:');
      orphanedUsers.forEach(user => {
        console.log(`      - ${user.email} (${user.name || 'No name'})`);
      });
      console.log();
    }
  } catch (error) {
    results.push({
      name: 'User Organization Assignment',
      status: 'FAIL',
      message: `Database error: ${error}`
    });
  }

  // Check 5: Test user specifically
  console.log('5️⃣  Checking test user (test@example.com)...');
  try {
    const testUser = await prisma.users.findUnique({
      where: { email: 'test@example.com' },
      include: { organization: true }
    });

    if (!testUser) {
      results.push({
        name: 'Test User',
        status: 'WARN',
        message: 'test@example.com not found (may not be needed)'
      });
    } else if (testUser.orgId && testUser.organization) {
      results.push({
        name: 'Test User',
        status: 'PASS',
        message: `Assigned to "${testUser.organization.name}"`
      });
    } else {
      results.push({
        name: 'Test User',
        status: 'FAIL',
        message: 'test@example.com has no organization! Run fix script.'
      });
    }
  } catch (error) {
    results.push({
      name: 'Test User',
      status: 'FAIL',
      message: `Database error: ${error}`
    });
  }

  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION RESULTS\n');

  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' :
                 result.status === 'FAIL' ? '❌' : '⚠️ ';

    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.message}\n`);

    if (result.status === 'PASS') passCount++;
    if (result.status === 'FAIL') failCount++;
    if (result.status === 'WARN') warnCount++;
  });

  console.log('='.repeat(60));
  console.log(`\n📈 Summary: ${passCount} passed, ${failCount} failed, ${warnCount} warnings\n`);

  if (failCount > 0) {
    console.log('❌ VERIFICATION FAILED');
    console.log('\n💡 Recommended fixes:');
    console.log('   1. Run: npx tsx scripts/fix-test-user-orgid.ts');
    console.log('   2. Review /docs/SESSION_STRUCTURE.md');
    console.log('   3. Ensure all users have organizations');
    console.log('   4. Sign out and sign in again after fixing\n');
    process.exit(1);
  } else if (warnCount > 0) {
    console.log('⚠️  VERIFICATION PASSED WITH WARNINGS');
    console.log('\n💡 Review warnings above and address if needed.\n');
  } else {
    console.log('✅ VERIFICATION PASSED');
    console.log('\n🎉 Session structure is correctly configured!');
    console.log('\n📋 Next steps:');
    console.log('   1. Sign out and sign in again');
    console.log('   2. Test creating a pipeline');
    console.log('   3. Test creating an intake request');
    console.log('   4. Verify no "Organization ID not found" errors\n');
  }
}

main()
  .catch((error) => {
    console.error('❌ Verification script error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
