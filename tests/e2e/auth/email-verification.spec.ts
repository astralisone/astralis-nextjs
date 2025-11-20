import { test, expect } from '@playwright/test';
import { navigateToPage } from '../utils/test-helpers';
import { cleanupTestData } from '../utils/db-helpers';

/**
 * Email Verification E2E Tests
 * Tests email verification flow
 */

test.describe('Email Verification Flow', () => {
  test.afterEach(async () => {
    await cleanupTestData();
  });

  test('should display verification page', async ({ page }) => {
    await navigateToPage(page, '/auth/verify-email');
    
    await expect(page.getByRole('heading', { name: /verify.*email/i })).toBeVisible();
    await expect(page.locator('text=/check your email/i')).toBeVisible();
  });

  test('should verify email with valid token', async ({ page }) => {
    // TODO: Implement when email verification is ready
    // This test requires generating a verification token
    test.skip();
  });

  test('should show error for invalid token', async ({ page }) => {
    await navigateToPage(page, '/auth/verify-email?token=invalid-token');
    
    // Should show error message
    await expect(page.locator('text=/invalid.*token|verification failed/i')).toBeVisible();
  });

  test('should allow resending verification email', async ({ page }) => {
    await navigateToPage(page, '/auth/verify-email');
    
    const resendButton = page.getByRole('button', { name: /resend/i });
    await expect(resendButton).toBeVisible();
    
    await resendButton.click();
    
    // Should show success message
    await expect(page.locator('text=/email sent|verification email/i')).toBeVisible();
  });
});
