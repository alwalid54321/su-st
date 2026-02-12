
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

// Validation schema for creating an alert
const alertSchema = z.object({
    marketDataId: z.number(),
    targetPrice: z.number().positive(),
    condition: z.enum(['ABOVE', 'BELOW']),
})

export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const alerts = await prisma.priceAlert.findMany({
            where: { userId: Number(session.user.id) },
            include: {
                marketData: {
                    select: { name: true, value: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(alerts)
    } catch (error) {
        console.error('Error fetching alerts:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { marketDataId, targetPrice, condition } = alertSchema.parse(body)

        const alert = await prisma.priceAlert.create({
            data: {
                userId: Number(session.user.id),
                marketDataId,
                targetPrice,
                condition,
            },
        })

        return NextResponse.json(alert, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
        }
        console.error('Error creating alert:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
        return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
    }

    try {
        // Verify ownership
        const alert = await prisma.priceAlert.findUnique({
            where: { id: Number(id) },
        })

        if (!alert || alert.userId !== Number(session.user.id)) {
            return NextResponse.json({ error: 'Alert not found or unauthorized' }, { status: 404 })
        }

        await prisma.priceAlert.delete({
            where: { id: Number(id) },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting alert:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
