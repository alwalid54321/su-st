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
    Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './market-data.module.css'
import PremiumModal from '@/components/PremiumModal'
import PriceAlertModal from '@/components/PriceAlertModal'
import DateRangeSelector from '@/components/DateRangeSelector'
import { useLanguage } from '@/contexts/LanguageContext'

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
    const { t, language, direction } = useLanguage()

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
        } else if (products.length > 0 && !selectedProduct) {
            // Default to the first product if none selected
            setSelectedProduct(products[0].id);
        }
    }, [initialProductId, products])

    // Trigger search when selectedProduct changes
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
        if (!idToSearch) return

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
                `/api/market-data/${idToSearch}/history`
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
    const getTrendIcon = (val: number) => val > 0 ? '↑' : val < 0 ? '↓' : '→'

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                rtl: direction === 'rtl',
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
                rtl: direction === 'rtl',
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: '#f3f4f6' },
                ticks: { color: '#6b7280', font: { size: 11 } },
                position: direction === 'rtl' ? 'right' as const : 'left' as const
            },
            x: {
                grid: { display: false },
                ticks: { color: '#6b7280', font: { size: 11 } },
                reverse: false // Time scale is always LTR usually, but can be flipped if needed
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    }

    const filteredHistory = history.filter(h => {
        const date = new Date(h.archivedAt)
        const start = startDate ? new Date(startDate) : null
        const end = endDate ? new Date(endDate) : null

        // Reset hours for clean date comparison
        if (start) start.setHours(0, 0, 0, 0)
        if (end) end.setHours(23, 59, 59, 999)

        if (start && date < start) return false
        if (end && date > end) return false
        return true
    })

    const chartData = filteredHistory.length > 0 ? {
        labels: filteredHistory.map(h => new Date(h.archivedAt).toLocaleDateString(language === 'ar' ? 'ar-SD' : 'en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: t('globalAverage'),
                data: filteredHistory.map(h => (Number(h.dmtChina) + Number(h.dmtUae) + Number(h.dmtIndia)) / 3),
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
                label: t('portSudanFob'),
                data: filteredHistory.map(h => Number(h.portSudan)),
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
        <div className={styles.pageContainer} dir={direction}>
            <div className={styles.contentWrapper}>
                {/* Header Section */}
                <header className={styles.header}>
                    <h1 className={styles.title}>{t('marketInsights')}</h1>
                    <p className={styles.subtitle}>{t('marketSubtitle')}</p>
                </header>

                {/* Hero Section: Chart */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <div className={styles.chartTitle}>
                            {selectedProductData ? (
                                <>
                                    <h2>{t(selectedProductData.name) || selectedProductData.name} {t('Performance')}</h2>
                                    <div className={styles.metaTags}>
                                        <span className={`${styles.tag} ${styles.tagStatus}`}>
                                            <i className="fas fa-check-circle"></i> {t(selectedProductData.status) || selectedProductData.status}
                                        </span>
                                        <span className={`${styles.tag} ${styles.tagForecast}`}>
                                            <i className="fas fa-binoculars"></i> {t(selectedProductData.forecast) || selectedProductData.forecast}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <h2>{t('selectProduct')}</h2>
                            )}
                        </div>
                        {selectedProductData && (
                            <div className={styles.mainTrend}>
                                <span className={styles.trendValue}>
                                    {getTrendIcon(selectedProductData.trend)} {Math.abs(selectedProductData.trend)}%
                                </span>
                                <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{t('trend24h')}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.heroChartContainer} style={{ height: '400px', width: '100%', position: 'relative' }}>
                        {loading ? (
                            <div className={styles.loadingState}>
                                <i className="fas fa-spinner fa-spin fa-2x"></i>
                                <p>{t('analyzing')}</p>
                            </div>
                        ) : chartData ? (
                            <Line data={chartData} options={chartOptions} />
                        ) : (
                            <div className={styles.emptyState}>
                                <i className="fas fa-chart-line fa-3x" style={{ marginBottom: '1rem', color: '#d1d5db' }}></i>
                                <p>{t('selectProduct')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Controls & Configuration Section */}
                <div className={styles.configSection}>
                    {/* Search/Filter Card */}
                    <div className={styles.card}>

                        {error && (
                            <div style={{ padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <div className={styles.formGrid}>
                            <div>
                                <label htmlFor="productSelect" className={styles.label}>{t('selectProduct')}</label>
                                <select
                                    id="productSelect"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value ? Number(e.target.value) : '')}
                                    className={styles.select}
                                >
                                    <option value="">-- {t('selectProduct')} --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{t(p.name) || p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <DateRangeSelector
                                startDate={startDate}
                                endDate={endDate}
                                minDate={getMinDate()}
                                onRangeChange={(start, end) => {
                                    setStartDate(start)
                                    setEndDate(end)
                                }}
                                onQuickFilter={handleQuickFilterClick}
                                isFilterLocked={isFilterLocked}
                            />
                        </div>

                        <div className={styles.buttonGroup}>
                            {selectedProductData && (
                                <button
                                    onClick={exportToCSV}
                                    disabled={history.length === 0}
                                    className={styles.secondaryButton}
                                >
                                    <i className="fas fa-download"></i>
                                    {t('exportCSV')}
                                </button>
                            )}
                            <button
                                onClick={() => setShowAlertModal(true)}
                                className={`${styles.secondaryButton} ${styles.alertBtn}`}
                                title={t('setAlert')}
                                disabled={!selectedProductData}
                            >
                                <i className="fas fa-bell"></i> {t('setAlert')}
                            </button>
                        </div>
                    </div>
                </div>

                <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
                {selectedProductData && (
                    <PriceAlertModal
                        isOpen={showAlertModal}
                        onClose={() => setShowAlertModal(false)}
                        productName={selectedProductData.name}
                        productId={selectedProductData.id}
                        currentPrice={selectedProductData.value}
                    />
                )}

                {/* Result Details (Prices) */}
                {selectedProductData && !loading && (
                    <div className={styles.resultsSection}>
                        <div className={styles.priceList}>
                            {[
                                { label: t('portSudanFob'), value: selectedProductData.portSudan },
                                { label: t('avgGlobalPrice'), value: selectedProductData.value },
                                { label: t('chinaDmt'), value: selectedProductData.dmtChina },
                                { label: t('uaeDmt'), value: selectedProductData.dmtUae },
                                { label: t('indiaDmt'), value: selectedProductData.dmtIndia }
                            ].map((item, idx) => (
                                <div key={idx} className={styles.priceRow}>
                                    <span className={styles.priceLabel}>{item.label}</span>
                                    <span className={styles.priceValue}>{formatCurrency(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div >
    )
}

export default function MarketDataPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MarketDataContent />
        </Suspense>
    )
}
