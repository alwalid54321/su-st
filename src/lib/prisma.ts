import { Pool, neonConfig } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'
import ws from 'ws'

// Required for Neon adapter in some Node environments
if (process.env.NODE_ENV === 'production') {
    neonConfig.webSocketConstructor = ws
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// Netlify sometimes needs a clean DATABASE_URL from process.env
const connectionString = `${process.env.DATABASE_URL || ''}`

let prisma: PrismaClient

// Detect production or serverless environments
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.NETLIFY

if (connectionString && connectionString.startsWith('postgres') && isProduction) {
    try {
        console.log(`[Prisma] Initializing Neon Serverless Adapter...`)

        const pool = new Pool({ connectionString })
        const adapter = new PrismaNeon(pool as any)

        prisma = globalForPrisma.prisma ?? new PrismaClient({
            adapter: adapter as any,
            datasourceUrl: connectionString
        })
    } catch (e) {
        console.error('[Prisma] Error with adapter, attempting standard client:', e)
        prisma = globalForPrisma.prisma ?? new PrismaClient({
            datasourceUrl: connectionString
        })
    }
} else {
    if (!connectionString) {
        console.error('[Prisma] CRITICAL: DATABASE_URL is missing!')
    }

    // Standard TCP connection for development
    prisma = globalForPrisma.prisma ?? new PrismaClient(
        connectionString ? { datasourceUrl: connectionString } : undefined
    )
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
