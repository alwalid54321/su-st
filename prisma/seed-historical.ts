import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting historical data seeding...');

    // Get all commodities from MarketData
    const commodities = await prisma.marketData.findMany();

    if (commodities.length === 0) {
        console.log('⚠️ No commodities found in MarketData. Please seed basic data first.');
        return;
    }

    const now = new Date();

    // Last Month (approx 30 days ago)
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);
    // Normalize to start of day for easier tracking
    lastMonth.setHours(12, 0, 0, 0);

    // Three Months Ago (approx 90 days ago)
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    threeMonthsAgo.setHours(12, 0, 0, 0);

    const dates = [
        { label: 'last month', date: lastMonth },
        { label: 'three months ago', date: threeMonthsAgo }
    ];

    for (const commodity of commodities) {
        for (const { label, date } of dates) {
            // Check if data for this product around this date already exists to avoid duplication
            const startTime = new Date(date);
            startTime.setHours(0, 0, 0, 0);
            const endTime = new Date(date);
            endTime.setHours(23, 59, 59, 999);

            const existing = await prisma.marketDataArchive.findFirst({
                where: {
                    originalId: commodity.id,
                    archivedAt: {
                        gte: startTime,
                        lte: endTime
                    }
                }
            });

            if (existing) {
                console.log(`⏩ Skipping ${commodity.name} (${label}) - Data already exists for this date.`);
                continue;
            }

            // Generate some realistic variation (+/- 5-15%)
            // If we go back in time, let's simulate some trend
            // For 3 months ago, let's say prices were slightly lower or higher
            const monthsBack = label === 'last month' ? 1 : 3;
            const trendFactor = 1 - (monthsBack * 0.02); // 2% decrease per month back as a base
            const randomVariation = 0.95 + (Math.random() * 0.1); // +/- 5% randomness
            const totalFactor = trendFactor * randomVariation;

            const value = parseFloat((commodity.value * totalFactor).toFixed(2));
            const portSudan = parseFloat((commodity.portSudan * totalFactor).toFixed(2));
            const dmtChina = parseFloat((commodity.dmtChina * totalFactor).toFixed(2));
            const dmtUae = parseFloat((commodity.dmtUae * totalFactor).toFixed(2));
            const dmtMersing = parseFloat((commodity.dmtMersing * totalFactor).toFixed(2));
            const dmtIndia = parseFloat((commodity.dmtIndia * totalFactor).toFixed(2));

            await prisma.marketDataArchive.create({
                data: {
                    originalId: commodity.id,
                    name: commodity.name,
                    value: value,
                    portSudan: portSudan,
                    dmtChina: dmtChina,
                    dmtUae: dmtUae,
                    dmtMersing: dmtMersing,
                    dmtIndia: dmtIndia,
                    status: commodity.status,
                    forecast: Math.random() > 0.5 ? 'Stable' : (Math.random() > 0.4 ? 'Rising' : 'Falling'),
                    trend: Math.floor(Math.random() * 10) - 5,
                    imageUrl: commodity.imageUrl,
                    archivedAt: date,
                    lastUpdate: date,
                    createdAt: date,
                }
            });
            console.log(`✅ Created historical data for ${commodity.name} (${label}) - Value: ${value}`);
        }
    }

    console.log('✨ Historical data seeding finished.');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
