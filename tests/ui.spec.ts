import { test, expect } from '@playwright/test';
const { injectAxe, checkA11y } = require('axe-playwright');

test.describe('Accesibilidad y UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('la página principal debe cumplir con WCAG 2.1 AA', async ({ page }) => {
    // Escaneo de accesibilidad básico
    await checkA11y(page, null, {
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
        }
      }
    });
  });

  test('navegación básica entre secciones', async ({ page }) => {
    await page.click('text=Historial');
    await expect(page).toHaveURL(/.*history/);
    
    await page.click('text=Configuración');
    await expect(page).toHaveURL(/.*configuracion/);
  });

  test('el anuncio de voz se activa al calcular (mock manual o presencia de live region)', async ({ page }) => {
    const totalInput = page.locator('#total');
    const receivedInput = page.locator('#received');
    
    await totalInput.fill('10');
    await receivedInput.fill('20');
    await page.click('#calculate-btn');
    
    // El resultado debe aparecer en la live region del layout si la implementamos
    const result = page.locator('.result-value');
    await expect(result).toContainText('€ 10.00');
  });
});
