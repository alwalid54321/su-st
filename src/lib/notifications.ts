
import nodemailer from 'nodemailer'
import webpush from 'web-push'

// Configure Web Push with VAPID keys from env
// NOTE: Generate these with `npx web-push generate-vapid-keys` and add to .env
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:support@sudastock.com',
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY || ''
    )
}

// EMAIL SENDER
export async function sendEmailNotification(to: string, subject: string, html: string) {
    if (!process.env.SMTP_HOST) {
        console.warn('SMTP_HOST not set, skipping email.')
        return
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })

    // Verify transporter once (optional, but good for debugging)
    // await transporter.verify()

    try {
        const info = await transporter.sendMail({
            from: '"SudaStock Alerts" <no-reply@sudastock.com>',
            to,
            subject,
            html,
        })
        console.log('Email sent: %s', info.messageId)
        return true
    } catch (error) {
        console.error('Error sending email:', error)
        return false
    }
}

// PUSH NOTIFICATION SENDER
export async function sendPushNotification(subscription: webpush.PushSubscription, payload: string) {
    try {
        await webpush.sendNotification(subscription, payload)
        console.log('Push notification sent.')
        return true
    } catch (error) {
        console.error('Error sending push notification:', error)
        return false
    }
}
