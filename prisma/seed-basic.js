const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seeding currencies...')

    // Create currencies with existing flag images
    const currencies = [
        { code: 'USD', name: 'US Dollar', rate: 755.00, isCurrent: true },
        { code: 'AED', name: 'UAE Dirham', rate: 207.50, isCurrent: true },
        { code: 'CNY', name: 'Chinese Yuan', rate: 105.00, isCurrent: true },
        { code: 'INR', name: 'Indian Rupee', rate: 9.00, isCurrent: true },
        { code: 'TRY', name: 'Turkish Lira', rate: 23.00, isCurrent: true },
        { code: 'SDG', name: 'Sudanese Pound', rate: 1.00, isCurrent: true },
    ]

    await prisma.currency.deleteMany({})

    for (const curr of currencies) {
        await prisma.currency.create({ data: curr })
        console.log(`Created currency: ${curr.code}`)
    }

    console.log('Seeding gallery...')

    // Create gallery images using existing SVG slides
    const galleryImages = [
        {
            title: 'Agricultural Excellence',
            description: 'Premium Sudanese agricultural products',
            imageUrl: '/images/gallery/slide1.svg',
            order: 1,
            isActive: true,
            isCurrent: true
        },
        {
            title: 'Quality Assurance',
            description: 'Our commitment to quality standards',
            imageUrl: '/images/gallery/slide2.svg',
            order: 2,
            isActive: true,
            isCurrent: true
        },
        {
            title: 'Global Trade',
            description: 'Connecting Sudan to the world',
            imageUrl: '/images/gallery/slide3.svg',
            order: 3,
            isActive: true,
            isCurrent: true
        },
    ]

    await prisma.galleryImage.deleteMany({})

    for (const img of galleryImages) {
        await prisma.galleryImage.create({ data: img })
        console.log(`Created gallery image: ${img.title}`)
    }

    console.log('Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error('Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
