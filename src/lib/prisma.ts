import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

let prisma: PrismaClient

// Ensure we use the serverless adapter in production ONLY if a valid string is present
if (connectionString && process.env.NODE_ENV === 'production') {
    try {
        const pool = new Pool({ connectionString: connectionString })
        const adapter = new PrismaNeon(pool)
        prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
    } catch (e) {
        console.error('Failed to initialize Prisma with Neon adapter:', e)
        prisma = globalForPrisma.prisma ?? new PrismaClient()
    }
} else {
    // Standard TCP connection for development
    prisma = globalForPrisma.prisma ?? new PrismaClient()
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
