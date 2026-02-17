import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    const session = await auth();

    if (!session || !((session.user as any)?.isStaff || (session.user as any)?.isSuperuser)) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        // Basic Stats
        const [totalProducts, totalVariations, totalPorts, totalCurrencies, latestUsers, latestAnnouncements] = await Promise.all([
            prisma.marketData.count({ where: { isCurrent: true } }),
            prisma.productVariation.count({ where: { isActive: true } }),
            prisma.port.count({ where: { isActive: true } }),
            prisma.currency.count({ where: { isCurrent: true } }),
            prisma.user.findMany({
                take: 5,
                orderBy: { dateJoined: 'desc' },
                select: { id: true, username: true, email: true, dateJoined: true, plan: true }
            }),
            prisma.announcement.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, category: true, createdAt: true }
            })
        ]);

        // Mock historical data for now based on actual dates
        // In a real scenario, we'd query aggregates from MarketDataArchive
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
        });

        // Get some variation in data for the graph
        const volumeData = [420, 580, 750, 820, 610, 590, 880];

        // Recent activities - get the last 5 market data updates
        const recentUpdates = await prisma.marketData.findMany({
            take: 5,
            orderBy: { lastUpdate: 'desc' },
            select: { id: true, name: true, lastUpdate: true, status: true }
        });

        const mappedActivities = recentUpdates.map(update => ({
            id: update.id,
            title: 'Price Updated',
            desc: `${update.name} market values were synchronized`,
            time: formatTimeAgo(new Date(update.lastUpdate)),
            type: 'info'
        }));

        return NextResponse.json({
            stats: {
                totalProducts,
                totalVariations,
                totalPorts,
                totalCurrencies,
            },
            chart: {
                labels: last7Days,
                data: volumeData
            },
            latestUsers: latestUsers.map(u => ({ ...u, dateJoined: formatTimeAgo(new Date(u.dateJoined)) })),
            latestAnnouncements: latestAnnouncements.map(a => ({ ...a, createdAt: formatTimeAgo(new Date(a.createdAt)) })),
            activities: mappedActivities.length > 0 ? mappedActivities : [
                { title: 'System Online', time: 'Just now', desc: 'Secure Admin Portal Initialized', type: 'success' }
            ]
        });
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

function formatTimeAgo(date: Date) {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
}
