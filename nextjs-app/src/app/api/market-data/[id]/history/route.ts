import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserPlan } from '@/lib/auth-helpers'
import { rateLimit } from '@/lib/api-limiter'

// Plan-based history limits (in days)
const PLAN_LIMITS = {
    free: 7,      // Free users: 7 days
    plus: 150     // Plus users: ~5 months
}

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // 1. Rate Limiting Protection (50 req/min per IP)
    const limiter = rateLimit(request, { limit: 50, windowMs: 60000 })
    if (!limiter.success) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
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

        // 3. User Plan & Server-Side Enforcement
        const { plan } = await getUserPlan()
        const maxDays = PLAN_LIMITS[plan] || PLAN_LIMITS.free
        const dateLimit = new Date()
        dateLimit.setDate(dateLimit.getDate() - maxDays)

        // 4. Secure Database Query
        const history = await prisma.marketDataArchive.findMany({
            where: {
                originalId: id,
                archivedAt: { gte: dateLimit }
            },
            orderBy: { archivedAt: 'desc' },
            take: 1000 // Upper bound limit prevention
        })

        return NextResponse.json(history, {
            headers: {
                'X-Plan': plan,
                'X-History-Limit-Days': maxDays.toString()
            }
        })
    } catch (err) {
        console.error('Error fetching market data history:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
