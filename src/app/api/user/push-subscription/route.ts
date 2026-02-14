
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

const subscriptionSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        auth: z.string(),
        p256dh: z.string(),
    }),
})

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { endpoint, keys } = subscriptionSchema.parse(body)

        // Upsert subscription (if endpoint exists, update keys/userId)
        const subscription = await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                userId: Number(session.user.id),
                auth: keys.auth,
                p256dh: keys.p256dh,
            },
            create: {
                userId: Number(session.user.id),
                endpoint,
                auth: keys.auth,
                p256dh: keys.p256dh,
            },
        })

        return NextResponse.json({ success: true, id: subscription.id })
    } catch (error) {
        console.error('Error saving subscription:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { endpoint } = await req.json()

        await prisma.pushSubscription.delete({
            where: { endpoint },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting subscription:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
