import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = await getDb();
        const history = await db.all('SELECT * FROM history ORDER BY timestamp DESC LIMIT 50');
        return NextResponse.json(history || []);
    } catch (error) {
        console.error('History fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
