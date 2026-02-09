
export interface RateLimitStatus {
    allowed: boolean
    remainingAttempts?: number
    lockedUntil?: number
}

// In-memory store for rate limiting
// In a production environment with multiple server instances, use Redis instead
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

// Prune expired entries every 10 minutes to prevent memory leaks
const PRUNE_INTERVAL = 10 * 60 * 1000

// Use a distinct global variable name to avoid conflicts
const globalForRateLimit = global as unknown as { rateLimitPruneInterval: NodeJS.Timeout | undefined }

if (!globalForRateLimit.rateLimitPruneInterval) {
    globalForRateLimit.rateLimitPruneInterval = setInterval(() => {
        const now = Date.now()
        for (const [key, value] of loginAttempts.entries()) {
            if (now - value.lastAttempt > LOCKOUT_DURATION) {
                loginAttempts.delete(key)
            }
        }
    }, PRUNE_INTERVAL)
}

export function checkRateLimit(identifier: string, maxAttempts: number = MAX_LOGIN_ATTEMPTS, lockoutDuration: number = LOCKOUT_DURATION): RateLimitStatus {
    const now = Date.now()
    const attempts = loginAttempts.get(identifier)

    if (!attempts) {
        return { allowed: true, remainingAttempts: maxAttempts }
    }

    // Check if lockout period has passed
    if (now - attempts.lastAttempt > lockoutDuration) {
        loginAttempts.delete(identifier)
        return { allowed: true, remainingAttempts: maxAttempts }
    }

    if (attempts.count >= maxAttempts) {
        return {
            allowed: false,
            lockedUntil: attempts.lastAttempt + lockoutDuration
        }
    }

    return { allowed: true, remainingAttempts: maxAttempts - attempts.count }
}

export function recordFailedAttempt(identifier: string) {
    const now = Date.now()
    const attempts = loginAttempts.get(identifier)

    if (!attempts) {
        loginAttempts.set(identifier, { count: 1, lastAttempt: now })
    } else {
        loginAttempts.set(identifier, { count: attempts.count + 1, lastAttempt: now })
    }
}

export function clearAttempts(identifier: string) {
    loginAttempts.delete(identifier)
}
