
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmailNotification, sendPushNotification } from '@/lib/notifications'

// This would typically be secured by a secret key in headers
export async function GET(req: NextRequest) {
    try {
        // 1. Fetch all active alerts with their market data
        const activeAlerts = await prisma.priceAlert.findMany({
            where: { isActive: true },
            include: {
                user: {
                    include: {
                        settings: true,
                        // We need push subscriptions too, but Prisma doesn't support deep include easily here without making it heavy.
                        // We'll fetch subscriptions separately if needed.
                    }
                },
                marketData: true,
            },
        })

        const results = []

        for (const alert of activeAlerts) {
            const { marketData, targetPrice, condition, user } = alert

            // Determine if condition is met
            let isMet = false
            if (condition === 'ABOVE' && marketData.value >= targetPrice) isMet = true
            if (condition === 'BELOW' && marketData.value <= targetPrice) isMet = true

            // Avoid re-triggering if already triggered recently (e.g., within 24h)
            // For simplicity, we just check if it's met. In production, we'd need a cool-down period.
            // Here we will deactivate the alert after triggering to prevent spam.

            if (isMet) {
                // Send Notifications
                const message = `Price Alert: ${marketData.name} is now ${condition.toLowerCase()} ${targetPrice} SDG. Current Price: ${marketData.value} SDG.`

                // Email
                if (user.settings?.emailNotifications) {
                    await sendEmailNotification(user.email, `Price Alert: ${marketData.name}`, message)
                }

                // Push
                const subscriptions = await prisma.pushSubscription.findMany({
                    where: { userId: user.id }
                })

                for (const sub of subscriptions) {
                    await sendPushNotification({
                        endpoint: sub.endpoint,
                        keys: { auth: sub.auth, p256dh: sub.p256dh }
                    }, JSON.stringify({ title: 'SudaStock Alert', body: message }))
                }

                // Deactivate alert (single-use for now)
                await prisma.priceAlert.update({
                    where: { id: alert.id },
                    data: { isActive: false, lastTriggered: new Date() }
                })

                results.push({ alertId: alert.id, status: 'Triggered' })
            }
        }

        return NextResponse.json({ processed: activeAlerts.length, triggered: results })
    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
