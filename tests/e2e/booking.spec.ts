
import { test, expect } from '@playwright/test';

/**
 * End-to-end test for the Public Booking Flow.
 * Verifies that a guest can view availability, select a slot, and book a meeting.
 */
test.describe('Public Booking Flow', () => {
    const TEST_USER_ID = 'cmitads9w0000145vjcd36le3'; // Gregory A Starr (from DB check)
    const TEST_GUEST_EMAIL = `test-guest-${Date.now()}@example.com`;

    test('should successfully book a meeting as a guest', async ({ page }) => {
        // Navigate to the public booking page for the user
        await page.goto(`/book/${TEST_USER_ID}`);

        // 1. Verify page content
        await expect(page.getByRole('heading', { name: /Book with/i })).toBeVisible();
        await expect(page.getByText('Select a Date')).toBeVisible();

        // 2. Select an available date from the calendar
        // We look for a button in the calendar grid that is not disabled
        const availableDates = page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ });
        await expect(availableDates.first()).toBeVisible();

        // Choose the first available date
        await availableDates.first().click();

        // 3. Fill out the booking form
        await expect(page.getByText('Book Your Appointment')).toBeVisible();

        await page.fill('input[name="name"]', 'Playwright Test Guest');
        await page.fill('input[name="email"]', TEST_GUEST_EMAIL);
        await page.fill('input[name="phone"]', '+15551234567');

        // Select Meeting Type (Select primitive)
        await page.click('button#timeSlot');
        // Wait for the popup and select the first available slot
        await page.locator('role=option').first().click();

        // Select Meeting Type if needed (defaults to VIDEO_CALL)

        // Submit the form
        await page.click('button[type="submit"]');

        // 4. Verify success state
        // The component should transition to the success view defined in BookingPageClient.tsx
        await expect(page.getByText('Booking Confirmed!', { exact: false })).toBeVisible({ timeout: 15000 });
        await expect(page.getByText('Your meeting with Gregory A Starr has been scheduled successfully.')).toBeVisible();

        const bookingId = await page.locator('p.font-mono').textContent();
        console.log(`Successfully created booking: ${bookingId}`);

        expect(bookingId).toContain('booking_');
    });

    test('should show validation errors for empty form', async ({ page }) => {
        await page.goto(`/book/${TEST_USER_ID}`);

        // Select a date first to show the form
        const availableDates = page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ });
        await availableDates.first().click();

        // Try to submit without filling any fields
        await page.click('button[type="submit"]');

        // Verify error messages
        await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();
        await expect(page.getByText('Please enter a valid email address')).toBeVisible();
        await expect(page.getByText('Please select a time slot')).toBeVisible();
    });
});
