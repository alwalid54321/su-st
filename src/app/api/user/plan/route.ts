import { NextResponse } from 'next/server'
import { getUserPlan } from '@/lib/auth-helpers'

// GET /api/user/plan — returns the current user's plan and limits
export async function GET() {
    try {
        const { plan, session } = await getUserPlan()

        const limits = {
            free: {
                historyDays: 7,
                currencyConverter: false,
                csvExport: false,
                description: 'Basic access with 7-day market history'
            },
            plus: {
                historyDays: 150, // ~5 months
                currencyConverter: true,
                csvExport: true,
                description: 'Full access with 5-month history & converter'
            }
        }

        return NextResponse.json({
            plan,
            authenticated: !!session,
            limits: limits[plan],
            allPlans: limits
        })
    } catch (err) {
        console.error('Error fetching user plan:', err)
        return NextResponse.json(
            { plan: 'free', authenticated: false, limits: { historyDays: 7, currencyConverter: false, csvExport: false } },
            { status: 200 }
        )
    }
}
