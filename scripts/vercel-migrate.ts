/**
 * Manual Vercel Migration and Seed Script
 *
 * This script connects to the Vercel database and runs:
 * 1. Prisma migrations (deploy)
 * 2. Database seeds
 * 3. Pipeline seeds
 * 4. Template seeds
 *
 * Usage: npx tsx scripts/vercel-migrate.ts
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting manual Vercel migration and seeding...\n');

  try {
    // 1. Check database connection
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // 2. Check current migration status
    console.log('📊 Checking migration status...');
    try {
      const migrationStatus = execSync('npx prisma migrate status', { encoding: 'utf8' });
      console.log('Migration status:');
      console.log(migrationStatus);
    } catch (statusError) {
      console.log('⚠️ Could not check migration status:', statusError.message);
    }

    // 3. Apply migrations
    console.log('🗄️ Running Prisma migrations...');
    const migrateOutput = execSync('npx prisma migrate deploy', { encoding: 'utf8' });
    console.log('Migration output:');
    console.log(migrateOutput);

    // 4. Generate Prisma client
    console.log('🔄 Generating Prisma client...');
    execSync('npx prisma generate');
    console.log('✅ Prisma client generated\n');

    // 5. Run main seed
    console.log('🌱 Running main database seed...');
    execSync('node prisma/seed.js');
    console.log('✅ Main seed completed\n');

    // 6. Run pipeline seeds
    console.log('📋 Running pipeline seeds...');
    execSync('npx tsx prisma/seeds/pipelines.seed.ts');
    console.log('✅ Pipeline seeds completed\n');

    // 7. Run template seeds
    console.log('📝 Running template seeds...');
    execSync('npx tsx prisma/seeds/task-templates.seed.ts');
    console.log('✅ Template seeds completed\n');

    // 8. Verify integration credentials table
    console.log('🔍 Verifying integration credentials table...');
    const tableCheck = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'integration_credentials'
      AND table_schema = 'public'
      ORDER BY ordinal_position
    `;
    console.log('Integration credentials columns:');
    console.log(tableCheck);

    // 9. Check if credentials exist
    const credentialCount = await prisma.integrationCredential.count();
    console.log(`📊 Found ${credentialCount} integration credentials\n`);

    console.log('🎉 Manual migration and seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Database connected');
    console.log('   ✅ Migrations applied');
    console.log('   ✅ Seeds executed');
    console.log('   ✅ Integration credentials table verified');
    console.log(`   📊 Credentials found: ${credentialCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check DATABASE_URL environment variable');
    console.error('   2. Verify database permissions');
    console.error('   3. Check network connectivity');
    console.error('   4. Ensure Vercel database allows connections');
    process.exit(1);
  }
}

main()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });