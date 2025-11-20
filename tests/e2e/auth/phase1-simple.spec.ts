import { test, expect } from '@playwright/test';
import { prisma } from '@/lib/prisma';

/**
 * Phase 1: Simple Authentication Tests
 * Tests basic auth flow without comprehensive coverage
 */

test.describe('Phase 1 Authentication - Simple Tests', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPass123';
  const testName = 'Test User';
  const testOrgName = 'Test Organization';

  // Cleanup after tests
  test.afterAll(async () => {
    try {
      await prisma.users.deleteMany({
        where: { email: testEmail }
      });
      await prisma.organization.deleteMany({
        where: { name: testOrgName }
      });
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  });

  test('1. Can create account via signup API', async ({ request }) => {
    const response = await request.post('/api/auth/signup', {
      data: {
        email: testEmail,
        password: testPassword,
        name: testName,
        orgName: testOrgName,
      }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('verify');
  });

  test('2. User exists in database after signup', async () => {
    const user = await prisma.users.findUnique({
      where: { email: testEmail },
      include: { organization: true }
    });

    expect(user).not.toBeNull();
    expect(user?.email).toBe(testEmail);
    expect(user?.name).toBe(testName);
    expect(user?.organization?.name).toBe(testOrgName);
    expect(user?.role).toBe('ADMIN');
    expect(user?.isActive).toBe(true);
  });

  test('3. Verification token exists in database', async () => {
    const token = await prisma.VerificationToken.findFirst({
      where: { identifier: testEmail }
    });

    expect(token).not.toBeNull();
    expect(token?.token).toBeTruthy();
    expect(token?.expires.getTime()).toBeGreaterThan(Date.now());
  });

  test('4. Can verify email with token', async ({ request }) => {
    // Get the token from database
    const tokenRecord = await prisma.VerificationToken.findFirst({
      where: { identifier: testEmail }
    });

    expect(tokenRecord).not.toBeNull();

    // Verify email
    const response = await request.post('/api/auth/verify-email', {
      data: { token: tokenRecord!.token }
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('5. User has emailVerified after verification', async () => {
    const user = await prisma.users.findUnique({
      where: { email: testEmail }
    });

    expect(user?.emailVerified).not.toBeNull();
  });

  test('6. Verification token deleted after use', async () => {
    const token = await prisma.VerificationToken.findFirst({
      where: { identifier: testEmail }
    });

    expect(token).toBeNull();
  });

  test('7. Sign in page loads', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.locator('h1')).toContainText('Welcome Back');
  });

  test('8. Sign up page loads', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('h1')).toContainText('Create Account');
  });

  test('9. Can navigate between auth pages', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.click('text=Sign up');
    await expect(page).toHaveURL('/auth/signup');

    await page.click('text=Sign in');
    await expect(page).toHaveURL('/auth/signin');
  });
});
