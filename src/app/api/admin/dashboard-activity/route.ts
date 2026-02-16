// API Route: /api/admin/dashboard-activity
// Get recent activity feed for admin dashboard

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    const session = await auth()

    // Only staff/superusers can view dashboard
    if (!session?.user?.isStaff && !session?.user?.isSuperuser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50')

    try {
        // Get recent user activities and audit logs combined
        const [userActivities, auditLogs] = await Promise.all([
            prisma.userActivity.findMany({
                where: {
                    event: {
                        in: ['LOGIN', 'EXPORT', 'API_CALL'],
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            plan: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 25,
            }),
            prisma.auditLog.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 25,
            }),
        ])

        // Combine and sort by date
        const combined = [
            ...userActivities.map((a: any) => ({
                id: `activity-${a.id}`,
                type: 'activity' as const,
                title: formatActivityTitle(a.event, a.page),
                desc: `${a.user.username} (${a.user.plan})`,
                time: getRelativeTime(a.createdAt),
                timestamp: a.createdAt,
                icon: getActivityIcon(a.event),
            })),
            ...auditLogs.map((a: any) => ({
                id: `audit-${a.id}`,
                type: 'audit' as const,
                title: formatAuditTitle(a.action),
                desc: `by ${a.user.username}`,
                time: getRelativeTime(a.createdAt),
                timestamp: a.createdAt,
                icon: getAuditIcon(a.action),
            })),
        ]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit)

        return NextResponse.json({ activities: combined })
    } catch (error) {
        console.error('Error fetching dashboard activity:', error)
        return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
    }
}

function formatActivityTitle(event: string, page: string): string {
    const eventMap: Record<string, string> = {
        LOGIN: 'User Login',
        EXPORT: 'Data Export',
        API_CALL: 'API Request',
        VIEW: `Viewed ${page}`,
    }
    return eventMap[event] || event
}

function formatAuditTitle(action: string): string {
    const actionMap: Record<string, string> = {
        USER_UPDATE: 'User Updated',
        PLAN_CHANGE: 'Plan Changed',
        ROLE_GRANT: 'Role Granted',
        ROLE_REVOKE: 'Role Revoked',
        MARKET_DATA_UPDATE: 'Price Updated',
        CURRENCY_UPDATE: 'Currency Updated',
    }
    return actionMap[action] || action.replace(/_/g, ' ')
}

function getActivityIcon(event: string): string {
    const iconMap: Record<string, string> = {
        LOGIN: 'Login',
        EXPORT: 'Download',
        API_CALL: 'Api',
        VIEW: 'Visibility',
    }
    return iconMap[event] || 'Event'
}

function getAuditIcon(action: string): string {
    if (action.includes('USER')) return 'Person'
    if (action.includes('PLAN')) return 'CardMembership'
    if (action.includes('ROLE')) return 'AdminPanelSettings'
    if (action.includes('MARKET') || action.includes('PRICE')) return 'TrendingUp'
    if (action.includes('CURRENCY')) return 'CurrencyExchange'
    return 'Settings'
}

function getRelativeTime(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
}
