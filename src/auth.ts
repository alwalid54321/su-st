import NextAuth, { User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"
import { checkRateLimit, recordFailedAttempt, clearAttempts } from "@/lib/rate-limit"

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<User | null> {
                if (!credentials?.email || !credentials?.password) {
                    console.warn('Auth: Missing email or password');
                    return null
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

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    )

                    if (!isPasswordValid) {
                        console.warn(`Auth: Invalid password for ${email}`);
                        recordFailedAttempt(rateLimitKey)
                        return null
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
})
