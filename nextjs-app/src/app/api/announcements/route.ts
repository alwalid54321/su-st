import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { isActive: true },
            orderBy: [
                { isFeatured: 'desc' },  // Featured first
                { createdAt: 'desc' }     // Then by newest
            ],
            take: 6  // Limit to 6 for homepage
        })

        return NextResponse.json(announcements)
    } catch (error) {
        console.error('Error fetching announcements:', error)
        return NextResponse.json(
            { error: 'Failed to fetch announcements' },
            { status: 500 }
        )
    }
}
