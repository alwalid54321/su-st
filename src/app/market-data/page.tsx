'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler // Add Filler for gradients
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './market-data.module.css'
import PremiumModal from '@/components/PremiumModal'
import PriceAlertModal from '@/components/PriceAlertModal'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

interface MarketDataItem {
    id: number
    name: string
    value: number
    portSudan: number
    dmtChina: number
    dmtUae: number
    dmtMersing: number
    dmtIndia: number
    status: string
    forecast: string
    trend: number
    imageUrl?: string
    lastUpdate: string
}

interface HistoryItem {
    id: number
    originalId: number
    name: string
    value: number
    portSudan: number
    dmtChina: number
    dmtUae: number
    dmtMersing: number
    dmtIndia: number
    status: string
    forecast: string
    trend: number
    archivedAt: string
    lastUpdate: string
}

function MarketDataContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const initialProductId = searchParams.get('product')

    const [products, setProducts] = useState<MarketDataItem[]>([])
    const [selectedProduct, setSelectedProduct] = useState<number | ''>(
        initialProductId ? Number(initialProductId) : ''
    )
    const [selectedProductData, setSelectedProductData] = useState<MarketDataItem | null>(null)
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
    const [userPlan, setUserPlan] = useState<'free' | 'plus' | 'premium'>('free')
    const [planLimits, setPlanLimits] = useState<any>(null)
    const [showPremiumModal, setShowPremiumModal] = useState(false)
    const [showAlertModal, setShowAlertModal] = useState(false)

    // Fetch user plan + products on mount
    useEffect(() => {
        const init = async () => {
            await fetchProducts()
            await fetchUserPlan()
        }
        init()
    }, [])

    // Handle initial product selection from URL
    useEffect(() => {
        if (initialProductId && products.length > 0) {
            const id = Number(initialProductId)
            if (!isNaN(id) && products.some(p => p.id === id)) {
                setSelectedProduct(id)
            }
        }
    }, [initialProductId, products])

    // Trigger search when selectedProduct changes (if it was set from URL or user)
    useEffect(() => {
        if (selectedProduct && typeof selectedProduct === 'number') {
            handleSearch(selectedProduct)
        }
    }, [selectedProduct])


    // Set default date range based on plan
    useEffect(() => {
        const end = new Date()
        const start = new Date()
        // Free: 14 days, Plus: 30 days default, Premium: 90 days default
        let days = 14
        if (userPlan === 'premium') days = 90
        else if (userPlan === 'plus') days = 30

        start.setDate(start.getDate() - days)
        setEndDate(end.toISOString().split('T')[0])
        setStartDate(start.toISOString().split('T')[0])
    }, [userPlan])

    const fetchUserPlan = async () => {
        try {
            const res = await fetch('/api/user/plan')
            if (res.ok) {
                const data = await res.json()
                setUserPlan(data.plan)
                setPlanLimits(data.limits)
            }
        } catch (err) {
            console.error('Failed to fetch user plan:', err)
        }
    }

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/market-data')
            if (res.ok) {
                const data = await res.json()
                setProducts(data)
            }
        } catch (err) {
            console.error('Failed to fetch products:', err)
        }
    }

    const handleSearch = async (productId: number | '') => {
        const idToSearch = productId || selectedProduct
        if (!idToSearch) {
            setError('Please select a product')
            return
        }

        setLoading(true)
        setError('')
        setSelectedProductData(null)
        setHistory([])

        try {
            // Fetch current product data
            const productRes = await fetch(`/api/market-data/${idToSearch}`)
            if (!productRes.ok) throw new Error('Failed to fetch product data')
            const productData = await productRes.json()
            setSelectedProductData(productData)

            // Fetch historical data
            const historyRes = await fetch(
                `/api/market-data/${selectedProduct}/history`
            )
            if (historyRes.ok) {
                const historyData = await historyRes.json()
                // Merge current data as the most recent point
                const currentAsHistory: HistoryItem = {
                    id: -1,
                    originalId: productData.id,
                    name: productData.name,
                    value: productData.value,
                    portSudan: productData.portSudan,
                    dmtChina: productData.dmtChina,
                    dmtUae: productData.dmtUae,
                    dmtMersing: productData.dmtMersing,
                    dmtIndia: productData.dmtIndia,
                    status: productData.status,
                    forecast: productData.forecast,
                    trend: productData.trend,
                    archivedAt: new Date().toISOString(),
                    lastUpdate: productData.lastUpdate
                }
                setHistory([currentAsHistory, ...historyData].sort((a, b) =>
                    new Date(a.archivedAt).getTime() - new Date(b.archivedAt).getTime()
                ))
            }

            setLastUpdated(new Date())
        } catch (err: any) {
            setError(err.message || 'Failed to load market data')
        } finally {
            setLoading(false)
        }
    }

    const handleSearchClick = () => {
        if (selectedProduct && typeof selectedProduct === 'number') {
            handleSearch(selectedProduct)
        }
    }

    const setQuickDateRange = (days: number) => {
        // Enforce server limits
        const maxDays = userPlan === 'premium' ? 365 : (userPlan === 'plus' ? 150 : 14)
        const effectiveDays = Math.min(days, maxDays)
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - effectiveDays)
        setEndDate(end.toISOString().split('T')[0])
        setStartDate(start.toISOString().split('T')[0])
    }

    // Check if a quick filter is locked for the current user
    const isFilterLocked = (days: number) => {
        if (userPlan === 'premium') return false
        if (userPlan === 'plus') return days > 150
        return days > 14
    }

    const handleQuickFilterClick = (days: number) => {
        if (isFilterLocked(days)) {
            setShowPremiumModal(true)
        } else {
            setQuickDateRange(days)
        }
    }

    // Get the min date for the date picker based on plan
    const getMinDate = () => {
        const d = new Date()
        const maxDays = userPlan === 'premium' ? 365 : (userPlan === 'plus' ? 150 : 14)
        d.setDate(d.getDate() - maxDays)
        return d.toISOString().split('T')[0]
    }

    const exportToCSV = () => {
        if (!selectedProductData || history.length === 0) return

        const headers = ['Date', 'Value', 'Port Sudan', 'DMT China', 'DMT UAE', 'DMT Mersing', 'DMT India', 'Status', 'Forecast']
        const rows = history.map(h => [
            new Date(h.archivedAt).toLocaleDateString(),
            h.value,
            h.portSudan,
            h.dmtChina,
            h.dmtUae,
            h.dmtMersing,
            h.dmtIndia,
            h.status,
            h.forecast
        ])

        const csv = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${selectedProductData.name}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
    }

    const formatCurrency = (val: number) => Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' SDG'
    const getTrendClass = (val: number) => val > 0 ? styles.trendUp : val < 0 ? styles.trendDown : styles.trendStable
    const getTrendIcon = (val: number) => val > 0 ? '↑' : val < 0 ? '↓' : '→'

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { family: "'Inter', sans-serif", size: 12 }
                }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1f2937',
                bodyColor: '#1f2937',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                displayColors: true,
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: '#f3f4f6' },
                ticks: { color: '#6b7280', font: { size: 11 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#6b7280', font: { size: 11 } }
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    }

    const chartData = history.length > 0 ? {
        labels: history.map(h => new Date(h.archivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Global Average',
                data: history.map(h => (Number(h.dmtChina) + Number(h.dmtUae) + Number(h.dmtIndia)) / 3),
                borderColor: '#1B1464',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(27, 20, 100, 0.2)');
                    gradient.addColorStop(1, 'rgba(27, 20, 100, 0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4
            },
            {
                label: 'Port Sudan',
                data: history.map(h => Number(h.portSudan)),
                borderColor: '#D4AF37',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4
            }
        ]
    } : null

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {/* Header Section */}
                <header className={styles.header}>
                    <h1 className={styles.title}>Market Insights</h1>
                    <p className={styles.subtitle}>Track Sudanese commodity prices and global market trends in real-time. Make data-driven decisions with our advanced analytics.</p>
                </header>



                {/* Search Form Card */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>
                        <i className="fas fa-search-dollar" style={{ color: '#D4AF37' }}></i>
                        Market Analysis
                    </h2>

                    {error && (
                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    <div className={styles.formGrid}>
                        <div>
                            <label htmlFor="productSelect" className={styles.label}>Select Product</label>
                            <select
                                id="productSelect"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value ? Number(e.target.value) : '')}
                                className={styles.select}
                            >
                                <option value="">-- Choose a Commodity --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="startDate" className={styles.label}>Start Date</label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                min={getMinDate()}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className={styles.label}>End Date</label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    <div className={styles.quickFilters}>
                        <button onClick={() => setQuickDateRange(7)} className={styles.quickFilterBtn}>
                            Last 7 Days
                        </button>
                        <button onClick={() => setQuickDateRange(14)} className={styles.quickFilterBtn}>
                            Last 14 Days
                        </button>
                        <button
                            onClick={() => handleQuickFilterClick(30)}
                            className={`${styles.quickFilterBtn} ${isFilterLocked(30) ? styles.lockedFilter : ''}`}
                            title={isFilterLocked(30) ? 'Upgrade to Plus/Premium for extended history' : ''}
                        >
                            Last 30 Days {isFilterLocked(30) && <span className="plus-badge-inline">✦ PLUS</span>}
                        </button>
                        <button
                            onClick={() => handleQuickFilterClick(150)}
                            className={`${styles.quickFilterBtn} ${isFilterLocked(150) ? styles.lockedFilter : ''}`}
                            title={isFilterLocked(150) ? 'Upgrade to Plus/Premium for extended history' : ''}
                        >
                            Last 5 Months {isFilterLocked(150) && <span className="plus-badge-inline">✦ PLUS</span>}
                        </button>
                        <button
                            onClick={() => handleQuickFilterClick(365)}
                            className={`${styles.quickFilterBtn} ${isFilterLocked(365) ? styles.lockedFilter : ''}`}
                            title={isFilterLocked(365) ? 'Upgrade to Premium for 1 year history' : ''}
                        >
                            Last 1 Year {isFilterLocked(365) && <span className="premium-badge-inline">★ PREMIUM</span>}
                        </button>
                    </div>

                    <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />

                    {/* Upgrade Banner for Free Users */}
                    {userPlan === 'free' && (
                        <div className={styles.upgradeBanner}>
                            <div className={styles.upgradeBannerText}>
                                <strong>Unlock 5 months of market history</strong>
                                <p>Upgrade to SudaStock Plus for extended data, CSV exports, and more.</p>
                            </div>
                            <Link href="/pricing" className={styles.upgradeCta}>Upgrade to Plus</Link>
                        </div>
                    )}

                    <div className={styles.buttonGroup}>
                        <button
                            onClick={handleSearchClick}
                            disabled={loading}
                            className={styles.primaryButton}
                        >
                            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chart-line"></i>}
                            {loading ? 'Analyzing...' : 'Generate Report'}
                        </button>

                        {selectedProductData && (
                            <button
                                onClick={exportToCSV}
                                disabled={history.length === 0}
                                className={styles.secondaryButton}
                            >
                                <i className="fas fa-download"></i>
                                Export CSV
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                {selectedProductData && !loading && (
                    <div className={styles.resultsSection}>
                        {/* Product Header */}
                        <div className={styles.productHeader}>
                            <div className={styles.productTitle}>
                                <h2>{selectedProductData.name}</h2>
                                <div className={styles.metaTags}>
                                    <span className={`${styles.tag} ${styles.tagStatus}`}>
                                        <i className="fas fa-check-circle"></i> {selectedProductData.status}
                                    </span>
                                    <span className={`${styles.tag} ${styles.tagForecast}`}>
                                        <i className="fas fa-binoculars"></i> {selectedProductData.forecast}
                                    </span>
                                    {lastUpdated && (
                                        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                            Updated: {lastUpdated.toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={styles.productActions}>
                                <button
                                    onClick={() => setShowAlertModal(true)}
                                    className={`${styles.secondaryButton} ${styles.alertBtn}`}
                                    title="Set Price Alert"
                                >
                                    <i className="fas fa-bell"></i> Set Alert
                                </button>
                                <div className={styles.mainTrend}>
                                    <span className={styles.trendValue}>
                                        {getTrendIcon(selectedProductData.trend)} {Math.abs(selectedProductData.trend)}%
                                    </span>
                                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>24h Trend</span>
                                </div>
                            </div>
                        </div>

                        {selectedProductData && (
                            <PriceAlertModal
                                isOpen={showAlertModal}
                                onClose={() => setShowAlertModal(false)}
                                productName={selectedProductData.name}
                                productId={selectedProductData.id}
                                currentPrice={selectedProductData.value}
                            />
                        )}

                        {/* Data Grid: Chart & Prices */}
                        <div className={styles.dataGrid}>
                            {/* Left: Chart */}
                            <div className={styles.chartContainer}>
                                {chartData ? (
                                    <Line data={chartData} options={chartOptions} />
                                ) : (
                                    <div className={styles.emptyState}>No chart data available</div>
                                )}
                            </div>

                            {/* Right: Prices */}
                            <div className={styles.priceList}>
                                {[
                                    { label: 'Port Sudan (FOB)', value: selectedProductData.portSudan },
                                    { label: 'Avg Global Price', value: selectedProductData.value },
                                    { label: 'China (DMT)', value: selectedProductData.dmtChina },
                                    { label: 'UAE (DMT)', value: selectedProductData.dmtUae },
                                    { label: 'India (DMT)', value: selectedProductData.dmtIndia }
                                ].map((item, idx) => (
                                    <div key={idx} className={styles.priceRow}>
                                        <span className={styles.priceLabel}>{item.label}</span>
                                        <span className={styles.priceValue}>{formatCurrency(item.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State / Loading */}
                {!selectedProductData && !loading && (
                    <div className={styles.emptyState}>
                        <i className="fas fa-search-dollar fa-3x" style={{ marginBottom: '1rem', color: '#d1d5db' }}></i>
                        <p>Select a product above to start analyzing market trends.</p>
                    </div>
                )}
            </div>
        </div >
    )
}

export default function MarketDataPage() {
    return (
        <Suspense fallback={<div>Loading market data...</div>}>
            <MarketDataContent />
        </Suspense>
    )
}
