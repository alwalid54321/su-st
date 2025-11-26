import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const marketData = await prisma.marketData.findMany({
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(marketData)
    } catch (error) {
        console.error('Error fetching market data:', error)
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
    }
}
