import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();

    if (!session || !((session.user as any)?.isStaff || (session.user as any)?.isSuperuser)) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const [totalProducts, totalVariations, totalPorts, totalCurrencies] = await Promise.all([
            (prisma as any).marketData.count({ where: { isCurrent: true } }),
            (prisma as any).productVariation.count({ where: { isActive: true } }),
            (prisma as any).port.count({ where: { isActive: true } }),
            (prisma as any).currency.count({ where: { isCurrent: true } }),
        ]);

        return NextResponse.json({
            totalProducts,
            totalVariations,
            totalPorts,
            totalCurrencies,
        });
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
