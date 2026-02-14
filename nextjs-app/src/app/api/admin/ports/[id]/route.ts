import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session || !((session.user as any).isStaff || (session.user as any).isSuperuser)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = parseInt(params.id)
        const body = await request.json()
        const { name, location, isActive } = body

        const port = await prisma.port.update({
            where: { id },
            data: {
                name,
                location,
                isActive
            }
        })

        return NextResponse.json(port)
    } catch (error) {
        console.error('Admin Port PUT Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()
        if (!session || !((session.user as any).isStaff || (session.user as any).isSuperuser)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const id = parseInt(params.id)
        await prisma.port.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Port deleted successfully' })
    } catch (error) {
        console.error('Admin Port DELETE Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
