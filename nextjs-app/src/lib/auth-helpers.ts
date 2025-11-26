import { auth } from '@/auth'
import { NextResponse } from 'next/server'

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
