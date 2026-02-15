import { Pool } from '@neondatabase/serverless'
import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL

let prisma: PrismaClient

// Only use the Neon adapter in production/serverless environments
if (connectionString && process.env.NODE_ENV === 'production') {
    const pool = new Pool({ connectionString })
    const adapter = new PrismaNeon(pool)
    prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
} else {
    // Standard TCP connection for development
    prisma = globalForPrisma.prisma ?? new PrismaClient()
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
