import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { total, received } = await request.json();

        if (total == null || received == null) {
            return NextResponse.json({ success: false, error: 'Missing values' }, { status: 400 });
        }

        const change = received - total;

        if (change < 0) {
            return NextResponse.json({ success: false, error: 'Insufficient funds' }, { status: 400 });
        }

        const roundedChange = parseFloat(change.toFixed(2));

        const db = await getDb();
        await db.run(
            'INSERT INTO history (total_amount, amount_received, change_returned) VALUES (?, ?, ?)',
            [total, received, roundedChange]
        );

        return NextResponse.json({
            success: true,
            change: roundedChange
        });
    } catch (error) {
        console.error('Calculation error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
