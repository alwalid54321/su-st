// API Route: /api/admin/user-activity/[id]
// Get user activity timeline

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await auth()

    // Only staff/superusers can view user activity
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const userId = parseInt(params.id)
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    try {
        const [activities, total] = await Promise.all([
            prisma.userActivity.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.userActivity.count({ where: { userId } }),
        ])

        return NextResponse.json({
            activities,
            total,
            limit,
            offset,
        })
    } catch (error) {
        console.error('Error fetching user activity:', error)
        return NextResponse.json({ error: 'Failed to fetch user activity' }, { status: 500 })
    }
}
