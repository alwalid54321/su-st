import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

// GET - Get single currency (Admin only)
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const params = await context.params
        const id = parseInt(params.id)

        const currency = await prisma.currency.findUnique({
            where: { id }
        })

        if (!currency) {
            return NextResponse.json({ error: 'Currency not found' }, { status: 404 })
        }

        return NextResponse.json(currency)
    } catch (err) {
        console.error('Error fetching currency:', err)
        return NextResponse.json({ error: 'Failed to fetch currency' }, { status: 500 })
    }
}

// PUT - Update currency (Admin only)
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
        const currentData = await prisma.currency.findUnique({
            where: { id }
        })

        if (currentData) {
            await prisma.currencyArchive.create({
                data: {
                    originalId: currentData.id,
                    code: currentData.code,
                    name: currentData.name,
                    rate: currentData.rate,
                    lastUpdate: currentData.lastUpdate
                }
            })
        }

        // Update the currency
        const updated = await prisma.currency.update({
            where: { id },
            data: {
                code: body.code,
                name: body.name,
                rate: parseFloat(body.rate) || 1.0
            }
        })

        return NextResponse.json(updated)
    } catch (err) {
        console.error('Error updating currency:', err)
        return NextResponse.json({ error: 'Failed to update currency' }, { status: 500 })
    }
}

// DELETE - Delete currency (Admin only)
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { error } = await requireAdmin()
    if (error) return error

    try {
        const params = await context.params
        const id = parseInt(params.id)

        await prisma.currency.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Currency deleted successfully' })
    } catch (err) {
        console.error('Error deleting currency:', err)
        return NextResponse.json({ error: 'Failed to delete currency' }, { status: 500 })
    }
}
