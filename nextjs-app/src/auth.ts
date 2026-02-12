import NextAuth, { User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

import { checkRateLimit, recordFailedAttempt, clearAttempts } from "@/lib/rate-limit"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials): Promise<User | null> {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const email = (credentials.email as string).toLowerCase()

                // Check rate limiting
                const rateLimitCheck = checkRateLimit(email)
                if (!rateLimitCheck.allowed) {
                    throw new Error('Too many login attempts. Please try again later.')
                }

                try {
                    const user = await prisma.user.findUnique({
                        where: { email }
                    })

                    if (!user) {
                        recordFailedAttempt(email)
                        // Generic error to prevent user enumeration
                        return null
                    }

                    // Check if account is active
                    if (!user.isActive) {
                        throw new Error('Account is disabled. Please contact support.')
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    )

                    if (!isPasswordValid) {
                        recordFailedAttempt(email)
                        return null
                    }

                    // Clear failed attempts on successful login
                    clearAttempts(email)

                    // Log successful login (for security audit)
                    console.log(`Successful login: ${user.email} at ${new Date().toISOString()}`)

                    // Update last login timestamp (optional)
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { lastLogin: new Date() }
                    })

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.username,
                        username: user.username,
                        isStaff: user.isStaff,
                        isSuperuser: user.isSuperuser,
                        plan: user.plan || 'free'
                    } as User
                } catch (error) {
                    console.error('Login error:', error)
                    throw error
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.username = (user as any).username
                token.isStaff = (user as any).isStaff
                token.isSuperuser = (user as any).isSuperuser
                token.plan = (user as any).plan || 'free'
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                    ; (session.user as any).username = token.username
                    ; (session.user as any).isStaff = token.isStaff
                    ; (session.user as any).isSuperuser = token.isSuperuser
                    ; (session.user as any).plan = token.plan || 'free'
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
    }
})

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const email = (credentials.email as string).toLowerCase()

                const rateLimitCheck = checkRateLimit(email)
                if (!rateLimitCheck.allowed) {
                    throw new Error('Too many login attempts. Please try again later.')
                }

                const user = await prisma.user.findUnique({
                    where: { email }
                })

                if (!user || !user.isActive) {
                    recordFailedAttempt(email)
                    return null
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                )

                if (!isPasswordValid) {
                    recordFailedAttempt(email)
                    return null
                }

                clearAttempts(email)

                return {
                    id: user.id.toString(),
                    email: user.email,
                    name: user.username,
                    username: user.username,
                    isStaff: user.isStaff,
                    isSuperuser: user.isSuperuser,
                    plan: user.plan || 'free'
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id
                token.username = user.username
                token.isStaff = user.isStaff
                token.isSuperuser = user.isSuperuser
                token.plan = user.plan || 'free'
            }
            return token
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id
                session.user.username = token.username
                session.user.isStaff = token.isStaff
                session.user.isSuperuser = token.isSuperuser
                session.user.plan = token.plan || 'free'
            }
            return session
        }
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 24 * 60 * 60,
    }
}
