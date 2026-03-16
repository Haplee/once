import { NextRequest, NextResponse } from 'next/server';
import { callReducer } from '@/lib/spacetimedb-server';
import { CalculateRequest, CalculateResponse, ApiError } from '@/types/models';
import { getServerSession } from "next-auth/next";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        const userId = session?.user?.email || 'anonymous';

        const body: CalculateRequest = await req.json();
        const { total, received } = body;

        if (typeof total !== 'number' || typeof received !== 'number') {
            return NextResponse.json<ApiError>(
                { success: false, error: 'Los valores deben ser números válidos' },
                { status: 400 }
            );
        }

        const change = parseFloat((received - total).toFixed(2));

        if (change < 0) {
            return NextResponse.json<ApiError>(
                { success: false, error: 'El monto recibido es insuficiente' },
                { status: 400 }
            );
        }

        // Persistencia asíncrona en SpacetimeDB vía Reducer incluyento userId
        try {
            await callReducer('addOperation', [received, total, change, userId]);
        } catch (dbError) {
            console.error('[API Calculate] Error persistiendo en SpacetimeDB:', dbError);
        }

        return NextResponse.json<CalculateResponse>({
            success: true,
            change
        });
    } catch (error) {
        console.error('Calculation error:', error);
        return NextResponse.json<ApiError>(
            { success: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
