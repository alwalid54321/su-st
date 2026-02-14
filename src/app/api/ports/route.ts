import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const ports = await prisma.port.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(ports)
    } catch (error) {
        console.error('Error fetching ports:', error)
        return NextResponse.json({ error: 'Failed to fetch ports' }, { status: 500 })
    }
}
