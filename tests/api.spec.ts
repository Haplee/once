import { test, expect } from '@playwright/test';

test.describe('API Tests', () => {

    test('POST /api/calculate - should calculate change correctly', async ({ request }) => {
        const response = await request.post('/api/calculate', {
            data: {
                total: 10.50,
                received: 20.00
            }
        });
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body.success).toBe(true);
        expect(body.change).toBe(9.50);
    });

    test('POST /api/calculate - should return error for insufficient funds', async ({ request }) => {
        const response = await request.post('/api/calculate', {
            data: {
                total: 20.00,
                received: 10.00
            }
        });
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
        expect(body.error).toBe('Insufficient funds');
    });

    test('POST /api/calculate - should return error for missing values', async ({ request }) => {
        const response = await request.post('/api/calculate', {
            data: {
                total: 10.00
            }
        });
        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.success).toBe(false);
        expect(body.error).toBe('Missing values');
    });

    test('GET /api/history - should return history list', async ({ request }) => {
        // First create a record to ensure there is history
        await request.post('/api/calculate', {
            data: {
                total: 5.00,
                received: 10.00
            }
        });

        const response = await request.get('/api/history');
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
        // data check
        expect(body[0]).toHaveProperty('total_amount');
        expect(body[0]).toHaveProperty('timestamp');
    });
});
