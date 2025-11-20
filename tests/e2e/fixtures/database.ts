import { PrismaClient } from '@prisma/client';

/**
 * Database Utilities for E2E Tests
 * Provides helper functions for test database operations
 */

export class DatabaseFixture {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Clean up test data after test execution
   */
  async cleanup() {
    // Delete test users (identified by test email pattern)
    await this.prisma.user.deleteMany({
      where: {
        email: {
          contains: '@test.com',
        },
      },
    });

    // Delete test organizations
    await this.prisma.organization.deleteMany({
      where: {
        name: {
          startsWith: 'Test Org',
        },
      },
    });
  }

  /**
   * Create test organization
   */
  async createTestOrganization(name?: string) {
    return await this.prisma.organization.create({
      data: {
        name: name || `Test Org ${Date.now()}`,
      },
    });
  }

  /**
   * Create test user
   */
  async createTestUser(data: {
    email: string;
    name: string;
    orgId: string;
    role?: 'ADMIN' | 'OPERATOR' | 'CLIENT';
  }) {
    return await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        orgId: data.orgId,
        role: data.role || 'CLIENT',
      },
    });
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
  }

  /**
   * Delete user by email
   */
  async deleteUserByEmail(email: string) {
    return await this.prisma.user.delete({
      where: { email },
    });
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export const db = new DatabaseFixture();
