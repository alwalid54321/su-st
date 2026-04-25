'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import './products.css'
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

const CATEGORIES = [
    { id: 'all', label: 'All Products' },
    { id: 'sesame', label: 'Sesame Seeds' },
    { id: 'gum', label: 'Gum Arabic' },
    { id: 'cotton', label: 'Cotton' },
    { id: 'others', label: 'Others' }
]

function ProductsContent() {
    const searchParams = useSearchParams()
    const categoryParam = searchParams.get('category')
    const [filter, setFilter] = useState('all')
    const [products, setProducts] = useState<ParsedProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<ParsedProduct | null>(null)
    const [isMenuSticky, setIsMenuSticky] = useState(false)
    const filterRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function fetchProducts() {
            try {
                const response = await fetch('/api/market-data')
                if (response.ok) {
                    const data: Product[] = await response.json()
                    const parsedData = data.map(p => {
                        let specifications = {}
                        let details = []
                        let availability = {}
                        try { specifications = p.specifications ? JSON.parse(p.specifications) : {} } catch (e) { }
                        try { details = p.details ? JSON.parse(p.details) : [] } catch (e) { }
                        try { availability = p.availability ? JSON.parse(p.availability) : {} } catch (e) { }

                        // Sanitize Image URL
                        let imageUrl = p.imageUrl || '/images/placeholder.jpg'
                        imageUrl = imageUrl.replace(/\\/g, '/')
                        if (imageUrl && !imageUrl.startsWith('http')) {
                            imageUrl = '/' + imageUrl.replace(/^\/+/, '')
                        }

                        return { ...p, imageUrl, specifications, details, availability }
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

    useEffect(() => {
        const handleScroll = () => {
            if (filterRef.current) {
                setIsMenuSticky(window.scrollY > filterRef.current.offsetTop - 100)
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const filteredProducts = filter === 'all'
        ? products
        : products.filter(p => p.category === filter)

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <div className="w-16 h-16 border-4 border-[#1B1464] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[#1B1464] font-bold animate-pulse">Loading Premium Products...</p>
            </div>
        )
    }

    return (
        <div className="products-page">
            {/* Hero Section */}
            <div className="products-hero">
                <div className="hero-content">
                    <h1>Our Premium Products</h1>
                    <p>Experience the excellence of Sudan's agricultural heritage, sourced with integrity and delivered with quality.</p>
                </div>
            </div>

            {/* Why Our Products */}
            <section className="why-products-section">
                <h2>Why Choose SudaStock?</h2>
                <div className="why-products-content">
                    <div className="why-products-left">
                        <div className="why-product-item">
                            <h3>Direct from Sudan</h3>
                            <p>Our products are meticulously sourced from Sudan, where they are cultivated, harvested, and processed at their origin to ensure peak freshness.</p>
                        </div>
                        <div className="why-product-item">
                            <h3>Transparent Pricing</h3>
                            <p>We provide prices that reflect real-time market rates. No hidden margins—just honest values that help you make better business decisions.</p>
                        </div>
                    </div>

                    <div className="why-products-center">
                        <Image
                            src="/images/products-center.jpg"
                            alt="Featured Product"
                            width={400}
                            height={500}
                            className="center-image"
                        />
                    </div>

                    <div className="why-products-right">
                        <div className="why-product-item">
                            <h3>Quality Standards</h3>
                            <p>Every product undergoes rigorous quality checks. We uphold Sudan's reputation for world-class agricultural commodities.</p>
                        </div>
                        <div className="why-product-item">
                            <h3>Strategic Insights</h3>
                            <p>Beyond trading, we provide seasonal availability and trend analysis to help you optimize your procurement strategy.</p>
                        </div>
                    </div>
                </div>

                <div className="products-cta">
                    <div className="cta-box">
                        <h3>Reach Out</h3>
                        <p>Get a personalized quotation tailored to your specific volume and logistics requirements.</p>
                        <Link href="/quote" className="cta-button">Get Detailed Quote</Link>
                    </div>
                    <div className="cta-box">
                        <h3>Experience Quality</h3>
                        <p>Request a physical sample today to verify the grade and quality of our agricultural treasures.</p>
                        <Link href="/sample" className="cta-button">Request Sample</Link>
                    </div>
                </div>
            </section>

            {/* Filter Section */}
            <div ref={filterRef} className={`products-filter ${isMenuSticky ? 'sticky' : ''}`}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
                        onClick={() => {
                            setFilter(cat.id)
                            window.scrollTo({
                                top: (filterRef.current?.offsetTop || 0) - 100,
                                behavior: 'smooth'
                            })
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <section className="products-grid-section bg-[#f8f9fa]">
                <div className="products-grid">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product, index) => (
                            <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }}>
                                <VerticalProductCard
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
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <i className="fas fa-search fa-3x text-gray-300 mb-4"></i>
                            <h3 className="text-2xl font-bold text-gray-500">No products found for this category</h3>
                            <button onClick={() => setFilter('all')} className="mt-4 text-[#1B1464] font-bold hover:underline">
                                View all products
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="modal-container" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" aria-label="Close modal" onClick={() => setSelectedProduct(null)}>
                            <i className="fas fa-times"></i>
                        </button>

                        <div className="modal-content-grid">
                            <div className="modal-image-section">
                                <Image
                                    src={selectedProduct.imageUrl || '/images/placeholder.jpg'}
                                    alt={selectedProduct.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    priority
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
                                        <span className="price-unit">/ Metric Ton</span>
                                    </div>
                                    <div className={`modal-status ${selectedProduct.status === 'In Stock' || selectedProduct.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                        <i className="fas fa-circle animate-pulse"></i>
                                        {selectedProduct.status}
                                    </div>
                                </div>

                                {selectedProduct.description && (
                                    <div className="modal-description">
                                        <h3>The Commodity</h3>
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
                                        Get Export Quote
                                    </Link>
                                    <Link href={`/sample?product=${selectedProduct.id}`} className="action-btn secondary-btn">
                                        <i className="fas fa-box-open"></i>
                                        Request Quality Sample
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

