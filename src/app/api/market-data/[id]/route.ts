import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/api-limiter'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // 1. Rate Limiting Protection (50 req/min/IP)
    const limiter = rateLimit(request, { limit: 50, windowMs: 60000 })
    if (!limiter.success) {
        return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429, headers: { 'Retry-After': String(limiter.reset) } }
        )
    }

    try {
        const params = await context.params
        const id = parseInt(params.id)

        // 2. Strict Input Validation
        if (isNaN(id) || id <= 0) {
            return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
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
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
