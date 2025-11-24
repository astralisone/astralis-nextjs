'use server';

import { prisma } from '@/lib/prisma';
import type { QueryState } from '@/components/debug/DbQueryRunner';

export async function runQueryAction(state: QueryState, formData: FormData): Promise<QueryState> {
  const query = formData.get('query') as string;

  if (!query || query.trim().length === 0) {
    return {
      status: 'error',
      message: 'Query cannot be empty.',
    };
  }

  // Basic safety check - only allow SELECT queries
  const normalizedQuery = query.trim().toUpperCase();
  if (!normalizedQuery.startsWith('SELECT')) {
    return {
      status: 'error',
      message: 'Only SELECT queries are allowed for safety.',
    };
  }

  try {
    const result = await prisma.$queryRawUnsafe(query);
    return {
      status: 'success',
      message: `Query executed successfully. Returned ${Array.isArray(result) ? result.length : 0} rows.`,
      rows: Array.isArray(result) ? (result as Record<string, unknown>[]) : [],
    };
  } catch (error) {
    console.error('[runQueryAction] Query failed:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred.',
    };
  }
}

export async function resetDatabaseAction(): Promise<QueryState> {
  try {
    // Drop all tables
    await prisma.$executeRawUnsafe(`
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END DO $$;
    `);

    // Run migrations (simplified - in real app you'd use proper migration runner)
    // For now, just recreate basic tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS organization (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        role TEXT DEFAULT 'CLIENT',
        email_verified TIMESTAMP,
        org_id TEXT REFERENCES organization(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS verification_token (
        identifier TEXT NOT NULL,
        token TEXT PRIMARY KEY,
        expires TIMESTAMP NOT NULL
      );
    `);

    return {
      status: 'success',
      message: 'Database reset successfully. Basic tables recreated.',
    };
  } catch (error) {
    console.error('[resetDatabaseAction] Reset failed:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to reset database.',
    };
  }
}

export async function getConnectionStatusAction(): Promise<QueryState> {
  try {
    const result = await prisma.$queryRawUnsafe('SELECT NOW() as current_time, version() as postgres_version');
    const row = Array.isArray(result) && result.length > 0 ? result[0] as Record<string, unknown> : null;

    return {
      status: 'success',
      message: `Connected to PostgreSQL. Current time: ${row?.current_time || 'unknown'}`,
      rows: row ? [row] : [],
    };
  } catch (error) {
    console.error('[getConnectionStatusAction] Connection check failed:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to connect to database.',
    };
  }
}

export async function getTableCountsAction(): Promise<QueryState> {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT
        schemaname,
        tablename as table_name,
        n_tup_ins - n_tup_del as count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    return {
      status: 'success',
      message: `Found ${Array.isArray(result) ? result.length : 0} tables.`,
      rows: Array.isArray(result) ? (result as Record<string, unknown>[]) : [],
    };
  } catch (error) {
    console.error('[getTableCountsAction] Table count query failed:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to get table counts.',
    };
  }
}
