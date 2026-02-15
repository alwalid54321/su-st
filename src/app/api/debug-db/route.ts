import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const dbUrlLength = process.env.DATABASE_URL?.length || 0;
    const nodeEnv = process.env.NODE_ENV;
    const isNetlify = !!process.env.NETLIFY;

    try {
        // Try a simple query
        const userCount = await prisma.user.count();

        return NextResponse.json({
            status: 'connected',
            diagnostics: {
                hasDbUrl,
                dbUrlLength,
                nodeEnv,
                isNetlify,
                userCount
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            error: error.message,
            diagnostics: {
                hasDbUrl,
                dbUrlLength,
                nodeEnv,
                isNetlify,
            }
        }, { status: 500 });
    }
}
