import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session || !((session.user as any).isStaff || (session.user as any).isSuperuser)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = parseInt(params.id)
        const body = await request.json()
        const { name, description, isActive } = body

        const variation = await prisma.productVariation.update({
            where: { id },
            data: {
                name,
                description,
                isActive
            }
        })

        return NextResponse.json(variation)
    } catch (error) {
        console.error('Admin Variation PUT Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session || !((session.user as any).isStaff || (session.user as any).isSuperuser)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = parseInt(params.id)
        await prisma.productVariation.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Variation deleted successfully' })
    } catch (error) {
        console.error('Admin Variation DELETE Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
