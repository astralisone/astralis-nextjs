import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createTestUser, deleteTestUser, createPasswordResetToken } from '../utils/db-helpers';
import { generateRandomEmail, generateRandomPassword } from '../utils/test-helpers';

/**
 * Extended test context with authenticated user
 * 
 * This fixture provides:
 * - testUser: Regular user account for testing
 * - adminUser: Admin user account for testing
 * - authenticatedPage: Pre-authenticated page instance
 */
export interface AuthFixtures {
  /**
   * Authenticated page with valid session
   * User is automatically logged in before each test
   */
  authenticatedPage: Page;
  
  /**
   * Test user credentials
   */
  testUser: {
    id: string;
    email: string;
    password: string;
    name: string;
  };
  
  /**
   * Admin user session
   */
  adminUser: {
    id: string;
    email: string;
    password: string;
    name: string;
  };
}

/**
 * Custom Playwright test with authentication fixtures
 * 
 * Usage:
 * ```typescript
 * test('should access protected page', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/dashboard');
 *   await expect(authenticatedPage).toHaveURL('/dashboard');
 * });
 * ```
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Test user fixture - creates a regular user before test and cleans up after
   */
  testUser: async ({}, use) => {
    const email = generateRandomEmail();
    const password = generateRandomPassword();
    const name = `Test User ${Date.now()}`;
    
    console.log(`🔧 Creating test user: ${email}`);
    
    // Create test user in database
    const user = await createTestUser({
      email,
      password,
      name,
      role: 'USER'
    });
    
    await use({
      id: user.id,
      email,
      password,
      name
    });
    
    // Cleanup: Delete test user after test completes
    console.log(`🧹 Cleaning up test user: ${email}`);
    await deleteTestUser(user.id);
  },

  /**
   * Admin user fixture - creates an admin user before test and cleans up after
   */
  adminUser: async ({}, use) => {
    const email = generateRandomEmail('admin');
    const password = generateRandomPassword();
    const name = `Admin User ${Date.now()}`;
    
    console.log(`🔧 Creating admin user: ${email}`);
    
    // Create admin user in database
    const user = await createTestUser({
      email,
      password,
      name,
      role: 'ADMIN'
    });
    
    await use({
      id: user.id,
      email,
      password,
      name
    });
    
    // Cleanup: Delete admin user after test completes
    console.log(`🧹 Cleaning up admin user: ${email}`);
    await deleteTestUser(user.id);
  },

  /**
   * Authenticated page fixture - provides a page with active session
   * Automatically logs in the test user before tests run
   */
  authenticatedPage: async ({ page, testUser }, use) => {
    console.log(`🔐 Logging in test user: ${testUser.email}`);
    
    // Navigate to login page
    await page.goto('/auth/signin');
    
    // Fill in login form
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="password"]', testUser.password);
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to complete
    await page.waitForURL(/\/(dashboard|home|profile)/, {
      timeout: 10000
    });
    
    // Verify authentication succeeded
    const isAuthenticated = await page.evaluate(() => {
      return document.cookie.includes('next-auth') || 
             document.cookie.includes('session') ||
             localStorage.getItem('authToken') !== null;
    });
    
    if (!isAuthenticated) {
      throw new Error('Failed to authenticate test user');
    }
    
    console.log(`✅ Test user authenticated successfully`);
    
    await use(page);
  }
});

/**
 * Helper: Create authenticated context for API testing
 * 
 * @param page - Playwright page instance
 * @param credentials - User credentials
 * @returns Authentication headers
 */
export async function getAuthHeaders(
  page: Page,
  credentials: { email: string; password: string }
): Promise<Record<string, string>> {
  // Login and capture session cookie
  const response = await page.request.post('/api/auth/signin', {
    data: {
      email: credentials.email,
      password: credentials.password
    }
  });
  
  if (!response.ok()) {
    throw new Error(`Authentication failed: ${response.status()}`);
  }
  
  const cookies = await page.context().cookies();
  const sessionCookie = cookies.find(c => 
    c.name.includes('next-auth') || c.name.includes('session')
  );
  
  if (!sessionCookie) {
    throw new Error('No session cookie found');
  }
  
  return {
    'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
  };
}

/**
 * Helper: Login programmatically without UI
 * 
 * @param page - Playwright page instance
 * @param email - User email
 * @param password - User password
 */
export async function loginUser(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  const response = await page.request.post('/api/auth/signin', {
    data: { email, password }
  });
  
  if (!response.ok()) {
    const errorText = await response.text();
    throw new Error(`Login failed: ${response.status()} ${errorText}`);
  }
  
  // Store session in browser context
  const setCookieHeader = response.headers()['set-cookie'];
  if (setCookieHeader) {
    const cookies = Array.isArray(setCookieHeader) 
      ? setCookieHeader 
      : [setCookieHeader];
      
    for (const cookie of cookies) {
      const [nameValue, ...attributes] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      
      await page.context().addCookies([{
        name: name.trim(),
        value: value?.trim() || '',
        domain: 'localhost',
        path: '/'
      }]);
    }
  }
}

/**
 * Helper: Logout current user
 * 
 * @param page - Playwright page instance
 */
export async function logoutUser(page: Page): Promise<void> {
  try {
    await page.goto('/api/auth/signout', { timeout: 5000 });
    await page.waitForURL('/auth/signin', { timeout: 5000 });
  } catch (error) {
    // Fallback: clear cookies manually
    const context = page.context();
    await context.clearCookies();
  }
}

/**
 * Helper: Create password reset token for testing
 * 
 * @param email - User email
 * @returns Reset token
 */
export async function createTestPasswordResetToken(email: string): Promise<string> {
  return await createPasswordResetToken(email);
}

/**
 * Helper: Verify user session is active
 * 
 * @param page - Playwright page instance
 * @returns True if user has active session
 */
export async function hasActiveSession(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  const hasSessionCookie = cookies.some(c => 
    c.name.includes('next-auth') || c.name.includes('session')
  );
  
  if (!hasSessionCookie) {
    return false;
  }
  
  // Try to access protected endpoint
  try {
    const response = await page.request.get('/api/auth/session');
    return response.ok();
  } catch {
    return false;
  }
}

/**
 * Helper: Create multiple test users for batch testing
 * 
 * @param count - Number of users to create
 * @param role - User role (default: USER)
 * @returns Array of created user credentials
 */
export async function createTestUsers(
  count: number,
  role: 'USER' | 'ADMIN' | 'AUTHOR' | 'EDITOR' = 'USER'
): Promise<Array<{ id: string; email: string; password: string; name: string }>> {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    const email = generateRandomEmail();
    const password = generateRandomPassword();
    const name = `Test User ${i + 1} ${Date.now()}`;
    
    const user = await createTestUser({
      email,
      password,
      name,
      role
    });
    
    users.push({
      id: user.id,
      email,
      password,
      name
    });
  }
  
  return users;
}

/**
 * Helper: Cleanup multiple test users
 * 
 * @param userIds - Array of user IDs to delete
 */
export async function cleanupTestUsers(userIds: string[]): Promise<void> {
  for (const userId of userIds) {
    await deleteTestUser(userId);
  }
}

export { expect } from '@playwright/test';
