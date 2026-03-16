import { describe, it, expect, vi } from 'vitest';

describe('Validación de Entorno (Zod)', () => {
    it('debe cargar el módulo sin lanzar errores si las variables son correctas', async () => {
        // Mock de process.env
        vi.stubEnv('SPACETIMEDB_URI', 'http://localhost:3000');
        vi.stubEnv('SPACETIMEDB_DB_NAME', 'test_db');
        vi.stubEnv('UPSTASH_REDIS_REST_URL', 'http://redis.com');
        vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'token');
        vi.stubEnv('NEXTAUTH_SECRET', 'secret');
        vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
        vi.stubEnv('NEXT_PUBLIC_SPACETIMEDB_URI', 'ws://localhost:3000');
        vi.stubEnv('NEXT_PUBLIC_SPACETIMEDB_DB_NAME', 'test_db');
        vi.stubEnv('NEXT_PUBLIC_URL', 'http://localhost:3000');

        const { env } = await import('@/lib/env');
        expect(env).toBeDefined();
        vi.unstubAllEnvs();
    });
});
