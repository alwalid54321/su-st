// Audit Logger Utility
// Centralized logging for all admin actions and sensitive operations

import { prisma } from './prisma'

export type AuditAction =
    | 'USER_CREATE'
    | 'USER_UPDATE'
    | 'USER_DELETE'
    | 'PLAN_CHANGE'
    | 'ROLE_GRANT'
    | 'ROLE_REVOKE'
    | 'PERMISSION_GRANT'
    | 'PERMISSION_REVOKE'
    | 'MARKET_DATA_UPDATE'
    | 'CURRENCY_UPDATE'
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'EXPORT_DATA'
    | 'BULK_ACTION'

export type AuditTargetType = 'User' | 'MarketData' | 'Currency' | 'Announcement' | 'System'

interface AuditLogData {
    userId: number
    action: AuditAction
    targetType: AuditTargetType
    targetId?: number
    changes?: Record<string, any>
    ipAddress?: string
    userAgent?: string
}

/**
 * Create an audit log entry
 */
export async function logAudit(data: AuditLogData) {
    try {
        await prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                targetType: data.targetType,
                targetId: data.targetId,
                changes: data.changes ? JSON.stringify(data.changes) : null,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        })
    } catch (error) {
        console.error('Failed to create audit log:', error)
        // Don't throw - audit logging failure shouldn't break the main operation
    }
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs({
    userId,
    action,
    targetType,
    startDate,
    endDate,
    limit = 50,
    offset = 0,
}: {
    userId?: number
    action?: AuditAction
    targetType?: AuditTargetType
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
}) {
    const where: any = {}

    if (userId) where.userId = userId
    if (action) where.action = action
    if (targetType) where.targetType = targetType
    if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.auditLog.count({ where }),
    ])

    return { logs, total }
}

/**
 * Get user-specific audit logs
 */
export async function getUserAuditLogs(userId: number, limit = 20) {
    return prisma.auditLog.findMany({
        where: { userId },
        include: {
            user: {
                select: {
                    username: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
    })
}

/**
 * Helper to detect changes between old and new objects
 */
export function detectChanges(oldData: Record<string, any>, newData: Record<string, any>) {
    const changes: Record<string, { old: any; new: any }> = {}

    for (const key in newData) {
        if (oldData[key] !== newData[key]) {
            changes[key] = {
                old: oldData[key],
                new: newData[key],
            }
        }
    }

    return Object.keys(changes).length > 0 ? changes : null
}
