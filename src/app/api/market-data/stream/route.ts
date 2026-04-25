export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    let intervalId: NodeJS.Timeout

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()

            // Define the push function
            const pushData = async () => {
                if (req.signal.aborted) return

                try {
                    const data = await prisma.marketData.findMany({
                        where: { isCurrent: true, status: 'Active' },
                        orderBy: { name: 'asc' }
                    })
                    const message = `data: ${JSON.stringify(data)}\n\n`
                    
                    // Final check before enqueue
                    if (!req.signal.aborted) {
                        controller.enqueue(encoder.encode(message))
                    }
                } catch (err) {
                    console.error('SSE Error:', err)
                }
            }

            // Push immediately on connect
            await pushData()

            // Poll every 5 seconds for updates
            intervalId = setInterval(pushData, 5000)

            // Keep connection alive with comments
            const pingInterval = setInterval(() => {
                if (!req.signal.aborted) {
                    try {
                        controller.enqueue(encoder.encode(': ping\n\n'))
                    } catch (e) {
                        clearInterval(pingInterval)
                    }
                }
            }, 10000)

            const cleanup = () => {
                clearInterval(intervalId)
                clearInterval(pingInterval)
                try {
                    controller.close()
                } catch (e) {
                    // Ignore already closed
                }
            }

            req.signal.addEventListener('abort', cleanup)
        },
        cancel() {
            clearInterval(intervalId)
        }
    })

    return new NextResponse(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    })
}
