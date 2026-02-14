import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

// GET - List all gallery images
export async function GET(request: NextRequest) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const images = await prisma.galleryImage.findMany({
            where: { isCurrent: true },
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(images)
    } catch (err) {
        console.error('Error fetching gallery images:', err)
        return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 })
    }
}

// POST - Create new gallery image (Admin only)
export async function POST(request: NextRequest) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const body = await request.json()
        const { previousRecordId, ...newData } = body;

        if (!newData.title || !newData.imageUrl) {
            return NextResponse.json({ error: 'Title and Image URL are required' }, { status: 400 })
        }

        let image;

        if (previousRecordId) {
            // Handle update as new version
            const oldGalleryImage = await prisma.galleryImage.findUnique({
                where: { id: previousRecordId }
            });

            if (!oldGalleryImage) {
                return NextResponse.json({ error: 'Previous gallery image record not found' }, { status: 404 });
            }

            // 1. Mark the old record as not current
            await prisma.galleryImage.update({
                where: { id: previousRecordId },
                data: { isCurrent: false }
            });

            // 2. Create a new record with the updated data, linked to the previous version
            image = await prisma.galleryImage.create({
                data: {
                    ...newData,
                    isCurrent: true,
                    previousVersionId: previousRecordId,
                    order: newData.order || 0,
                    isActive: newData.isActive ?? true,
                }
            });

        } else {
            // Handle brand new creation
            image = await prisma.galleryImage.create({
                data: {
                    ...newData,
                    isCurrent: true,
                    previousVersionId: null,
                    order: newData.order || 0,
                    isActive: newData.isActive ?? true,
                }
            });
        }

        return NextResponse.json(image, { status: 201 })
    } catch (err) {
        console.error('Error creating/updating gallery image:', err)
        return NextResponse.json({ error: 'Failed to create/update image' }, { status: 500 })
    }
}
