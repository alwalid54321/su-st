import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { sendPushNotification } from '@/lib/notifications'

// Limit requests to this endpoint so it doesn't get abused
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate Limit: 5 test notifications per hour per user
    const rateLimitKey = `test_push_${session.user.id}`
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000)

    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: 'Rate limit exceeded. Please wait before sending another test.' },
            { status: 429 }
        )
    }

    try {
        // Fetch the user's subscriptions
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId: Number(session.user.id) }
        })

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ error: 'No active push subscriptions found.' }, { status: 404 })
        }

        let successCount = 0;
        let failureCount = 0;

        for (const sub of subscriptions) {
            const success = await sendPushNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { auth: sub.auth, p256dh: sub.p256dh }
                },
                JSON.stringify({
                    title: 'SudaStock Test Alert',
                    body: 'Your device is successfully receiving notifications from SudaStock.',
                    url: '/user'
                })
            );

            if (success) {
                successCount++;
            } else {
                failureCount++;
                // If it fails, maybe the subscription is expired. In production, we'd delete it.
                // await prisma.pushSubscription.delete({ where: { id: sub.id } })
            }
        }

        if (successCount > 0) {
            return NextResponse.json({ success: true, message: `Sent test notification to ${successCount} device(s).` })
        } else {
            return NextResponse.json({ error: 'Failed to send test notification. Devices may be offline or subscriptions expired.' }, { status: 500 })
        }

    } catch (error) {
        console.error('Error sending test notification:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
