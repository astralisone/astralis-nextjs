import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

/**
 * Database Helper Functions for E2E Tests
 * Works with current Astralis schema (users table, password_reset_tokens)
 */

/**
 * Prisma client singleton for test database operations
 * Separate instance to avoid conflicts with application client
 */
class TestPrismaClient {
  private static instance: PrismaClient | null = null;
  
  static getInstance(): PrismaClient {
    if (!TestPrismaClient.instance) {
      TestPrismaClient.instance = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL
          }
        },
        log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error']
      });
    }
    return TestPrismaClient.instance;
  }
  
  static async disconnect(): Promise<void> {
    if (TestPrismaClient.instance) {
      await TestPrismaClient.instance.$disconnect();
      TestPrismaClient.instance = null;
    }
  }
}

/**
 * Get Prisma client for tests
 */
export function getTestPrisma(): PrismaClient {
  return TestPrismaClient.getInstance();
}

/**
 * Create a test user with hashed password
 * 
 * @param data - User data
 * @returns Created user with credentials
 */
export async function createTestUser(data: {
  email: string;
  password: string;
  name: string;
  role?: 'USER' | 'ADMIN' | 'AUTHOR' | 'EDITOR' | 'PM';
}) {
  const prisma = getTestPrisma();

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Generate unique ID
  const id = `test-user-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Create user
  const user = await prisma.users.create({
    data: {
      id,
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: (data.role || 'USER') as UserRole,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  console.log(`✓ Created test user: ${user.email} (${user.role})`);

  return {
    id: user.id,
    email: user.email,
    name: user.name || '',
    role: user.role,
    password: data.password // Return plain password for test login
  };
}

/**
 * Delete test user by ID
 * Cascade deletes related records
 * 
 * @param userId - User ID to delete
 */
export async function deleteTestUser(userId: string): Promise<void> {
  const prisma = getTestPrisma();

  try {
    // Prisma cascade delete will handle related records via schema constraints
    await prisma.users.delete({
      where: { id: userId }
    });

    console.log(`✓ Deleted test user: ${userId}`);
  } catch (error) {
    // User might already be deleted or not exist
    console.warn(`⚠ Could not delete user ${userId}:`, (error as Error).message);
  }
}

/**
 * Delete test user by email
 * 
 * @param email - User email
 */
export async function deleteTestUserByEmail(email: string): Promise<void> {
  const prisma = getTestPrisma();
  
  try {
    const user = await prisma.users.findUnique({ where: { email } });
    if (user) {
      await deleteTestUser(user.id);
    }
  } catch (error) {
    console.warn(`⚠ Could not delete user by email ${email}:`, (error as Error).message);
  }
}

/**
 * Get user by email
 * 
 * @param email - User email
 * @returns User or null
 */
export async function getUserByEmail(email: string) {
  const prisma = getTestPrisma();

  return await prisma.users.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      bio: true,
      company: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

/**
 * Get user by ID
 * 
 * @param userId - User ID
 * @returns User or null
 */
export async function getUserById(userId: string) {
  const prisma = getTestPrisma();

  return await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatar: true,
      bio: true,
      company: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

/**
 * Create password reset token for user
 * 
 * @param email - User email
 * @returns Reset token
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const prisma = getTestPrisma();

  // Get user
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  // Generate token
  const token = `reset-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Create token
  await prisma.password_reset_tokens.create({
    data: {
      id: `test-token-${Date.now()}`,
      token,
      userId: user.id,
      expiresAt,
      used: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  console.log(`✓ Created password reset token for ${email}`);

  return token;
}

/**
 * Get password reset token from database
 * 
 * @param token - Token string
 * @returns Token record or null
 */
export async function getPasswordResetToken(token: string) {
  const prisma = getTestPrisma();

  return await prisma.password_reset_tokens.findUnique({
    where: { token },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });
}

/**
 * Mark password reset token as used
 * 
 * @param token - Token string
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  const prisma = getTestPrisma();

  await prisma.password_reset_tokens.update({
    where: { token },
    data: {
      used: true,
      updatedAt: new Date()
    }
  });
}

/**
 * Delete password reset token
 * 
 * @param token - Token string
 */
export async function deletePasswordResetToken(token: string): Promise<void> {
  const prisma = getTestPrisma();

  try {
    await prisma.password_reset_tokens.delete({
      where: { token }
    });
  } catch (error) {
    console.warn(`⚠ Could not delete token ${token}:`, (error as Error).message);
  }
}

/**
 * Clean up all password reset tokens for user
 * 
 * @param userId - User ID
 */
export async function cleanupUserTokens(userId: string): Promise<void> {
  const prisma = getTestPrisma();

  await prisma.password_reset_tokens.deleteMany({
    where: { userId }
  });

  console.log(`✓ Cleaned up tokens for user ${userId}`);
}

/**
 * Delete expired password reset tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const prisma = getTestPrisma();

  const result = await prisma.password_reset_tokens.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true }
      ]
    }
  });

  console.log(`✓ Cleaned up ${result.count} expired/used tokens`);
}

/**
 * Cleanup all test users from database
 * Uses email pattern matching to identify test users
 */
export async function cleanupAllTestUsers(): Promise<void> {
  const prisma = getTestPrisma();

  const result = await prisma.users.deleteMany({
    where: {
      OR: [
        { email: { contains: '+test' } },
        { email: { contains: 'playwright-test' } },
        { name: { contains: 'Test User' } },
        { name: { contains: 'Admin User' } }
      ]
    }
  });

  console.log(`✓ Cleaned up ${result.count} test users`);
}

/**
 * Verify user password matches hash
 * 
 * @param userId - User ID
 * @param plainPassword - Plain text password
 * @returns True if password matches
 */
export async function verifyUserPassword(
  userId: string,
  plainPassword: string
): Promise<boolean> {
  const prisma = getTestPrisma();

  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { password: true }
  });

  if (!user) {
    return false;
  }

  return await bcrypt.compare(plainPassword, user.password);
}

/**
 * Update user password
 * 
 * @param userId - User ID
 * @param newPassword - New plain text password
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const prisma = getTestPrisma();
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.users.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      updatedAt: new Date()
    }
  });

  console.log(`✓ Updated password for user ${userId}`);
}

/**
 * Get database statistics for testing
 * 
 * @returns Object with table counts
 */
export async function getDatabaseStats() {
  const prisma = getTestPrisma();

  const [userCount, tokenCount] = await Promise.all([
    prisma.users.count(),
    prisma.password_reset_tokens.count()
  ]);

  return {
    users: userCount,
    passwordResetTokens: tokenCount
  };
}

/**
 * Disconnect Prisma client
 * Should be called in global teardown
 */
export async function disconnectTestDatabase(): Promise<void> {
  await TestPrismaClient.disconnect();
  console.log('✓ Test database disconnected');
}

/**
 * Cleanup function for test teardown
 * Removes all test data created during test run
 */
export async function cleanupTestData() {
  await cleanupAllTestUsers();
  await cleanupExpiredTokens();
  console.log('✓ Test data cleanup completed');
}

/**
 * Close database connection (alias for disconnect)
 */
export async function closeDatabase() {
  await disconnectTestDatabase();
}
