import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserPlan } from '@/lib/auth-helpers'
import { rateLimit } from '@/lib/api-limiter'

// Plan-based history limits (in days)
const PLAN_LIMITS = {
    free: 14,     // Free users: 14 days
    plus: 150,     // Plus users: ~5 months
    premium: 365   // Premium users: 1 year
}

type PlanType = keyof typeof PLAN_LIMITS;

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    // 1. Rate Limiting Protection (50 req/min/IP)
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

        // Determine user plan and enforce date limit server-side
        const { plan } = await getUserPlan()
        const userPlan = (plan as PlanType) || 'free'
        const maxDays = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free
        const dateLimit = new Date()
        dateLimit.setDate(dateLimit.getDate() - maxDays)

        if (isNaN(id)) {
            // Check if it's a code (e.g. USD)
            const currency = await prisma.currency.findFirst({
                where: { code: params.id.toUpperCase() }
            })
            if (!currency) return NextResponse.json({ error: 'Currency not found' }, { status: 404 })

            const history = await prisma.currencyArchive.findMany({
                where: {
                    originalId: currency.id,
                    archivedAt: { gte: dateLimit }
                },
                orderBy: { archivedAt: 'desc' }
            })
            return NextResponse.json(history)
        }

        const history = await prisma.currencyArchive.findMany({
            where: {
                originalId: id,
                archivedAt: { gte: dateLimit }
            },
            orderBy: { archivedAt: 'desc' }
        })

        return NextResponse.json(history)
    } catch (err) {
        console.error('Error fetching currency history:', err)
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
