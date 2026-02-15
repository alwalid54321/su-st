import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

const MarketDataSchema = z.object({
    name: z.string().min(1),
    value: z.number().default(0),
    portSudan: z.number().default(0),
    dmtChina: z.number().default(0),
    dmtUae: z.number().default(0),
    dmtMersing: z.number().default(0),
    dmtIndia: z.number().default(0),
    status: z.enum(['Active', 'Limited', 'Inactive']).default('Active'),
    forecast: z.enum(['Rising', 'Stable', 'Falling']).default('Stable'),
    trend: z.number().int().default(0),
    imageUrl: z.string().nullable().optional(),
    category: z.string().default('others'),
    description: z.string().nullable().optional(),
    specifications: z.string().nullable().optional(),
    details: z.string().nullable().optional(),
    availability: z.string().nullable().optional()
})

// GET - List all market data (Admin only)
export async function GET() {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const marketData = await prisma.marketData.findMany({
            orderBy: { name: 'asc' }
        })

        return NextResponse.json(marketData)
    } catch (err) {
        console.error('Error fetching market data:', err)
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
    }
}

// POST - Create new market data entry (Admin only)
export async function POST(request: NextRequest) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const json = await request.json()
        const validatedData = MarketDataSchema.parse({
            ...json,
            value: parseFloat(json.value),
            portSudan: parseFloat(json.port_sudan || json.portSudan),
            dmtChina: parseFloat(json.dmt_china || json.dmtChina),
            dmtUae: parseFloat(json.dmt_uae || json.dmtUae),
            dmtMersing: parseFloat(json.dmt_mersing || json.dmtMersing),
            dmtIndia: parseFloat(json.dmt_india || json.dmtIndia),
            trend: parseInt(json.trend),
            imageUrl: json.image_url || json.imageUrl
        })

        const newMarketData = await prisma.marketData.create({
            data: validatedData
        })

        return NextResponse.json({
            message: 'Market data entry created successfully!',
            data: newMarketData
        }, { status: 201 })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input data', details: err.errors }, { status: 400 })
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            if (err.code === 'P2002') {
                return NextResponse.json({
                    error: 'A commodity with this name already exists. Please use a unique name.'
                }, { status: 409 })
            }
        }

        console.error('Error creating market data:', err)
        return NextResponse.json({ error: 'Failed to create market data' }, { status: 500 })
    }
}
