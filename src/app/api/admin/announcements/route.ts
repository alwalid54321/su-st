import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'

const AnnouncementSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    imageUrl: z.string().nullable().optional(),
    externalLink: z.string().nullable().optional(),
    category: z.enum(['news', 'alert', 'update', 'promotion']).default('news'),
})

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
        const json = await request.json()
        const validatedData = AnnouncementSchema.parse(json)

        const announcement = await prisma.announcement.create({
            data: validatedData
        })

        return NextResponse.json({
            message: 'Announcement created successfully!',
            data: announcement
        }, { status: 201 })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input data', details: err.issues }, { status: 400 })
        }

        console.error('Error creating announcement:', err)
        return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
    }
}
