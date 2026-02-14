import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    try {
        const session = await auth()
        if (!session || !((session.user as any).isStaff || (session.user as any).isSuperuser)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const variations = await prisma.productVariation.findMany({
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(variations)
    } catch (error) {
        console.error('Admin Variations GET Error:', error)
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
        const { name, description, isActive } = body

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 })
        }

        const variation = await prisma.productVariation.create({
            data: {
                name,
                description,
                isActive: isActive !== undefined ? isActive : true
            }
        })

        return NextResponse.json(variation)
    } catch (error) {
        console.error('Admin Variations POST Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
