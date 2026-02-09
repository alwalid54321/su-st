'use client'

import { useState, useEffect } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './market-data.module.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
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

export default function MarketDataPage() {
    const [products, setProducts] = useState<MarketDataItem[]>([])
    const [selectedProduct, setSelectedProduct] = useState<number | ''>('')
    const [selectedProductData, setSelectedProductData] = useState<MarketDataItem | null>(null)
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // Fetch all products on mount
    useEffect(() => {
        fetchProducts()
        // Set default date range (last 30 days)
        const end = new Date()
        const start = new Date()
        start.setMonth(start.getMonth() - 1)
        setEndDate(end.toISOString().split('T')[0])
        setStartDate(start.toISOString().split('T')[0])
    }, [])

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

    const handleSearch = async () => {
        if (!selectedProduct) {
            setError('Please select a product')
            return
        }

        setLoading(true)
        setError('')
        setSelectedProductData(null)
        setHistory([])

        try {
            // Fetch current product data
            const productRes = await fetch(`/api/market-data/${selectedProduct}`)
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

    const setQuickDateRange = (days: number) => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - days)
        setEndDate(end.toISOString().split('T')[0])
        setStartDate(start.toISOString().split('T')[0])
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
                    color: '#1B1464',
                    font: { size: 12, weight: 'bold' as const }
                }
            },
            title: { display: false },
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(27, 20, 100, 0.1)' },
                ticks: { color: '#1B1464' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#1B1464' }
            }
        }
    }

    const chartData = history.length > 0 ? {
        labels: history.map(h => new Date(h.archivedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Port Sudan',
                data: history.map(h => Number(h.portSudan)),
                borderColor: '#D4AF37',
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(212, 175, 55, 0.4)');
                    gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
                    return gradient;
                },
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#D4AF37',
            },
            {
                label: 'Global Average',
                data: history.map(h => (Number(h.dmtChina) + Number(h.dmtUae) + Number(h.dmtIndia)) / 3),
                borderColor: '#1B1464',
                backgroundColor: 'transparent',
                tension: 0.4,
                fill: false,
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
            }
        ]
    } : null

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {/* Header Section */}
                <header className={styles.header}>
                    <h1 className={styles.title}>Market Insights</h1>
                    <p className={styles.subtitle}>Track Sudanese commodity prices and global market trends in real-time.</p>
                </header>

                {/* Market Summary Ticker/Cards */}
                {products.length > 0 && (
                    <div className={styles.summaryGrid}>
                        {products.slice(0, 4).map(p => (
                            <div key={p.id} className={styles.summaryCard} onClick={() => {
                                setSelectedProduct(p.id);
                                setTimeout(() => handleSearch(), 100);
                            }}>
                                <div className={styles.summaryInfo}>
                                    <h3>{p.name}</h3>
                                    <p>{formatCurrency(p.portSudan)}</p>
                                </div>
                                <div className={`${styles.miniTrend} ${getTrendClass(p.trend)}`}>
                                    {getTrendIcon(p.trend)} {Math.abs(p.trend)}%
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search Form Card */}
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>View Market Data</h2>

                    {error && (
                        <div className={styles.errorAlert}>
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <div className={styles.formGrid}>
                        <div>
                            <label htmlFor="productSelect" className={styles.label}>
                                Select Product
                            </label>
                            <select
                                id="productSelect"
                                value={selectedProduct}
                                onChange={(e) => setSelectedProduct(e.target.value ? Number(e.target.value) : '')}
                                className={styles.select}
                            >
                                <option value="">-- Select a Product --</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="startDate" className={styles.label}>
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className={styles.label}>
                                End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className={styles.input}
                            />
                        </div>
                    </div>

                    {/* Quick Date Filters */}
                    <div className={styles.quickFilters}>
                        <button onClick={() => setQuickDateRange(7)} className={styles.quickFilterBtn}>
                            Last 7 Days
                        </button>
                        <button onClick={() => setQuickDateRange(30)} className={styles.quickFilterBtn}>
                            Last 30 Days
                        </button>
                        <button onClick={() => setQuickDateRange(90)} className={styles.quickFilterBtn}>
                            Last 3 Months
                        </button>
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className={`${styles.button} ${styles.primaryButton}`}
                        >
                            <i className="fas fa-search"></i>
                            {loading ? 'Searching...' : 'Analyze Market'}
                        </button>
                        <button
                            onClick={fetchProducts}
                            disabled={loading}
                            className={`${styles.button} ${styles.refreshButton}`}
                            title="Refresh product list"
                        >
                            <i className="fas fa-sync-alt"></i>
                        </button>
                        {selectedProductData && (
                            <button
                                onClick={exportToCSV}
                                disabled={history.length === 0}
                                className={`${styles.button} ${styles.secondaryButton}`}
                            >
                                <i className="fas fa-download"></i>
                                Export CSV
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className={styles.loadingState}>
                        <div className={styles.loader}></div>
                        <p className={styles.loaderText}>Loading market data...</p>
                    </div>
                )}

                {/* Results Section */}
                {selectedProductData && !loading && (
                    <div className={styles.resultsSection}>
                        {/* Product Header */}
                        <div className={styles.productHeaderCard}>
                            <div className={styles.productHeaderContent}>
                                <div>
                                    <h2 className={styles.productName}>{selectedProductData.name}</h2>
                                    <div className={styles.productMeta}>
                                        <span className={styles.statusBadge}>
                                            {selectedProductData.status}
                                        </span>
                                        <span className={styles.forecastText}>
                                            Forecast: <strong>{selectedProductData.forecast}</strong>
                                        </span>
                                        {lastUpdated && (
                                            <span className={styles.lastUpdateTag}>
                                                <i className="fas fa-clock"></i> Updated: {lastUpdated.toLocaleTimeString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className={`${styles.trendDisplay} ${getTrendClass(selectedProductData.trend)}`}>
                                    {getTrendIcon(selectedProductData.trend)} {Math.abs(selectedProductData.trend)}%
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        {chartData && (
                            <div className={styles.chartCard}>
                                <div className={styles.chartCardHeader}>
                                    <h3 className={styles.chartCardTitle}>Price Trends</h3>
                                    <i className={`fas fa-chart-line ${styles.chartCardIcon}`}></i>
                                </div>
                                <div className={styles.chartArea}>
                                    <div className={styles.chartAreaDiv}>
                                        <Line data={chartData} options={chartOptions} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* No History Message */}
                        {history.length === 0 && (
                            <div className={styles.emptyState}>
                                <i className="fas fa-chart-line fa-3x"></i>
                                <p>No historical data available for this product yet.</p>
                                <p className={styles.emptyStateSubtext}>Data will appear here once the product is updated over time.</p>
                            </div>
                        )}

                        {/* Price Cards */}
                        <div>
                            <h3 className={styles.cardTitle}>Current Prices by Destination</h3>
                            <div className={styles.priceCardsContainer}>
                                {[
                                    { label: 'Port Sudan', value: selectedProductData.portSudan },
                                    { label: 'China', value: selectedProductData.dmtChina },
                                    { label: 'UAE', value: selectedProductData.dmtUae },
                                    { label: 'Mersing', value: selectedProductData.dmtMersing },
                                    { label: 'India', value: selectedProductData.dmtIndia }
                                ].map((item, idx) => (
                                    <div key={idx} className={styles.priceCard}>
                                        <div className={styles.priceCardLabel}>{item.label}</div>
                                        <div className={styles.priceCardValue}>{formatCurrency(item.value)}</div>
                                        <div className={`${styles.priceCardTrend} ${getTrendClass(selectedProductData.trend)}`}>
                                            {getTrendIcon(selectedProductData.trend)} {Math.abs(selectedProductData.trend)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State - No Product Selected */}
                {!selectedProductData && !loading && (
                    <div className={styles.emptyState}>
                        <i className="fas fa-database fa-3x"></i>
                        <p>Select a product and date range to view market data</p>
                    </div>
                )}
            </div>
        </div>
    )
}
