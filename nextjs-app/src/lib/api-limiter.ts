
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter
const ipRequestCounts = new Map<string, { count: number, resetTime: number }>();

// Clean up expired entries every minute
if (!(global as any).rateLimitCleanup) {
    (global as any).rateLimitCleanup = setInterval(() => {
        const now = Date.now();
        for (const [ip, data] of ipRequestCounts.entries()) {
            if (now > data.resetTime) {
                ipRequestCounts.delete(ip);
            }
        }
    }, 60000);
}

interface RateLimitConfig {
    limit: number;      // Max requests
    windowMs: number;   // Time window in milliseconds
}

export function rateLimit(req: NextRequest, config: RateLimitConfig = { limit: 100, windowMs: 60000 }) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();

    const record = ipRequestCounts.get(ip);

    if (!record) {
        ipRequestCounts.set(ip, { count: 1, resetTime: now + config.windowMs });
        return { success: true };
    }

    if (now > record.resetTime) {
        ipRequestCounts.set(ip, { count: 1, resetTime: now + config.windowMs });
        return { success: true };
    }

    if (record.count >= config.limit) {
        return {
            success: false,
            reset: Math.ceil((record.resetTime - now) / 1000)
        };
    }

    record.count++;
    return { success: true };
}
