import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const recentUpdates = await prisma.marketData.findMany({
            take: 5,
            orderBy: {
                lastUpdate: 'desc'
            },
            select: {
                id: true,
                name: true,
                lastUpdate: true,
                value: true,
                trend: true
            }
        })

        return NextResponse.json(recentUpdates)
    } catch (error) {
        console.error('Error fetching recent market updates:', error)
        return NextResponse.json(
            { error: 'Failed to fetch recent updates' },
            { status: 500 }
        )
    }
}
