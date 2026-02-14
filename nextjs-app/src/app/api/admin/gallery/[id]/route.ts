import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

// PUT - Update gallery image (Admin only)
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const id = parseInt(params.id);
        const requestedImage = await prisma.galleryImage.findUnique({
            where: { id }
        });

        if (!requestedImage) {
            return NextResponse.json({ error: 'Gallery image not found' }, { status: 404 });
        }

        if (!requestedImage.isCurrent) {
            // If an old version is requested, find the current version by title
            const currentImage = await prisma.galleryImage.findFirst({
                where: { title: requestedImage.title, isCurrent: true }
            });
            if (currentImage) {
                return NextResponse.json({ isCurrent: false, currentId: currentImage.id, message: 'Redirecting to current version' }, { status: 410 }); // 410 Gone for old resource, with redirect hint
            } else {
                return NextResponse.json({ error: 'Gallery image not found or no current version exists' }, { status: 404 });
            }
        }

        return NextResponse.json(requestedImage);
    } catch (err) {
        console.error('Error fetching gallery image:', err)
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
    }
}

// PUT - No longer supported for direct updates; use POST to /api/admin/gallery for versioned updates
export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    return NextResponse.json({ error: 'PUT method not allowed for versioned updates. Use POST to /api/admin/gallery to create a new version.' }, { status: 405 });
}

// DELETE - Delete gallery image (Admin only)
