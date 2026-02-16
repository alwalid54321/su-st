
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// Simple free API for exchange rates (base USD)
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

export async function POST() {
    try {
        const session = await auth()
        // Check for admin privileges
        if (!session?.user?.id || !((session.user as any).isStaff || (session.user as any).isSuperuser)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch live rates
        const response = await fetch(EXCHANGE_API_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }
        const data = await response.json();
        const rates = data.rates;

        // Get all currencies that are set to auto-update
        const autoUpdateCurrencies = await prisma.currency.findMany({
            where: { isAutoUpdate: true }
        });

        const updates = [];

        for (const currency of autoUpdateCurrencies) {
            const newRate = rates[currency.code];
            if (newRate) {
                const updatePromise = prisma.currency.update({
                    where: { id: currency.id },
                    data: {
                        rate: newRate,
                        lastUpdate: new Date()
                    }
                });
                updates.push(updatePromise);
            }
        }

        await Promise.all(updates);

        return NextResponse.json({
            success: true,
            message: `Updated ${updates.length} currencies`,
            updatedCount: updates.length
        });

    } catch (error) {
        console.error('Error syncing currencies:', error)
        return NextResponse.json({ error: 'Failed to sync currencies' }, { status: 500 })
    }
}
