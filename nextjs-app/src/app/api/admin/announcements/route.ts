import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

// GET - List all announcements (Admin only)
export async function GET(request: NextRequest) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const isActive = searchParams.get('isActive')

        const where: any = {}
        if (category) where.category = category
        if (isActive !== null) where.isActive = isActive === 'true'

        const announcements = await prisma.announcement.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(announcements)
    } catch (err) {
        console.error('Error fetching announcements:', err)
        return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
    }
}

// POST - Create new announcement (Admin only)
export async function POST(request: NextRequest) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const body = await request.json()

        if (!body.title || !body.content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
        }

        const announcement = await prisma.announcement.create({
            data: {
                title: body.title,
                content: body.content,
                priority: body.priority || 'medium',
                isActive: body.isActive ?? true,
                isFeatured: body.isFeatured ?? false,
                imageUrl: body.imageUrl || null,
                externalLink: body.externalLink || null,
                category: body.category || 'news',
            }
        })

        return NextResponse.json(announcement, { status: 201 })
    } catch (err) {
        console.error('Error creating announcement:', err)
        return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
    }
}
