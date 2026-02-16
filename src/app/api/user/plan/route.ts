import { NextResponse } from 'next/server'
import { getUserPlan } from '@/lib/auth-helpers'

type PlanType = 'free' | 'plus' | 'premium'

// GET /api/user/plan — returns the current user's plan and limits
export async function GET() {
    try {
        const { plan, session } = await getUserPlan()
        const userPlan = (plan as PlanType) || 'free'

        const limits = {
            free: {
                historyDays: 14,
                currencyConverter: false,
                csvExport: false,
                description: 'Basic access with 14-day market history'
            },
            plus: {
                historyDays: 150, // ~5 months
                currencyConverter: true,
                csvExport: true,
                description: 'Full access with 5-month history & converter'
            },
            premium: {
                historyDays: 365, // 1 year
                currencyConverter: true,
                csvExport: true,
                description: 'Pro access with 1-year history & all features'
            }
        }

        return NextResponse.json({
            plan: userPlan,
            authenticated: !!session,
            limits: limits[userPlan],
            allPlans: limits
        })
    } catch (err) {
        console.error('Error fetching user plan:', err)
        return NextResponse.json(
            { plan: 'free', authenticated: false, limits: { historyDays: 14, currencyConverter: false, csvExport: false } },
            { status: 200 }
        )
    }
}
