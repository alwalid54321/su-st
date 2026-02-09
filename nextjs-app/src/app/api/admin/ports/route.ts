import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session || !((session.user as any).isStaff || (session.user as any).isSuperuser)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const ports = await prisma.port.findMany({
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(ports)
    } catch (error) {
        console.error('Admin Ports GET Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || !((session.user as any).isStaff || (session.user as any).isSuperuser)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, location, isActive } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const port = await prisma.port.create({
            data: {
                name,
                location,
                isActive: isActive !== undefined ? isActive : true
            }
        })

        return NextResponse.json(port)
    } catch (error) {
        console.error('Admin Ports POST Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
