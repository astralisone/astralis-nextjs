import { Page, expect } from '@playwright/test';

/**
 * Test Helper Utilities
 * Common functions for E2E tests
 */

/**
 * Navigate to a page and wait for it to load
 */
export async function navigateToPage(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
}

/**
 * Fill form field by label
 */
export async function fillFormField(page: Page, label: string, value: string) {
  const input = page.getByLabel(label, { exact: false });
  await input.fill(value);
}

/**
 * Click button by text
 */
export async function clickButton(page: Page, text: string) {
  const button = page.getByRole('button', { name: text, exact: false });
  await button.click();
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: Page, message: string) {
  const toast = page.locator('[role="status"]', { hasText: message });
  await expect(toast).toBeVisible({ timeout: 5000 });
}

/**
 * Wait for error message
 */
export async function waitForError(page: Page, message: string) {
  const error = page.locator('[role="alert"]', { hasText: message });
  await expect(error).toBeVisible({ timeout: 5000 });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const authCookie = await page.context().cookies();
  return authCookie.some(cookie => 
    cookie.name.includes('session') || cookie.name.includes('auth')
  );
}

/**
 * Sign in helper
 */
export async function signIn(page: Page, email: string, password: string) {
  await navigateToPage(page, '/auth/signin');
  await fillFormField(page, 'Email', email);
  await fillFormField(page, 'Password', password);
  await clickButton(page, 'Sign In');
  await page.waitForLoadState('networkidle');
}

/**
 * Sign out helper
 */
export async function signOut(page: Page) {
  const signOutButton = page.getByRole('button', { name: /sign out|logout/i });
  await signOutButton.click();
  await page.waitForLoadState('networkidle');
}

/**
 * Generate random email
 */
export function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
}

/**
 * Generate random password
 */
export function generateTestPassword(): string {
  return `Test${Date.now()}!Pass`;
}

/**
 * Wait for navigation
 */
export async function waitForNavigation(page: Page, expectedPath: string) {
  await page.waitForURL(`**${expectedPath}`, { timeout: 10000 });
}

/**
 * Screenshot helper for debugging
 */
export async function takeDebugScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Wait for element to be visible
 */
export async function waitForElement(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  return (await page.locator(selector).count()) > 0;
}
