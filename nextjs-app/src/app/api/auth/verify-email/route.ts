import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { checkRateLimit, recordFailedAttempt, clearAttempts } from '@/lib/rate-limit'

const verifySchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, 'OTP must be 6 digits')
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const validationResult = verifySchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten().fieldErrors },
                { status: 400 }
            )
        }

        const { email, otp } = validationResult.data
        const lowerEmail = email.toLowerCase()

        // Rate limit checks
        const rateLimitKey = `verify_${lowerEmail}`
        const rateLimit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000) // 5 attempts per 15 mins

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many verification attempts. Please try again later.' },
                { status: 429 }
            )
        }

        // Find valid OTP
        const emailOTP = await prisma.emailOTP.findFirst({
            where: {
                email: lowerEmail,
                otp,
                purpose: 'verification',
                isUsed: false,
                expiresAt: {
                    gt: new Date()
                }
            },
            include: {
                user: true
            }
        })

        if (!emailOTP) {
            recordFailedAttempt(rateLimitKey)

            // Increment verification attempts on the latest OTP record for this email to track generic failures
            // This is complex to do perfectly without a specific ID, but rate limiting handles the brute force aspect.

            return NextResponse.json(
                { error: 'Invalid or expired verification code.' },
                { status: 400 }
            )
        }

        // Mark OTP as used
        await prisma.emailOTP.update({
            where: { id: emailOTP.id },
            data: { isUsed: true }
        })

        // Update user as verified
        if (emailOTP.userId) {
            await prisma.user.update({
                where: { id: emailOTP.userId },
                data: { emailVerified: true }
            })
        }

        // Clear rate limits upon success
        clearAttempts(rateLimitKey)

        return NextResponse.json(
            { message: 'Email verified successfully!' },
            { status: 200 }
        )

    } catch (error) {
        console.error('Verification error:', error)
        return NextResponse.json(
            { error: 'An error occurred during verification.' },
            { status: 500 }
        )
    }
}
