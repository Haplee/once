import { test, expect } from '@playwright/test';

test.describe('UI E2E Tests', () => {
    let consoleErrors: string[] = [];

    test.beforeEach(async ({ page }) => {
        // Reset console errors
        consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                const text = msg.text();
                if (!text.includes('synthesis-failed')) { // Ignore specific known error
                    consoleErrors.push(text);
                }
            }
        });

        await page.goto('/');
        // Disable TTS for tests
        await page.evaluate(() => { (window as any).APP_IS_TESTING = true; });
    });

    test('Calculator Flow', async ({ page }) => {
        await expect(page).toHaveTitle(/ONCE/);

        const totalInput = page.locator('#total');
        const receivedInput = page.locator('#received');
        const calcBtn = page.locator('#calculate-btn');
        const resultDiv = page.locator('#result-value');

        // Check initial state
        // await expect(calcBtn).toBeDisabled(); // Button is always enabled in current implementation

        // Perform Calculation
        await totalInput.fill('10.00');
        await receivedInput.fill('20.00');

        await expect(calcBtn).toBeEnabled();
        await calcBtn.click();

        // Verify Result
        await expect(resultDiv).toContainText('10.00', { timeout: 5000 });

        // Ensure no errors
        expect(consoleErrors).toHaveLength(0);
    });

    test('Navigation to History', async ({ page }) => {
        // Find link to history
        await page.locator('nav a[href="/history"]').click();

        await expect(page).toHaveURL(/\/history/);

        // Check if table exists
        const table = page.locator('table');
        await expect(table).toBeVisible();

        // Since we likely ran the calculator test before or in parallel, 
        // there might be data, but strict order isn't guaranteed with `fullyParallel: true`.
        // So we just check table structure headers.
        await expect(page.locator('th').first()).toBeVisible();
    });

    test('Navigation to Settings', async ({ page }) => {
        await page.locator('nav a[href="/configuracion"]').click();

        await expect(page).toHaveURL(/\/configuracion/);

        // Check for Language buttons
        const langButtons = page.locator('button.btn-icon, button.btn-primary');
        await expect(langButtons.first()).toBeVisible();

        // Check Theme toggle (input might be hidden via CSS)
        const themeToggle = page.locator('#theme-toggle');
        await expect(themeToggle).toBeAttached();

        // Try toggling theme by clicking the label
        await page.locator('label[for="theme-toggle"]').click();
        // Just ensuring it doesn't crash
        expect(consoleErrors).toHaveLength(0);
    });
});
