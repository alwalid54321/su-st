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

        const marketData = await prisma.marketData.findUnique({
            where: { id }
        })

        if (!marketData) {
            return NextResponse.json({ error: 'Market data not found' }, { status: 404 })
        }

        return NextResponse.json(marketData)
    } catch (err) {
        console.error('Error fetching market data:', err)
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
    }
}
