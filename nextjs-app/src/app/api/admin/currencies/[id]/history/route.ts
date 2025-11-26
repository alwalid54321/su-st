import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const params = await context.params
        const id = parseInt(params.id)

        // Fetch archived records for this originalId
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
