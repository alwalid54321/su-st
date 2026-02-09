import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const variations = await prisma.productVariation.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(variations)
    } catch (error) {
        console.error('Error fetching variations:', error)
        return NextResponse.json({ error: 'Failed to fetch variations' }, { status: 500 })
    }
}
