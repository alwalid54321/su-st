import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { logAudit, AuditAction, AuditTargetType } from '@/lib/audit-logger'

// PUT /api/admin/users/[id] — update user fields (admin only)
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { error, session } = await requireAdmin()
    if (error) return error

    try {
        const params = await context.params
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
        }

        const body = await request.json()

        // Whitelist allowed fields — prevent mass assignment attacks
        const allowedFields: Record<string, any> = {}
        if (typeof body.plan === 'string' && ['free', 'plus', 'premium'].includes(body.plan)) {
            allowedFields.plan = body.plan
        }
        if (typeof body.isActive === 'boolean') {
            allowedFields.isActive = body.isActive
        }
        if (typeof body.isStaff === 'boolean') {
            allowedFields.isStaff = body.isStaff
        }
        if (typeof body.isSuperuser === 'boolean') {
            allowedFields.isSuperuser = body.isSuperuser
        }
        if (typeof body.firstName === 'string') {
            allowedFields.firstName = body.firstName.trim().slice(0, 100)
        }
        if (typeof body.lastName === 'string') {
            allowedFields.lastName = body.lastName.trim().slice(0, 100)
        }

        if (Object.keys(allowedFields).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
        }

        // Prevent self-demotion (admin can't remove their own staff status)
        const currentUserId = parseInt(session?.user?.id || '0')
        if (currentUserId === id) {
            if (allowedFields.isStaff === false || allowedFields.isSuperuser === false) {
                return NextResponse.json(
                    { error: 'Cannot remove your own admin/superuser privileges' },
                    { status: 403 }
                )
            }
        }

        // Get original user state for audit diffing (optional, but good for context)
        const originalUser = await prisma.user.findUnique({ where: { id } })
        if (!originalUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const updated = await prisma.user.update({
            where: { id },
            data: allowedFields,
            select: {
                id: true,
                username: true,
                email: true,
                plan: true,
                isActive: true,
                isStaff: true,
                isSuperuser: true,
                firstName: true,
                lastName: true
            }
        })

        // Audit Logging
        const adminId = parseInt(session?.user?.id || '0')
        const ipAddress = request.headers.get('x-forwarded-for') || 'unknown'

        // Log specific changes
        if (allowedFields.plan && allowedFields.plan !== originalUser.plan) {
            await logAudit({
                userId: adminId,
                action: 'PLAN_CHANGE',
                targetType: 'User',
                targetId: id,
                changes: { oldPlan: originalUser.plan, newPlan: allowedFields.plan },
                ipAddress
            })
        }

        if (allowedFields.isStaff !== undefined && allowedFields.isStaff !== originalUser.isStaff) {
            await logAudit({
                userId: adminId,
                action: allowedFields.isStaff ? 'ROLE_GRANT' : 'ROLE_REVOKE',
                targetType: 'User',
                targetId: id,
                changes: { role: 'isStaff', value: allowedFields.isStaff },
                ipAddress
            })
        }

        if (allowedFields.isSuperuser !== undefined && allowedFields.isSuperuser !== originalUser.isSuperuser) {
            await logAudit({
                userId: adminId,
                action: allowedFields.isSuperuser ? 'ROLE_GRANT' : 'ROLE_REVOKE',
                targetType: 'User',
                targetId: id,
                changes: { role: 'isSuperuser', value: allowedFields.isSuperuser },
                ipAddress
            })
        }

        if (allowedFields.isActive !== undefined && allowedFields.isActive !== originalUser.isActive) {
            await logAudit({
                userId: adminId,
                action: 'USER_UPDATE',
                targetType: 'User',
                targetId: id,
                changes: { field: 'isActive', oldValue: originalUser.isActive, newValue: allowedFields.isActive },
                ipAddress
            })
        }

        console.log(`Admin updated user ${id}: ${JSON.stringify(allowedFields)}`)

        return NextResponse.json(updated)
    } catch (err: any) {
        if (err.code === 'P2025') {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        console.error('Error updating user:', err)
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}

// DELETE /api/admin/users/[id] — soft disable user (admin only)
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { error, session } = await requireAdmin()
    if (error) return error

    try {
        const params = await context.params
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
        }

        // Prevent self-deletion
        const currentUserId = parseInt(session?.user?.id || '0')
        if (currentUserId === id) {
            return NextResponse.json(
                { error: 'Cannot disable your own account' },
                { status: 403 }
            )
        }

        // Soft delete — set isActive to false, never hard delete
        const updated = await prisma.user.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, username: true, isActive: true }
        })

        // Log Audit
        const adminId = parseInt(session?.user?.id || '0')
        await logAudit({
            userId: adminId,
            action: 'USER_UPDATE',
            targetType: 'User',
            targetId: id,
            changes: { action: 'deactivate_user', reason: 'admin_action' },
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
        })

        console.log(`Admin disabled user ${id} (${updated.username})`)

        return NextResponse.json({ message: 'User disabled', user: updated })
    } catch (err: any) {
        if (err.code === 'P2025') {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        console.error('Error disabling user:', err)
        return NextResponse.json({ error: 'Failed to disable user' }, { status: 500 })
    }
}
