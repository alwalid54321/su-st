import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const CurrencySchema = z.object({
    code: z.string().min(2).max(10).toUpperCase(),
    name: z.string().min(1),
    rate: z.number().positive().default(1.0)
})

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
        const json = await request.json()
        const validatedData = CurrencySchema.parse({
            ...json,
            rate: parseFloat(json.rate)
        })

        const newCurrency = await prisma.currency.create({
            data: validatedData
        })

        return NextResponse.json({
            message: 'Currency created successfully!',
            data: newCurrency
        }, { status: 201 })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input data', details: err.errors }, { status: 400 })
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return NextResponse.json({
                    error: 'A currency with this code already exists. Please use a unique code.'
                }, { status: 409 })
            }
        }

        console.error('Error creating currency:', err)
        return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 })
    }
}
