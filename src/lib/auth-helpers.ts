import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export type PlanType = 'free' | 'plus' | 'premium'

export async function requireAuth() {
    const session = await auth()

    if (!session || !session.user) {
        return {
            error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
            session: null
        }
    }

    return { error: null, session }
}

export async function requireAdmin() {
    const { error, session } = await requireAuth()

    if (error) return { error, session: null }

    // Check if user is staff or superuser
    const user = session.user as any
    if (!user.isStaff && !user.isSuperuser) {
        return {
            error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }),
            session: null
        }
    }

    return { error: null, session }
}

export async function requirePlus() {
    const { error, session } = await requireAuth()

    if (error) return { error, session: null }

    const user = session.user as any
    // Allow plus, premium, and superusers
    if (user.plan !== 'plus' && user.plan !== 'premium' && !user.isSuperuser) {
        return {
            error: NextResponse.json(
                { error: 'Plus subscription required', upgrade: true },
                { status: 403 }
            ),
            session: null
        }
    }

    return { error: null, session }
}

// Non-blocking helper: returns plan without rejecting free users
export async function getUserPlan(): Promise<{ plan: PlanType; session: any }> {
    const session = await auth()
    if (!session || !session.user) {
        return { plan: 'free', session: null }
    }

    const user = session.user as any
    // Superusers always get premium benefits
    if (user.isSuperuser) return { plan: 'premium', session }

    // Normalize plan
    const plan = (user.plan as string || 'free').toLowerCase() as PlanType
    return { plan: ['free', 'plus', 'premium'].includes(plan) ? plan : 'free', session }
}
