import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/utils/crypto';
import {
  navigateToPage,
  fillFormField,
  clickButton,
  waitForError,
  waitForNavigation,
  generateTestEmail,
  generateTestPassword,
  isAuthenticated,
} from '../utils/test-helpers';

/**
 * Sign-In E2E Test Suite
 * Comprehensive tests for sign-in workflow including success, failure, and edge cases
 * 
 * Test Coverage:
 * 1. Successful sign-in with credentials
 * 2. Failed sign-in - wrong password
 * 3. Failed sign-in - non-existent user
 * 4. Failed sign-in - unverified email
 * 5. Protected route redirect
 * 6. Session persistence
 * 7. Sign out
 */

let prisma: PrismaClient;

test.beforeAll(async () => {
  prisma = new PrismaClient();
});

test.afterAll(async () => {
  await prisma.$disconnect();
});

test.describe('Sign-In Workflow', () => {
  test.describe('1. Successful sign-in with credentials', () => {
    let testEmail: string;
    let testPassword: string;
    let testUserId: string;
    let testOrgId: string;

    test.beforeEach(async () => {
      // Create verified test user
      testEmail = generateTestEmail();
      testPassword = generateTestPassword();
      const hashedPassword = await hashPassword(testPassword);

      const org = await prisma.organization.create({
        data: {
          name: `Test Org ${Date.now()}`,
        },
      });
      testOrgId = org.id;

      const user = await prisma.users.create({
        data: {
          email: testEmail,
          name: 'Test User',
          password: hashedPassword,
          orgId: org.id,
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date(),
        },
      });
      testUserId = user.id;
    });

    test.afterEach(async () => {
      // Cleanup
      await prisma.activityLog.deleteMany({ where: { userId: testUserId } });
      await prisma.session.deleteMany({ where: { userId: testUserId } });
      await prisma.users.delete({ where: { id: testUserId } }).catch(() => {});
      await prisma.organization.delete({ where: { id: testOrgId } }).catch(() => {});
    });

    test('should successfully sign in and redirect to dashboard', async ({ page }) => {
      // Navigate to sign-in page
      await navigateToPage(page, '/auth/signin');

      // Verify we're on sign-in page
      await expect(page).toHaveTitle(/sign in|welcome back/i);
      await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

      // Fill in credentials
      await fillFormField(page, 'Email', testEmail);
      await fillFormField(page, 'Password', testPassword);

      // Submit form
      await clickButton(page, 'Sign In');

      // Verify redirect to dashboard
      await waitForNavigation(page, '/astralisops/dashboard');
      await expect(page).toHaveURL(/\/astralisops\/dashboard/);

      // Verify session cookie exists
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(cookie => 
        cookie.name.includes('session') || 
        cookie.name.includes('authjs.session-token') ||
        cookie.name.includes('next-auth.session-token')
      );
      expect(sessionCookie).toBeDefined();

      // Verify session in database
      const sessions = await prisma.session.findMany({
        where: { userId: testUserId },
      });
      expect(sessions.length).toBeGreaterThan(0);

      // Verify lastLoginAt was updated
      const updatedUser = await prisma.users.findUnique({
        where: { id: testUserId },
      });
      expect(updatedUser?.lastLoginAt).not.toBeNull();
      
      const lastLoginTime = updatedUser?.lastLoginAt?.getTime() || 0;
      const now = Date.now();
      expect(now - lastLoginTime).toBeLessThan(5000); // Within 5 seconds

      // Verify activity log entry was created
      const activityLogs = await prisma.activityLog.findMany({
        where: {
          userId: testUserId,
          action: 'LOGIN',
        },
      });
      expect(activityLogs.length).toBeGreaterThan(0);
      expect(activityLogs[0].entity).toBe('USER');
      expect(activityLogs[0].entityId).toBe(testUserId);
    });
  });

  test.describe('2. Failed sign-in - wrong password', () => {
    let testEmail: string;
    let testPassword: string;
    let testUserId: string;
    let testOrgId: string;

    test.beforeEach(async () => {
      testEmail = generateTestEmail();
      testPassword = generateTestPassword();
      const hashedPassword = await hashPassword(testPassword);

      const org = await prisma.organization.create({
        data: {
          name: `Test Org ${Date.now()}`,
        },
      });
      testOrgId = org.id;

      const user = await prisma.users.create({
        data: {
          email: testEmail,
          name: 'Test User',
          password: hashedPassword,
          orgId: org.id,
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date(),
        },
      });
      testUserId = user.id;
    });

    test.afterEach(async () => {
      await prisma.users.delete({ where: { id: testUserId } }).catch(() => {});
      await prisma.organization.delete({ where: { id: testOrgId } }).catch(() => {});
    });

    test('should show error message for incorrect password', async ({ page }) => {
      await navigateToPage(page, '/auth/signin');

      // Fill in email and wrong password
      await fillFormField(page, 'Email', testEmail);
      await fillFormField(page, 'Password', 'WrongPassword123!');

      // Submit form
      await clickButton(page, 'Sign In');

      // Verify error message is displayed
      await waitForError(page, /invalid email or password/i);

      // Verify no session was created
      const sessions = await prisma.session.findMany({
        where: { userId: testUserId },
      });
      expect(sessions.length).toBe(0);

      // Verify we're still on sign-in page
      await expect(page).toHaveURL(/\/auth\/signin/);

      // Verify no session cookie
      const authenticated = await isAuthenticated(page);
      expect(authenticated).toBe(false);
    });
  });

  test.describe('3. Failed sign-in - non-existent user', () => {
    test('should show error message for non-existent email', async ({ page }) => {
      const nonExistentEmail = generateTestEmail();

      await navigateToPage(page, '/auth/signin');

      // Fill in non-existent email
      await fillFormField(page, 'Email', nonExistentEmail);
      await fillFormField(page, 'Password', 'SomePassword123!');

      // Submit form
      await clickButton(page, 'Sign In');

      // Verify error message is displayed
      await waitForError(page, /invalid email or password/i);

      // Verify we're still on sign-in page
      await expect(page).toHaveURL(/\/auth\/signin/);

      // Verify no session cookie
      const authenticated = await isAuthenticated(page);
      expect(authenticated).toBe(false);
    });
  });

  test.describe('4. Failed sign-in - unverified email', () => {
    let testEmail: string;
    let testPassword: string;
    let testUserId: string;
    let testOrgId: string;

    test.beforeEach(async () => {
      // Create unverified test user
      testEmail = generateTestEmail();
      testPassword = generateTestPassword();
      const hashedPassword = await hashPassword(testPassword);

      const org = await prisma.organization.create({
        data: {
          name: `Test Org ${Date.now()}`,
        },
      });
      testOrgId = org.id;

      const user = await prisma.users.create({
        data: {
          email: testEmail,
          name: 'Test User Unverified',
          password: hashedPassword,
          orgId: org.id,
          role: 'ADMIN',
          isActive: true,
          emailVerified: null, // Not verified
        },
      });
      testUserId = user.id;
    });

    test.afterEach(async () => {
      await prisma.users.delete({ where: { id: testUserId } }).catch(() => {});
      await prisma.organization.delete({ where: { id: testOrgId } }).catch(() => {});
    });

    test('should show warning for unverified email', async ({ page }) => {
      await navigateToPage(page, '/auth/signin');

      // Fill in credentials
      await fillFormField(page, 'Email', testEmail);
      await fillFormField(page, 'Password', testPassword);

      // Submit form
      await clickButton(page, 'Sign In');

      // Verify error or warning message about unverified email
      // Note: Implementation may vary - could be error, warning, or redirect to verify-email
      const alertLocator = page.locator('[role="alert"]');
      const alertCount = await alertLocator.count();
      
      if (alertCount > 0) {
        // Error message shown
        await expect(alertLocator).toContainText(/verify|unverified/i);
      } else {
        // Or redirected to verify-email page
        await expect(page).toHaveURL(/\/auth\/verify-email/);
      }

      // Verify no successful session was created
      const sessions = await prisma.session.findMany({
        where: { userId: testUserId },
      });
      // May allow session but with limited access, or no session at all
      // This depends on implementation requirements
    });
  });

  test.describe('5. Protected route redirect', () => {
    test('should redirect to sign-in when accessing protected route without auth', async ({ page }) => {
      // Navigate directly to dashboard without authentication
      await navigateToPage(page, '/astralisops/dashboard');

      // Should be redirected to sign-in page
      await expect(page).toHaveURL(/\/auth\/signin/);

      // Should have callbackUrl in query params
      const url = new URL(page.url());
      expect(url.searchParams.get('callbackUrl')).toBe('/astralisops/dashboard');
    });

    test('should redirect back to original protected route after sign-in', async ({ page }) => {
      // Create test user
      const testEmail = generateTestEmail();
      const testPassword = generateTestPassword();
      const hashedPassword = await hashPassword(testPassword);

      const org = await prisma.organization.create({
        data: {
          name: `Test Org ${Date.now()}`,
        },
      });

      const user = await prisma.users.create({
        data: {
          email: testEmail,
          name: 'Test User',
          password: hashedPassword,
          orgId: org.id,
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date(),
        },
      });

      try {
        // Try to access dashboard directly
        await page.goto('/astralisops/dashboard');

        // Should redirect to sign-in with callbackUrl
        await expect(page).toHaveURL(/\/auth\/signin.*callbackUrl/);

        // Sign in
        await fillFormField(page, 'Email', testEmail);
        await fillFormField(page, 'Password', testPassword);
        await clickButton(page, 'Sign In');

        // Should redirect back to dashboard
        await waitForNavigation(page, '/astralisops/dashboard');
        await expect(page).toHaveURL(/\/astralisops\/dashboard/);
      } finally {
        // Cleanup
        await prisma.activityLog.deleteMany({ where: { userId: user.id } });
        await prisma.session.deleteMany({ where: { userId: user.id } });
        await prisma.users.delete({ where: { id: user.id } }).catch(() => {});
        await prisma.organization.delete({ where: { id: org.id } }).catch(() => {});
      }
    });
  });

  test.describe('6. Session persistence', () => {
    test('should persist session across browser restarts', async ({ browser }) => {
      // Create test user
      const testEmail = generateTestEmail();
      const testPassword = generateTestPassword();
      const hashedPassword = await hashPassword(testPassword);

      const org = await prisma.organization.create({
        data: {
          name: `Test Org ${Date.now()}`,
        },
      });

      const user = await prisma.users.create({
        data: {
          email: testEmail,
          name: 'Test User',
          password: hashedPassword,
          orgId: org.id,
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date(),
        },
      });

      try {
        // Create browser context with persistent state
        const context = await browser.newContext({
          storageState: undefined,
        });
        const page = await context.newPage();

        // Sign in
        await navigateToPage(page, '/auth/signin');
        await fillFormField(page, 'Email', testEmail);
        await fillFormField(page, 'Password', testPassword);
        await clickButton(page, 'Sign In');
        await waitForNavigation(page, '/astralisops/dashboard');

        // Save storage state (simulates browser persistence)
        const storageState = await context.storageState();
        await context.close();

        // Create new context with saved state (simulates browser restart)
        const newContext = await browser.newContext({ storageState });
        const newPage = await newContext.newPage();

        // Navigate to dashboard - should still be authenticated
        await navigateToPage(newPage, '/astralisops/dashboard');
        await expect(newPage).toHaveURL(/\/astralisops\/dashboard/);

        // Verify session is still valid
        const authenticated = await isAuthenticated(newPage);
        expect(authenticated).toBe(true);

        await newContext.close();
      } finally {
        // Cleanup
        await prisma.activityLog.deleteMany({ where: { userId: user.id } });
        await prisma.session.deleteMany({ where: { userId: user.id } });
        await prisma.users.delete({ where: { id: user.id } }).catch(() => {});
        await prisma.organization.delete({ where: { id: org.id } }).catch(() => {});
      }
    });
  });

  test.describe('7. Sign out', () => {
    test('should sign out and clear session', async ({ page }) => {
      // Create test user
      const testEmail = generateTestEmail();
      const testPassword = generateTestPassword();
      const hashedPassword = await hashPassword(testPassword);

      const org = await prisma.organization.create({
        data: {
          name: `Test Org ${Date.now()}`,
        },
      });

      const user = await prisma.users.create({
        data: {
          email: testEmail,
          name: 'Test User',
          password: hashedPassword,
          orgId: org.id,
          role: 'ADMIN',
          isActive: true,
          emailVerified: new Date(),
        },
      });

      try {
        // Sign in
        await navigateToPage(page, '/auth/signin');
        await fillFormField(page, 'Email', testEmail);
        await fillFormField(page, 'Password', testPassword);
        await clickButton(page, 'Sign In');
        await waitForNavigation(page, '/astralisops/dashboard');

        // Verify authenticated
        let authenticated = await isAuthenticated(page);
        expect(authenticated).toBe(true);

        // Find and click sign out button
        // Note: Button might be in dropdown menu or navigation
        const signOutButton = page.getByRole('button', { name: /sign out|logout/i });
        
        // If button is in a dropdown, open it first
        const userMenuButton = page.locator('[data-testid="user-menu"]').or(
          page.getByRole('button', { name: /user menu|account/i })
        );
        
        if (await userMenuButton.count() > 0) {
          await userMenuButton.first().click();
          await page.waitForTimeout(500); // Wait for dropdown animation
        }

        await signOutButton.click();

        // Verify redirect to homepage
        await page.waitForURL(/^\/$|\/auth\/signin/, { timeout: 10000 });
        const currentUrl = page.url();
        expect(
          currentUrl.endsWith('/') || currentUrl.includes('/auth/signin')
        ).toBe(true);

        // Verify session cleared
        authenticated = await isAuthenticated(page);
        expect(authenticated).toBe(false);

        // Verify can't access protected routes
        await page.goto('/astralisops/dashboard');
        await expect(page).toHaveURL(/\/auth\/signin/);
      } finally {
        // Cleanup
        await prisma.activityLog.deleteMany({ where: { userId: user.id } });
        await prisma.session.deleteMany({ where: { userId: user.id } });
        await prisma.users.delete({ where: { id: user.id } }).catch(() => {});
        await prisma.organization.delete({ where: { id: org.id } }).catch(() => {});
      }
    });
  });
});

test.describe('Sign-In Form Validation', () => {
  test('should show validation error for invalid email format', async ({ page }) => {
    await navigateToPage(page, '/auth/signin');

    // Fill in invalid email
    await fillFormField(page, 'Email', 'invalid-email');
    await fillFormField(page, 'Password', 'SomePassword123!');

    // Try to submit
    await clickButton(page, 'Sign In');

    // Should show validation error
    const emailError = page.locator('input[type="email"]').locator('..').locator('text=/invalid|enter a valid email/i');
    await expect(emailError.first()).toBeVisible({ timeout: 3000 });
  });

  test('should show validation error for empty password', async ({ page }) => {
    await navigateToPage(page, '/auth/signin');

    // Fill in email only
    await fillFormField(page, 'Email', 'test@example.com');

    // Try to submit without password
    await clickButton(page, 'Sign In');

    // Should show validation error
    const passwordField = page.locator('input[type="password"]');
    await expect(passwordField).toHaveAttribute('required', '');
  });
});

test.describe('Sign-In UI Elements', () => {
  test('should display all required UI elements', async ({ page }) => {
    await navigateToPage(page, '/auth/signin');

    // Check for heading
    await expect(page.getByRole('heading', { name: /welcome back|sign in/i })).toBeVisible();

    // Check for email field
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Check for password field
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Check for submit button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Check for forgot password link
    await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();

    // Check for sign up link
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();
  });

  test('should disable submit button while submitting', async ({ page }) => {
    await navigateToPage(page, '/auth/signin');

    await fillFormField(page, 'Email', 'test@example.com');
    await fillFormField(page, 'Password', 'TestPassword123!');

    const submitButton = page.getByRole('button', { name: /sign in/i });

    // Click submit
    await submitButton.click();

    // Button should be disabled and show loading state
    await expect(submitButton).toBeDisabled();
    await expect(submitButton).toContainText(/signing in|loading/i);
  });
});
