import NextAuth, { User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { checkRateLimit, recordFailedAttempt, clearAttempts } from "@/lib/rate-limit"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        Google,
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                otp: { label: "OTP", type: "text" }
            },
            async authorize(credentials): Promise<User | null> {
                if (!credentials?.email) {
                    console.warn('Auth: Missing email');
                    return null
                }
                
                const hasPassword = !!credentials?.password;
                const hasOtp = !!credentials?.otp;
                
                if (!hasPassword && !hasOtp) {
                    return null;
                }

                const email = (credentials.email as string).toLowerCase()

                // Use login_ prefix to prevent collisions with other endpoints (like forgot-password)
                const rateLimitKey = `login_${email}`
                const rateLimitCheck = checkRateLimit(rateLimitKey)
                if (!rateLimitCheck.allowed) {
                    console.warn(`Auth: Rate limited for ${email}`);
                    throw new Error('Too many login attempts. Please try again later.')
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email }
                    })

                    if (!user) {
                        console.warn(`Auth: User not found: ${email}`);
                        recordFailedAttempt(rateLimitKey)
                        return null
                    }

                    if (!user.isActive) {
                        console.warn(`Auth: Account disabled: ${email}`);
                        throw new Error('Account is disabled. Please contact support.')
                    }

                    if (hasOtp) {
                        // OTP Login Flow
                        const validOtp = await prisma.emailOTP.findFirst({
                            where: {
                                email,
                                otp: credentials.otp as string,
                                purpose: 'login',
                                isUsed: false,
                                expiresAt: { gt: new Date() }
                            },
                            orderBy: { createdAt: 'desc' }
                        })

                        if (!validOtp) {
                            console.warn(`Auth: Invalid OTP for ${email}`);
                            recordFailedAttempt(rateLimitKey)
                            throw new Error('Invalid or expired OTP')
                        }

                        // Mark as used
                        await prisma.emailOTP.update({
                            where: { id: validOtp.id },
                            data: { isUsed: true, verificationAttempts: { increment: 1 } }
                        })
                    } else if (hasPassword) {
                        // Password Login Flow
                        if (!user.password) {
                             throw new Error('Please login with a social provider or OTP.')
                        }
                        const isPasswordValid = await bcrypt.compare(
                            credentials.password as string,
                            user.password
                        )

                        if (!isPasswordValid) {
                            console.warn(`Auth: Invalid password for ${email}`);
                            recordFailedAttempt(rateLimitKey)
                            throw new Error('Invalid email or password')
                        }
                    }

                    // Clear failed attempts on successful login
                    clearAttempts(rateLimitKey)

                    console.log(`Auth: Successful login for ${user.email}`);

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.username,
                        username: user.username,
                        isStaff: user.isStaff,
                        isSuperuser: user.isSuperuser,
                        isActive: user.isActive,
                        plan: user.plan || 'free'
                    } as User
                } catch (error: any) {
                    console.error('Auth: Login error:', error.message)
                    throw error
                }
            }
        })
    ],
    events: {
        async linkAccount({ user }) {
            // Automatically verify email when linking social accounts
            await prisma.user.update({
                where: { id: parseInt(user.id as string) },
                data: { emailVerified: new Date() }
            })
        }
    }
})
