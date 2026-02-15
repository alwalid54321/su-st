import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
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
                session.user.id = token.id as string;
                (session.user as any).username = token.username;
                (session.user as any).isStaff = token.isStaff;
                (session.user as any).isSuperuser = token.isSuperuser;
                (session.user as any).plan = token.plan || 'free'
            }
            return session
        }
    },
    providers: [], // Providers are added in the main auth.ts
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
    }
} satisfies NextAuthConfig
