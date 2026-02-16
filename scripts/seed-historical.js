// PART 2: Generate Historical Data (365 days)
// Run this with: node scripts/seed-historical.js
// This will populate the archive tables with historical data

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting historical data generation...\n');

    const DAYS_TO_GENERATE = 365;

    // Get all currencies
    const currencies = await prisma.currency.findMany();
    console.log(`📊 Found ${currencies.length} currencies`);

    // Get all market data
    const marketData = await prisma.marketData.findMany();
    console.log(`📦 Found ${marketData.length} market products\n`);

    if (currencies.length === 0) {
        console.log('❌ No currencies found! Run the currency seed first.');
        return;
    }

    if (marketData.length === 0) {
        console.log('❌ No market data found! Run seed-products.sql first.');
        return;
    }

    // Generate Currency History
    console.log('💱 Generating currency history...');
    let currencyCount = 0;

    for (const currency of currencies) {
        const records = [];

        for (let daysAgo = 1; daysAgo <= DAYS_TO_GENERATE; daysAgo++) {
            const variance = (Math.random() * 0.1) - 0.05; // ±5%
            const historicalRate = currency.rate * (1 + variance);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            records.push({
                originalId: currency.id,
                code: currency.code,
                name: currency.name,
                rate: parseFloat(historicalRate.toFixed(4)),
                archivedAt: date,
                lastUpdate: date
            });

            // Insert in batches of 100 to avoid memory issues
            if (records.length >= 100) {
                await prisma.currencyArchive.createMany({
                    data: records,
                    skipDuplicates: true
                });
                currencyCount += records.length;
                records.length = 0; // Clear array
            }
        }

        // Insert remaining records
        if (records.length > 0) {
            await prisma.currencyArchive.createMany({
                data: records,
                skipDuplicates: true
            });
            currencyCount += records.length;
        }

        process.stdout.write(`  ✓ ${currency.code} (${DAYS_TO_GENERATE} days)\n`);
    }

    console.log(`\n✅ Generated ${currencyCount} currency history records\n`);

    // Generate Market Data History
    console.log('📈 Generating market data history...');
    let marketCount = 0;

    for (const product of marketData) {
        const records = [];

        for (let daysAgo = 1; daysAgo <= DAYS_TO_GENERATE; daysAgo++) {
            const variance = (Math.random() * 0.2) - 0.1; // ±10%
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const forecasts = ['Rising', 'Stable', 'Falling'];
            const randomForecast = forecasts[Math.floor(Math.random() * forecasts.length)];
            const randomTrend = Math.floor(Math.random() * 21) - 10; // -10 to +10

            records.push({
                originalId: product.id,
                name: product.name,
                value: parseFloat((product.value * (1 + variance)).toFixed(2)),
                portSudan: parseFloat((product.portSudan * (1 + variance)).toFixed(2)),
                dmtChina: parseFloat((product.dmtChina * (1 + variance)).toFixed(2)),
                dmtUae: parseFloat((product.dmtUae * (1 + variance)).toFixed(2)),
                dmtMersing: parseFloat((product.dmtMersing * (1 + variance)).toFixed(2)),
                dmtIndia: parseFloat((product.dmtIndia * (1 + variance)).toFixed(2)),
                status: product.status,
                forecast: randomForecast,
                trend: randomTrend,
                imageUrl: product.imageUrl,
                archivedAt: date,
                lastUpdate: date,
                createdAt: product.createdAt
            });

            // Insert in batches of 50
            if (records.length >= 50) {
                await prisma.marketDataArchive.createMany({
                    data: records,
                    skipDuplicates: true
                });
                marketCount += records.length;
                records.length = 0;
            }
        }

        // Insert remaining records
        if (records.length > 0) {
            await prisma.marketDataArchive.createMany({
                data: records,
                skipDuplicates: true
            });
            marketCount += records.length;
        }

        process.stdout.write(`  ✓ ${product.name} (${DAYS_TO_GENERATE} days)\n`);
    }

    console.log(`\n✅ Generated ${marketCount} market data history records\n`);

    // Final summary
    const totalCurrencyHistory = await prisma.currencyArchive.count();
    const totalMarketHistory = await prisma.marketDataArchive.count();

    console.log('═══════════════════════════════════════');
    console.log('🎉 Historical Data Generation Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Total Currency History: ${totalCurrencyHistory}`);
    console.log(`📦 Total Market History: ${totalMarketHistory}`);
    console.log('═══════════════════════════════════════\n');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
