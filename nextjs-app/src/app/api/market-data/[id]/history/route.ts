import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const id = parseInt(params.id)

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
        }

        const history = await prisma.marketDataArchive.findMany({
            where: { originalId: id },
            orderBy: { archivedAt: 'desc' }
        })

        return NextResponse.json(history)
    } catch (err) {
        console.error('Error fetching market data history:', err)
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
