import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const connectionString = process.env.DATABASE_URL || ''

if (!connectionString && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL ERROR: DATABASE_URL environment variable is not set. Please add it to your Netlify dashboard under Site Settings -> Environment Variables.');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    datasourceUrl: connectionString ? connectionString : undefined,
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
