import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params
        const id = parseInt(params.id)

        if (isNaN(id)) {
            // Check if it's a code (e.g. USD)
            const currency = await prisma.currency.findFirst({
                where: { code: params.id.toUpperCase() }
            })
            if (!currency) return NextResponse.json({ error: 'Currency not found' }, { status: 404 })

            const history = await prisma.currencyArchive.findMany({
                where: { originalId: currency.id },
                orderBy: { archivedAt: 'desc' }
            })
            return NextResponse.json(history)
        }

        const history = await prisma.currencyArchive.findMany({
            where: { originalId: id },
            orderBy: { archivedAt: 'desc' }
        })

        return NextResponse.json(history)
    } catch (err) {
        console.error('Error fetching currency history:', err)
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
    }
}
