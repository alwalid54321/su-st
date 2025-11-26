// Centralized Products Data - Synced with Market Data Table
export interface ProductSpecifications {
    [key: string]: string
}

export interface ProductAvailability {
    Jan: 'high' | 'medium' | 'low' | 'none'
    Feb: 'high' | 'medium' | 'low' | 'none'
    Mar: 'high' | 'medium' | 'low' | 'none'
    Apr: 'high' | 'medium' | 'low' | 'none'
    May: 'high' | 'medium' | 'low' | 'none'
    Jun: 'high' | 'medium' | 'low' | 'none'
    Jul: 'high' | 'medium' | 'low' | 'none'
    Aug: 'high' | 'medium' | 'low' | 'none'
    Sep: 'high' | 'medium' | 'low' | 'none'
    Oct: 'high' | 'medium' | 'low' | 'none'
    Nov: 'high' | 'medium' | 'low' | 'none'
    Dec: 'high' | 'medium' | 'low' | 'none'
}

export interface Product {
    id: string
    name: string
    category: 'sesame' | 'gum' | 'cotton' | 'others'
    image: string
    price: string
    state: 'In Stock' | 'Low Stock' | 'Out of Stock'
    trend: number
    description: string
    specifications: ProductSpecifications
    details: string[]
    availability: ProductAvailability
}

// Main products data - SYNCED with database seed (prisma/seed.js)
// These match the market data table products on the home page
export const PRODUCTS: Product[] = [
    {
        id: 'sesame-white',
        name: 'Sesame Seeds (White)',
        category: 'sesame',
        image: '/images/products/sesame.jpg',
        price: '1,450',
        state: 'In Stock',
        trend: 5.2,
        description: 'Premium quality Sudanese white sesame seeds, known for their high oil content and purity.',
        specifications: {
            purity: '99.9%',
            oil_content: 'Min 50%',
            moisture: 'Max 5%',
            admixture: 'Max 1%'
        },
        details: [
            'Origin: Gadaref, Sudan',
            'Crop Year: 2024',
            'Packaging: 50kg PP Bags'
        ],
        availability: {
            'Jan': 'high', 'Feb': 'high', 'Mar': 'medium', 'Apr': 'low',
            'May': 'none', 'Jun': 'none', 'Jul': 'none', 'Aug': 'none',
            'Sep': 'low', 'Oct': 'medium', 'Nov': 'high', 'Dec': 'high'
        }
    },
    {
        id: 'sesame-red',
        name: 'Sesame Seeds (Red)',
        category: 'sesame',
        image: '/images/products/sesame-red.jpg',
        price: '1,380',
        state: 'In Stock',
        trend: 0,
        description: 'High-quality red sesame seeds with distinct flavor profile, perfect for culinary and oil applications.',
        specifications: {
            purity: '99.5%',
            oil_content: 'Min 48%',
            moisture: 'Max 5%',
            admixture: 'Max 1.5%'
        },
        details: [
            'Origin: Gedaref, Sudan',
            'Crop Year: 2024',
            'Packaging: 50kg PP Bags'
        ],
        availability: {
            'Jan': 'high', 'Feb': 'high', 'Mar': 'high', 'Apr': 'medium',
            'May': 'low', 'Jun': 'none', 'Jul': 'none', 'Aug': 'none',
            'Sep': 'low', 'Oct': 'medium', 'Nov': 'high', 'Dec': 'high'
        }
    },
    {
        id: 'peanuts-bold',
        name: 'Peanuts (Bold)',
        category: 'others',
        image: '/images/products/peanuts.jpg',
        price: '1,100',
        state: 'Low Stock',
        trend: 5,
        description: 'Bold variety groundnuts with large kernels, perfect for oil extraction and direct consumption.',
        specifications: {
            type: 'Bold / Java',
            oil_content: '48-50%',
            moisture: 'Max 7%',
            aflatoxin: 'Max 10ppb'
        },
        details: [
            'Origin: Darfur/Kordofan',
            'Size: 40/50, 50/60',
            'Packaging: 50kg Jute Bags'
        ],
        availability: {
            'Jan': 'high', 'Feb': 'medium', 'Mar': 'low', 'Apr': 'none',
            'May': 'none', 'Jun': 'none', 'Jul': 'none', 'Aug': 'none',
            'Sep': 'low', 'Oct': 'medium', 'Nov': 'high', 'Dec': 'high'
        }
    },
    {
        id: 'gum-arabic',
        name: 'Gum Arabic (Hashab)',
        category: 'gum',
        image: '/images/products/gum.jpg',
        price: '2,800',
        state: 'In Stock',
        trend: 2.1,
        description: 'High-grade Acacia Senegal gum, essential for food and pharmaceutical industries.',
        specifications: {
            type: 'Acacia Senegal',
            grade: 'Hand Picked Selected',
            moisture: 'Max 10%',
            ash: 'Max 3%'
        },
        details: [
            'Origin: Kordofan, Sudan',
            'Processing: Cleaned & Sifted',
            'Packaging: 25kg/50kg Bags'
        ],
        availability: {
            'Jan': 'high', 'Feb': 'high', 'Mar': 'high', 'Apr': 'medium',
            'May': 'medium', 'Jun': 'low', 'Jul': 'low', 'Aug': 'low',
            'Sep': 'low', 'Oct': 'medium', 'Nov': 'high', 'Dec': 'high'
        }
    },
    {
        id: 'hibiscus',
        name: 'Hibiscus Flower',
        category: 'others',
        image: '/images/products/hibiscus.jpg',
        price: '1,600',
        state: 'Out of Stock',
        trend: -3,
        description: 'Premium dried hibiscus flowers, widely used for beverages, natural colorings, and herbal remedies.',
        specifications: {
            type: 'Hibiscus Sabdariffa',
            moisture: 'Max 10%',
            purity: '98%',
            color: 'Deep Red'
        },
        details: [
            'Origin: Kordofan, Sudan',
            'Processing: Sun-dried',
            'Packaging: 25kg PP Bags'
        ],
        availability: {
            'Jan': 'medium', 'Feb': 'low', 'Mar': 'none', 'Apr': 'none',
            'May': 'none', 'Jun': 'none', 'Jul': 'none', 'Aug': 'none',
            'Sep': 'low', 'Oct': '  medium', 'Nov': 'high', 'Dec': 'medium'
        }
    }
]

// Simplified product list for dropdowns
export const PRODUCT_LIST = PRODUCTS.map(p => ({
    id: p.id,
    name: p.name
}))

// Helper function to get product by ID
export function getProductById(id: string): Product | undefined {
    return PRODUCTS.find(p => p.id === id)
}

// Helper function to get products by category
export function getProductsByCategory(category: string): Product[] {
    if (category === 'all') return PRODUCTS
    return PRODUCTS.filter(p => p.category === category)
}
