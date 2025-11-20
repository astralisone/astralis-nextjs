import { test, expect } from '@playwright/test';

/**
 * Phase 1: Test User Login
 * Simple test to verify the manually created test user can sign in
 */

test.describe('Phase 1 - Test User Login', () => {
  const TEST_EMAIL = 'test@example.com';
  const TEST_PASSWORD = 'TestPass123';

  test('Test user can sign in successfully', async ({ page }) => {
    // Go to sign-in page
    await page.goto('/auth/signin');

    // Verify page loaded
    await expect(page.locator('h1')).toContainText('Welcome Back');

    // Fill in credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Click sign in button
    await page.click('button[type="submit"]');

    // Wait for navigation (should redirect away from sign-in)
    await page.waitForURL((url) => !url.pathname.includes('/auth/signin'), { timeout: 10000 });

    // Verify we're NOT on the sign-in or error page (successful login)
    expect(page.url()).not.toContain('/auth/signin');
    expect(page.url()).not.toContain('/auth/error');
  });

  test('Invalid password shows error', async ({ page }) => {
    // Go to sign-in page
    await page.goto('/auth/signin');

    // Fill in wrong password
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', 'WrongPassword123');

    // Click sign in
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
  });

  test('Invalid email shows error', async ({ page }) => {
    // Go to sign-in page
    await page.goto('/auth/signin');

    // Fill in non-existent email
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Click sign in
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
  });
});
