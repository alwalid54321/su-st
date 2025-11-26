import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

// GET - List all currencies (Admin only)
export async function GET() {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const currencies = await prisma.currency.findMany({
            orderBy: { code: 'asc' }
        })

        return NextResponse.json(currencies)
    } catch (err) {
        console.error('Error fetching currencies:', err)
        return NextResponse.json({ error: 'Failed to fetch currencies' }, { status: 500 })
    }
}

// POST - Create new currency (Admin only)
export async function POST(request: NextRequest) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const body = await request.json()

        const newCurrency = await prisma.currency.create({
            data: {
                code: body.code,
                name: body.name,
                rate: parseFloat(body.rate) || 1.0
            }
        })

        return NextResponse.json(newCurrency, { status: 201 })
    } catch (err) {
        console.error('Error creating currency:', err)
        return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 })
    }
}
