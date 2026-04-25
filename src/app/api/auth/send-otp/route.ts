import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/mail'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        // Save to DB
        await prisma.emailOTP.create({
            data: {
                email: email.toLowerCase(),
                otp,
                expiresAt,
                purpose: 'login',
                ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            }
        })

        // Send email
        await sendVerificationEmail(email, otp)

        return NextResponse.json({ success: true, message: 'OTP sent to email' })
    } catch (error) {
        console.error('Send OTP Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
