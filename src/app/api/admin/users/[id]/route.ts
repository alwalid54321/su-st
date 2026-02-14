import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

// PUT /api/admin/users/[id] — update user fields (admin only)
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin()
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
        if (typeof body.plan === 'string' && ['free', 'plus'].includes(body.plan)) {
            allowedFields.plan = body.plan
        }
        if (typeof body.isActive === 'boolean') {
            allowedFields.isActive = body.isActive
        }
        if (typeof body.isStaff === 'boolean') {
            allowedFields.isStaff = body.isStaff
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
        const { session } = await requireAdmin()
        const currentUserId = parseInt(session?.user?.id || '0')
        if (currentUserId === id && allowedFields.isStaff === false) {
            return NextResponse.json(
                { error: 'Cannot remove your own admin privileges' },
                { status: 403 }
            )
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
