import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

// GET /api/admin/users — fetch all users (admin only, no passwords)
export async function GET(request: NextRequest) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                isStaff: true,
                isActive: true,
                isSuperuser: true,
                plan: true,
                emailVerified: true,
                dateJoined: true,
                lastLogin: true,
                profileImage: true
                // password is intentionally excluded for security
            },
            orderBy: { dateJoined: 'desc' }
        })

        return NextResponse.json(users)
    } catch (err) {
        console.error('Error fetching users:', err)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}
