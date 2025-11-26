import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

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
        const body = await request.json()

        const newMarketData = await prisma.marketData.create({
            data: {
                name: body.name,
                value: parseFloat(body.value) || 0,
                portSudan: parseFloat(body.port_sudan || body.portSudan) || 0,
                dmtChina: parseFloat(body.dmt_china || body.dmtChina) || 0,
                dmtUae: parseFloat(body.dmt_uae || body.dmtUae) || 0,
                dmtMersing: parseFloat(body.dmt_mersing || body.dmtMersing) || 0,
                dmtIndia: parseFloat(body.dmt_india || body.dmtIndia) || 0,
                status: body.status || 'Active',
                forecast: body.forecast || 'Stable',
                trend: parseInt(body.trend) || 0,
                imageUrl: body.image_url || body.imageUrl,
                category: body.category || 'others',
                description: body.description,
                specifications: body.specifications,
                details: body.details,
                availability: body.availability
            }
        })

        return NextResponse.json(newMarketData, { status: 201 })
    } catch (err) {
        console.error('Error creating market data:', err)
        return NextResponse.json({ error: 'Failed to create market data' }, { status: 500 })
    }
}
