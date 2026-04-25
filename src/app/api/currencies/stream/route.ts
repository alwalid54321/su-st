export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    let intervalId: NodeJS.Timeout

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()

            // In-memory state for initial rates and trends
            let currentData: any[] = []

            const pushData = async () => {
                if (req.signal.aborted) return

                try {
                    if (currentData.length === 0) {
                        // Fetch base data on first connection
                        const data = await prisma.currency.findMany({
                            orderBy: { code: 'asc' }
                        })
                        
                        currentData = data.map(currency => ({
                            ...currency,
                            trend: (Math.random() - 0.5) * 2 // Initial mock trend
                        }))
                    } else {
                        // Simulate natural market fluctuations
                        currentData = currentData.map(currency => {
                            const trendChange = (Math.random() - 0.5) * 0.5;
                            let newTrend = currency.trend + trendChange;
                            
                            if (newTrend > 3) newTrend = 3;
                            if (newTrend < -3) newTrend = -3;
                            
                            // Change the rate slightly based on the trend
                            const rateChangeMultiplier = 1 + (newTrend * 0.0005);
                            
                            return {
                                ...currency,
                                rate: currency.rate * rateChangeMultiplier,
                                trend: newTrend,
                                lastUpdate: new Date().toISOString()
                            }
                        })
                    }

                    const message = `data: ${JSON.stringify(currentData)}\n\n`
                    
                    if (!req.signal.aborted) {
                        controller.enqueue(encoder.encode(message))
                    }
                } catch (err) {
                    console.error('SSE Error:', err)
                }
            }

            await pushData()

            // Poll every 10 seconds for currency updates
            intervalId = setInterval(pushData, 10000)

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
