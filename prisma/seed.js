const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    // Create dummy market data with enhanced product details
    const products = [
        {
            name: 'Sesame Seeds (White)',
            portSudan: 1450.00,
            dmtChina: 1580.00,
            dmtUae: 1520.00,
            dmtMersing: 1550.00,
            dmtIndia: 1500.00,
            status: 'Active',
            forecast: 'Rising',
            trend: 2,
            imageUrl: '/images/products/sesame.jpg',
            category: 'sesame',
            description: 'Premium quality Sudanese white sesame seeds, known for their high oil content and purity.',
            specifications: JSON.stringify({
                purity: '99.9%',
                oil_content: 'Min 50%',
                moisture: 'Max 5%',
                admixture: 'Max 1%'
            }),
            details: JSON.stringify([
                'Origin: Gadaref, Sudan',
                'Crop Year: 2024',
                'Packaging: 50kg PP Bags'
            ]),
            availability: JSON.stringify({
                'Jan': 'high', 'Feb': 'high', 'Mar': 'medium', 'Apr': 'low',
                'May': 'none', 'Jun': 'none', 'Jul': 'none', 'Aug': 'none',
                'Sep': 'low', 'Oct': 'medium', 'Nov': 'high', 'Dec': 'high'
            })
        },
        {
            name: 'Sesame Seeds (Red)',
            portSudan: 1380.00,
            dmtChina: 1510.00,
            dmtUae: 1450.00,
            dmtMersing: 1480.00,
            dmtIndia: 1430.00,
            status: 'Active',
            forecast: 'Stable',
            trend: 0,
            imageUrl: '/images/products/sesame-red.jpg',
            category: 'sesame',
            description: 'High-quality red sesame seeds with distinct flavor profile, perfect for culinary and oil applications.',
            specifications: JSON.stringify({
                purity: '99.5%',
                oil_content: 'Min 48%',
                moisture: 'Max 5%',
                admixture: 'Max 1.5%'
            }),
            details: JSON.stringify([
                'Origin: Gedaref, Sudan',
                'Crop Year: 2024',
                'Packaging: 50kg PP Bags'
            ]),
            availability: JSON.stringify({
                'Jan': 'high', 'Feb': 'high', 'Mar': 'high', 'Apr': 'medium',
                'May': 'low', 'Jun': 'none', 'Jul': 'none', 'Aug': 'none',
                'Sep': 'low', 'Oct': 'medium', 'Nov': 'high', 'Dec': 'high'
            })
        },
        {
            name: 'Peanuts (Bold)',
            portSudan: 1100.00,
            dmtChina: 1250.00,
            dmtUae: 1180.00,
            dmtMersing: 1220.00,
            dmtIndia: 1150.00,
            status: 'Limited',
            forecast: 'Rising',
            trend: 5,
            imageUrl: '/images/products/peanuts.jpg',
            category: 'others',
            description: 'Bold variety groundnuts with large kernels, perfect for oil extraction and direct consumption.',
            specifications: JSON.stringify({
                type: 'Bold / Java',
                oil_content: '48-50%',
                moisture: 'Max 7%',
                aflatoxin: 'Max 10ppb'
            }),
            details: JSON.stringify([
                'Origin: Darfur/Kordofan',
                'Size: 40/50, 50/60',
                'Packaging: 50kg Jute Bags'
            ]),
            availability: JSON.stringify({
                'Jan': 'high', 'Feb': 'medium', 'Mar': 'low', 'Apr': 'none',
                'May': 'none', 'Jun': 'none', 'Jul': 'none', 'Aug': 'none',
                'Sep': 'low', 'Oct': 'medium', 'Nov': 'high', 'Dec': 'high'
            })
        },
        {
            name: 'Gum Arabic (Hashab)',
            portSudan: 2800.00,
            dmtChina: 3100.00,
            dmtUae: 2950.00,
            dmtMersing: 3050.00,
            dmtIndia: 2900.00,
            status: 'Active',
            forecast: 'Stable',
            trend: 1,
            imageUrl: '/images/products/gum.jpg',
            category: 'gum',
            description: 'High-grade Acacia Senegal gum, essential for food and pharmaceutical industries.',
            specifications: JSON.stringify({
                type: 'Acacia Senegal',
                grade: 'Hand Picked Selected',
                moisture: 'Max 10%',
                ash: 'Max 3%'
            }),
            details: JSON.stringify([
                'Origin: Kordofan, Sudan',
                'Processing: Cleaned & Sifted',
                'Packaging: 25kg/50kg Bags'
            ]),
            availability: JSON.stringify({
                'Jan': 'high', 'Feb': 'high', 'Mar': 'high', 'Apr': 'medium',
                'May': 'medium', 'Jun': 'low', 'Jul': 'low', 'Aug': 'low',
                'Sep': 'low', 'Oct': 'medium', 'Nov': 'high', 'Dec': 'high'
            })
        },
        {
            name: 'Hibiscus Flower',
            portSudan: 1600.00,
            dmtChina: 1800.00,
            dmtUae: 1700.00,
            dmtMersing: 1750.00,
            dmtIndia: 1650.00,
            status: 'Inactive',
            forecast: 'Falling',
            trend: -3,
            imageUrl: '/images/products/hibiscus.jpg',
            category: 'others',
            description: 'Premium dried hibiscus flowers, widely used for beverages, natural colorings, and herbal remedies.',
            specifications: JSON.stringify({
                type: 'Hibiscus Sabdariffa',
                moisture: 'Max 10%',
                purity: '98%',
                color: 'Deep Red'
            }),
            details: JSON.stringify([
                'Origin: Kordofan, Sudan',
                'Processing: Sun-dried',
                'Packaging: 25kg PP Bags'
            ]),
            availability: JSON.stringify({
                'Jan': 'medium', 'Feb': 'low', 'Mar': 'none', 'Apr': 'none',
                'May': 'none', 'Jun': 'none', 'Jul': 'none', 'Aug': 'none',
                'Sep': 'low', 'Oct': 'medium', 'Nov': 'high', 'Dec': 'medium'
            })
        }
    ]

    // Clear existing data
    await prisma.marketData.deleteMany({})

    // Insert new data
    for (const product of products) {
        await prisma.marketData.create({
            data: product
        })
    }

    console.log('Enhanced market data with product details added successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })