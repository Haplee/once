import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { calculateRateLimit, historyRateLimit, getIP } from '@/lib/ratelimit';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Solo aplicamos rate limit a las rutas de la API
    if (pathname.startsWith('/api/')) {
        const ip = getIP(request);
        let limitResult;

        if (pathname.startsWith('/api/calculate')) {
            limitResult = await calculateRateLimit.limit(ip);
        } else if (pathname.startsWith('/api/history')) {
            limitResult = await historyRateLimit.limit(ip);
        }

        if (limitResult && !limitResult.success) {
            return new NextResponse(
                JSON.stringify({ 
                    error: 'rate_limit_exceeded', 
                    retryAfter: limitResult.reset 
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'Retry-After': (Math.ceil((limitResult.reset - Date.now()) / 1000)).toString(),
                    },
                }
            );
        }
    }

    return NextResponse.next();
}

// Configuración para que el middleware solo se ejecute en rutas de API
export const config = {
    matcher: '/api/:path*',
};
