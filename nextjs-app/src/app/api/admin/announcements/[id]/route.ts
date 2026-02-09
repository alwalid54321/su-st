import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

// GET - Get single announcement (Admin only)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const id = parseInt(params.id)
        const announcement = await prisma.announcement.findUnique({
            where: { id }
        })

        if (!announcement) {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
        }

        return NextResponse.json(announcement)
    } catch (err) {
        console.error('Error fetching announcement:', err)
        return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 })
    }
}

// PUT - Update announcement (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const id = parseInt(params.id)
        const body = await request.json()

        const announcement = await prisma.announcement.update({
            where: { id },
            data: {
                title: body.title,
                content: body.content,
                priority: body.priority,
                isActive: body.isActive,
                isFeatured: body.isFeatured,
                imageUrl: body.imageUrl,
                externalLink: body.externalLink,
                category: body.category,
            }
        })

        return NextResponse.json(announcement)
    } catch (err) {
        console.error('Error updating announcement:', err)
        return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
    }
}

// DELETE - Delete announcement (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const id = parseInt(params.id)
        await prisma.announcement.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Announcement deleted successfully' })
    } catch (err) {
        console.error('Error deleting announcement:', err)
        return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
    }
}
