import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { checkRateLimit, recordFailedAttempt } from '@/lib/rate-limit'
import { sendVerificationEmail } from '@/lib/mail'
import crypto from 'crypto'

// Password validation schema with strength requirements
const registerSchema = z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(128, 'Password is too long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username is too long')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    // Honey pot field - should be empty
    _gotcha: z.string().optional()
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validationResult = registerSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Validation failed',
                    details: validationResult.error.flatten().fieldErrors
                },
                { status: 400 }
            )
        }

        const { email, password, username, firstName, lastName, _gotcha } = validationResult.data

        // Bot check - Honeypot
        if (_gotcha) {
            // Silently fail for bots or return generic error
            console.warn(`Bot attempt detected. IP: ${request.headers.get('x-forwarded-for')}, Email: ${email}`)
            return NextResponse.json(
                { error: 'Registration failed. Please try again.' },
                { status: 400 }
            )
        }

        // Rate limit check (using IP or email logic, here using IP as fallback or email if provided)
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const rateLimitKey = `register_${ip}`
        const rateLimit = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000) // 3 attempts per hour per IP

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many registration attempts. Please try again later.' },
                { status: 429 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        })

        if (existingUser) {
            recordFailedAttempt(rateLimitKey)
            // Generic error to prevent user enumeration
            return NextResponse.json(
                { error: 'Registration failed. Please try again.' },
                { status: 400 }
            )
        }

        // Hash password with bcrypt (salt rounds = 12 for extra security)
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                firstName: firstName || null,
                lastName: lastName || null,
                isStaff: false,
                isSuperuser: false,
                isActive: true, // User can login but might be limited
                emailVerified: false
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true
            }
        })

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        // Create EmailOTP record
        await prisma.emailOTP.create({
            data: {
                email,
                otp,
                expiresAt,
                purpose: 'verification',
                userId: user.id
            }
        })

        // Send verification email
        await sendVerificationEmail(email, otp)

        // Log registration (for security audit)
        console.log(`New user registered: ${user.email} at ${new Date().toISOString()}`)

        return NextResponse.json(
            {
                message: 'Account created successfully! Please check your email for verification code.',
                user,
                requiresVerification: true
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json(
            { error: 'An error occurred during registration. Please try again.' },
            { status: 500 }
        )
    }
}
