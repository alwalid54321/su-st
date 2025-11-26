import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

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
    lastName: z.string().optional()
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

        const { email, password, username, firstName, lastName } = validationResult.data

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
                isActive: true
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true
            }
        })

        // Log registration (for security audit)
        console.log(`New user registered: ${user.email} at ${new Date().toISOString()}`)

        return NextResponse.json(
            {
                message: 'Account created successfully! Please login to continue.',
                user
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
