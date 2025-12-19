import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Verification', () => {
    test('Auth Page should be responsive', async ({ page, isMobile }) => {
        await page.goto('/auth/signin');
        await page.waitForLoadState('networkidle');

        if (isMobile) {
            // In mobile layout, the aside/main should be full width
            const main = page.locator('main');
            const mainBox = await main.boundingBox();
            const viewport = page.viewportSize();

            if (mainBox && viewport) {
                // Main should take up most of the viewport width on mobile
                expect(mainBox.width).toBeGreaterThan(viewport.width * 0.8);
            }

            // Footer links should be visible
            await expect(page.locator('text=Privacy Policy')).toBeVisible();
        } else {
            // Desktop checks
            await expect(page.locator('text=Astralis One')).toBeVisible();
        }
    });

    test('Dashboard should be accessible (redirects to signin if not auth)', async ({ page }) => {
        await page.goto('/dashboard');
        // If not authenticated, should redirect to signin
        await expect(page).toHaveURL(/\/auth\/signin/);
    });
});
