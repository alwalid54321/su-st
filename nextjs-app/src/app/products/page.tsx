'use client'

import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import './products.css'
import './modal-filter-styles.css'
import VerticalProductCard from '@/components/VerticalProductCard'

interface Product {
    id: number
    name: string
    category: string
    imageUrl: string | null
    value: number
    portSudan: number
    trend: number
    status: string
    description: string | null
    specifications: string | null // JSON string
    details: string | null // JSON string
    availability: string | null // JSON string
}

interface ParsedProduct extends Omit<Product, 'specifications' | 'details' | 'availability'> {
    specifications: Record<string, string>
    details: string[]
    availability: Record<string, string>
}

function ProductsContent() {
    const searchParams = useSearchParams()
    const categoryParam = searchParams.get('category')
    const [filter, setFilter] = useState('all')
    const [products, setProducts] = useState<ParsedProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<ParsedProduct | null>(null)

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch('/api/market-data')
                if (response.ok) {
                    const data: Product[] = await response.json()
                    // Parse JSON fields
                    // Parse JSON fields safely
                    const parsedData = data.map(p => {
                        let specifications = {}
                        let details = []
                        let availability = {}

                        try {
                            specifications = p.specifications ? JSON.parse(p.specifications) : {}
                        } catch (e) {
                            console.warn(`Failed to parse specifications for product ${p.id}`, e)
                        }

                        try {
                            details = p.details ? JSON.parse(p.details) : []
                        } catch (e) {
                            console.warn(`Failed to parse details for product ${p.id}`, e)
                        }

                        try {
                            availability = p.availability ? JSON.parse(p.availability) : {}
                        } catch (e) {
                            console.warn(`Failed to parse availability for product ${p.id}`, e)
                        }

                        return {
                            ...p,
                            specifications,
                            details,
                            availability
                        }
                    })
                    setProducts(parsedData)
                }
            } catch (error) {
                console.error('Failed to fetch products', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    useEffect(() => {
        if (categoryParam) {
            setFilter(categoryParam)
        }
    }, [categoryParam])

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter)

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading products...</div>
    }

    return (
        <div className="products-page">
            {/* Hero Section */}
            <div className="products-hero">
                <div className="hero-content">
                    <h1>Our Premium Products</h1>
                    <p>Discover Sudan's finest agricultural treasures</p>
                </div>
            </div>

            {/* Why Our Products */}
            <div className="why-products-section">
                <h2>WHY OUR PRODUCTS</h2>
                <div className="why-products-content">
                    <div className="why-products-left">
                        <div className="why-product-item">
                            <h3>Direct from Sudan</h3>
                            <p>Our products are meticulously sourced from Sudan, where they are cultivated, harvested, processed, and shipped from their origin.</p>
                        </div>
                        <div className="why-product-item">
                            <h3>Transparent Pricing</h3>
                            <p>We provide prices that reflect the current market rates without any hidden profit margin. Samples can be requested.</p>
                        </div>
                    </div>

                    <div className="why-products-center">
                        <Image
                            src="/images/products-center.jpg"
                            alt="Featured Product"
                            width={400}
                            height={300}
                            className="center-image"
                        />
                    </div>

                    <div className="why-products-right">
                        <div className="why-product-item">
                            <h3>Quality Standards</h3>
                            <p>Our products are sourced from Sudan, known for its exceptional agricultural conditions and high standards.</p>
                        </div>
                        <div className="why-product-item">
                            <h3>Customer Focus</h3>
                            <p>We provide information on seasonal availability and trends in pricing, to ease your plan for purchasing taking advantage of lower prices or higher-quality products.</p>
                        </div>
                    </div>
                </div>

                <div className="products-cta">
                    <div className="cta-box">
                        <h3>Reach Out</h3>
                        <p>Get a personalized quotation on our featured products</p>
                        <Link href="/quote" className="cta-button">Get Quote</Link>
                    </div>
                    <div className="cta-box">
                        <h3>Discover</h3>
                        <p>Request a trial today of any of our products and experience the quality for yourself</p>
                        <Link href="/sample" className="cta-button">Request Sample</Link>
                    </div>
                </div>
            </div>

            {/* Filter Section */}
            <div className="products-filter">
                <button
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All Products
                </button>
                <button
                    className={`filter-btn ${filter === 'sesame' ? 'active' : ''}`}
                    onClick={() => setFilter('sesame')}
                >
                    Sesame Seeds
                </button>
                <button
                    className={`filter-btn ${filter === 'gum' ? 'active' : ''}`}
                    onClick={() => setFilter('gum')}
                >
                    Gum Arabic
                </button>
                <button
                    className={`filter-btn ${filter === 'cotton' ? 'active' : ''}`}
                    onClick={() => setFilter('cotton')}
                >
                    Cotton
                </button>
                <button
                    className={`filter-btn ${filter === 'others' ? 'active' : ''}`}
                    onClick={() => setFilter('others')}
                >
                    Others
                </button>
            </div>

            {/* Products Grid using VerticalProductCard */}
            <div className="products-grid" id="products-grid">
                {filteredProducts.map(product => (
                    <VerticalProductCard
                        key={product.id}
                        id={product.id}
                        name={product.name}
                        category={product.category}
                        imageUrl={product.imageUrl}
                        price={product.portSudan || product.value}
                        status={product.status}
                        description={product.description}
                        trend={product.trend}
                        onViewDetails={() => setSelectedProduct(product)}
                    />
                ))}
            </div>

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedProduct(null)}>
                            <i className="fas fa-times"></i>
                        </button>

                        <div className="modal-content-grid">
                            <div className="modal-image-section">
                                <Image
                                    src={selectedProduct.imageUrl || '/images/placeholder.jpg'}
                                    alt={selectedProduct.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>

                            <div className="modal-details-section">
                                <div className="modal-header">
                                    <h2>{selectedProduct.name}</h2>
                                    <div className={`modal-category-badge ${selectedProduct.category}`}>
                                        {selectedProduct.category}
                                    </div>
                                </div>

                                <div className="modal-price-status">
                                    <div className="modal-price">
                                        <span className="price-amount">${(selectedProduct.portSudan || selectedProduct.value).toLocaleString()}</span>
                                        <span className="price-unit">/ MT</span>
                                    </div>
                                    <div className={`modal-status ${selectedProduct.status === 'In Stock' || selectedProduct.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                        <i className="fas fa-circle"></i>
                                        {selectedProduct.status}
                                    </div>
                                </div>

                                {selectedProduct.description && (
                                    <div className="modal-description">
                                        <h3>Description</h3>
                                        <p>{selectedProduct.description}</p>
                                    </div>
                                )}

                                {Object.keys(selectedProduct.specifications).length > 0 && (
                                    <div className="modal-specifications">
                                        <h3>Specifications</h3>
                                        <div className="specs-grid">
                                            {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                                                <div key={key} className="spec-item">
                                                    <span className="spec-label">{key.replace(/_/g, ' ')}</span>
                                                    <span className="spec-value">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {Object.keys(selectedProduct.availability).length > 0 && (
                                    <div className="modal-availability">
                                        <h3>Seasonal Availability</h3>
                                        <div className="availability-grid">
                                            {Object.entries(selectedProduct.availability).map(([month, level]) => (
                                                <div key={month} className={`availability-month ${level}`}>
                                                    <span className="month-name">{month}</span>
                                                    <div className="availability-bar"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="modal-actions">
                                    <Link href={`/quote?product=${selectedProduct.id}`} className="action-btn primary-btn">
                                        <i className="fas fa-file-invoice"></i>
                                        Get Quote
                                    </Link>
                                    <Link href={`/sample?product=${selectedProduct.id}`} className="action-btn secondary-btn">
                                        <i className="fas fa-box-open"></i>
                                        Request Sample
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ProductsContent />
        </Suspense>
    )
}
