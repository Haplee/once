import { NextRequest, NextResponse } from 'next/server';
import { getInitialHistory, callReducer } from '@/lib/spacetimedb-server';
import { ApiError } from '@/types/models';
import { getServerSession } from "next-auth/next";

export async function GET() {
    try {
        const session = await getServerSession();
        const userId = session?.user?.email || 'anonymous';
        
        // El servidor filtraría por userId si el reducer/query lo soporta
        const history = await getInitialHistory(); 
        
        // Mientras tanto filtramos en memoria o devolvemos todo si es guest
        const userHistory = history.filter(op => op.userId === userId || userId === 'anonymous');

        return NextResponse.json(userHistory);
    } catch (error) {
        return NextResponse.json<ApiError>(
            { success: false, error: 'Error al obtener historial de SpacetimeDB' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        
        await callReducer('clearHistory', []); 
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json<ApiError>(
            { success: false, error: 'Error al limpiar historial' }, 
            { status: 500 }
        );
    }
}
