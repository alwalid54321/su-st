import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkRateLimit, recordFailedAttempt } from '@/lib/rate-limit'
import { sendVerificationEmail } from '@/lib/mail'
import crypto from 'crypto'

const resendSchema = z.object({
    email: z.string().email()
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const validationResult = resendSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            )
        }

        const { email } = validationResult.data
        const lowerEmail = email.toLowerCase()

        // Rate limit checks - stricter for resend
        const rateLimitKey = `resend_${lowerEmail}`
        const rateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000) // 3 resends per hour

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many resend attempts. Please wait a while.' },
                { status: 429 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email: lowerEmail }
        })

        if (!user) {
            recordFailedAttempt(rateLimitKey)
            // Generic message
            return NextResponse.json(
                { message: 'If an account exists, a new code has been sent.' },
                { status: 200 }
            )
        }

        if (user.emailVerified) {
            return NextResponse.json(
                { message: 'Account is already verified. Please login.' },
                { status: 400 }
            )
        }

        // Generate new OTP
        const otp = crypto.randomInt(100000, 999999).toString()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        // Create new EmailOTP record
        await prisma.emailOTP.create({
            data: {
                email: lowerEmail,
                otp,
                expiresAt,
                purpose: 'verification',
                userId: user.id
            }
        })

        // Send verification email
        await sendVerificationEmail(lowerEmail, otp)

        return NextResponse.json(
            { message: 'Verification code resent successfully.' },
            { status: 200 }
        )

    } catch (error) {
        console.error('Resend error:', error)
        return NextResponse.json(
            { error: 'An error occurred.' },
            { status: 500 }
        )
    }
}
