import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

// GET - Get single market data entry (Admin only)
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const params = await context.params
        const id = parseInt(params.id)

        const marketData = await prisma.marketData.findUnique({
            where: { id }
        })

        if (!marketData) {
            return NextResponse.json({ error: 'Market data not found' }, { status: 404 })
        }

        return NextResponse.json(marketData)
    } catch (err) {
        console.error('Error fetching market data:', err)
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
    }
}

// PUT - Update market data entry (Admin only)
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const params = await context.params
        const id = parseInt(params.id)
        const body = await request.json()

        // Archive the current version before updating
        const currentData = await prisma.marketData.findUnique({
            where: { id }
        })

        if (currentData) {
            await prisma.marketDataArchive.create({
                data: {
                    originalId: currentData.id,
                    name: currentData.name,
                    value: currentData.value,
                    portSudan: currentData.portSudan,
                    dmtChina: currentData.dmtChina,
                    dmtUae: currentData.dmtUae,
                    dmtMersing: currentData.dmtMersing,
                    dmtIndia: currentData.dmtIndia,
                    status: currentData.status,
                    forecast: currentData.forecast,
                    trend: currentData.trend,
                    imageUrl: currentData.imageUrl,
                    lastUpdate: currentData.lastUpdate,
                    createdAt: currentData.createdAt
                }
            })
        }

        // Calculate trend automatically based on value change
        let calculatedTrend = parseInt(body.trend) || 0;
        if (currentData && currentData.value > 0) {
            const newValue = parseFloat(body.value) || 0;
            const oldValue = currentData.value;
            calculatedTrend = Math.round(((newValue - oldValue) / oldValue) * 100);
        }

        // Update the market data
        const updated = await prisma.marketData.update({
            where: { id },
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
                trend: calculatedTrend,
                imageUrl: body.image_url || body.imageUrl,
                category: body.category,
                description: body.description,
                specifications: body.specifications,
                details: body.details,
                availability: body.availability
            }
        })

        return NextResponse.json(updated)
    } catch (err) {
        console.error('Error updating market data:', err)
        return NextResponse.json({ error: 'Failed to update market data' }, { status: 500 })
    }
}

// DELETE - Delete market data entry (Admin only)
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const params = await context.params
        const id = parseInt(params.id)

        await prisma.marketData.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Market data deleted successfully' })
    } catch (err) {
        console.error('Error deleting market data:', err)
        return NextResponse.json({ error: 'Failed to delete market data' }, { status: 500 })
    }
}
