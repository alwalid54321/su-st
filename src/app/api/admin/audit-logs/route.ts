// API Route: /api/admin/audit-logs
// Fetch audit logs with filtering and pagination

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getAuditLogs, AuditAction, AuditTargetType } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
    const session = await auth()

    // Only staff/superusers can view audit logs
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const action = searchParams.get('action') as AuditAction | null
    const targetType = searchParams.get('targetType') as AuditTargetType | null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    try {
        const { logs, total } = await getAuditLogs({
            userId: userId ? parseInt(userId) : undefined,
            action: action || undefined,
            targetType: targetType || undefined,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            limit,
            offset,
        })

        return NextResponse.json({
            logs,
            total,
            limit,
            offset,
        })
    } catch (error) {
        console.error('Error fetching audit logs:', error)
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
    }
}
