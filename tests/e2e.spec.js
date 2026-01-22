// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Once App E2E Tests', () => {
  let consoleErrors = [];

  test.beforeEach(async ({ page }) => {
    // Reset console errors before each test
    consoleErrors = [];

    // Listen for all console events and capture errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        // Ignore known, non-critical errors from the CI environment
        if (errorText.includes('synthesis-failed')) {
          return;
        }
        consoleErrors.push(errorText);
      }
    });

    // Navigate to the local server hosting the app
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    // Set a flag to disable speech synthesis during tests to avoid CI errors
    await page.evaluate(() => { window.APP_IS_TESTING = true; });
  });

  test('should load the page without console errors', async ({ page }) => {
    // Assert that no console errors were thrown on page load.
    expect(consoleErrors).toHaveLength(0);
  });

  test('should perform multiple calculations without freezing', async ({ page }) => {
    // Get handles to the UI elements
    const totalAmountInput = page.locator('#total');
    const amountReceivedInput = page.locator('#received');
    const calculateBtn = page.locator('#calculate-btn');
    const resultDiv = page.locator('#result-value');

    // --- First operation ---
    console.log('Performing first calculation...');
    await totalAmountInput.fill('10.50');
    await amountReceivedInput.fill('20.00');
    await calculateBtn.click();

    // The result text can vary with language, so we look for part of it.
    await expect(resultDiv).toContainText('9.50', { timeout: 10000 });

    // Check that the button is re-enabled
    await expect(calculateBtn).toBeEnabled({ timeout: 10000 });
    console.log('First calculation successful, button is enabled.');

    // --- Second operation ---
    console.log('Performing second calculation...');
    await totalAmountInput.fill('5.00');
    await amountReceivedInput.fill('10.00');
    await calculateBtn.click();

    await expect(resultDiv).toContainText('5.00', { timeout: 10000 });

    // Check that the button is re-enabled again
    await expect(calculateBtn).toBeEnabled({ timeout: 10000 });
    console.log('Second calculation successful, button is enabled.');

    // Final check for any unexpected console errors during the test
    expect(consoleErrors).toHaveLength(0);
  });
});
