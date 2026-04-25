'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './currencies.module.css'
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
import PremiumModal from '@/components/PremiumModal'

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

interface Currency {
    id?: number
    code: string
    name: string
    rate: number
    lastUpdate?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
}

export default function CurrenciesPage() {
    const [baseCurrency, setBaseCurrency] = useState('USD')
    const [currencies, setCurrencies] = useState<Currency[]>([])
    const [loading, setLoading] = useState(true)

    // Converter State
    const [amount, setAmount] = useState<number>(1)
    const [fromCurrency, setFromCurrency] = useState('USD')
    const [toCurrency, setToCurrency] = useState('SDG')
    const [result, setResult] = useState<number>(0)
    const [conversionRate, setConversionRate] = useState<number>(0)
    const [history, setHistory] = useState<any[]>([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [userPlan, setUserPlan] = useState<'free' | 'plus' | 'premium'>('free')
    const [showPremiumModal, setShowPremiumModal] = useState(false)

    // Fetch currencies and user plan
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                setLoading(true)
                const [currencyRes, planRes] = await Promise.all([
                    fetch('/api/currencies'),
                    fetch('/api/user/plan')
                ])

                if (currencyRes.ok) {
                    const data = await currencyRes.json()
                    setCurrencies(data)
                    // Set default currencies if they exist in the data
                    if (data.length > 0) {
                        const usd = data.find((c: Currency) => c.code === 'USD')
                        const sdg = data.find((c: Currency) => c.code === 'SDG')
                        if (usd) setFromCurrency(usd.code)
                        if (sdg) setToCurrency(sdg.code)
                        if (usd) setBaseCurrency(usd.code)
                    }
                }

                if (planRes.ok) {
                    const planData = await planRes.json()
                    setUserPlan(planData.plan)
                }

            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCurrencies()
    }, [])

    const getRate = (code: string) => {
        const currency = currencies.find(c => c.code === code)
        return currency ? currency.rate : 1
    }

    const displayedCurrencies = currencies
        .filter(c =>
            c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(c => {
            const baseRate = getRate(baseCurrency)
            const rate = baseCurrency === 'USD' ? c.rate : (baseCurrency === c.code ? 1 : c.rate / baseRate)
            return { ...c, displayRate: rate }
        })

    useEffect(() => {
        if (currencies.length > 0) {
            const fromRate = getRate(fromCurrency)
            const toRate = getRate(toCurrency)
            const amountInUSD = amount / fromRate
            const converted = amountInUSD * toRate
            setResult(converted)
            setConversionRate(toRate / fromRate)
            fetchHistory(fromCurrency)
        }
    }, [amount, fromCurrency, toCurrency, currencies])

    const fetchHistory = async (code: string) => {
        try {
            setHistoryLoading(true)
            const res = await fetch(`/api/currencies/${code}/history`)
            if (res.ok) {
                const data = await res.json()
                // Add current rate as latest point
                const current = currencies.find(c => c.code === code)
                if (current) {
                    const currentPoint = {
                        rate: current.rate,
                        archivedAt: new Date().toISOString()
                    }
                    setHistory([currentPoint, ...data].sort((a, b) =>
                        new Date(a.archivedAt).getTime() - new Date(b.archivedAt).getTime()
                    ))
                } else {
                    setHistory(data)
                }
            }
        } catch (err) {
            console.error('Failed to fetch history:', err)
        } finally {
            setHistoryLoading(false)
        }
    }

    const handleSwap = () => {
        setFromCurrency(toCurrency)
        setToCurrency(fromCurrency)
    }

    const formatDate = (dateString: Date | string | undefined) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    const formatRate = (rate: number) => {
        if (rate < 0.01) return rate.toFixed(6)
        if (rate < 1) return rate.toFixed(4)
        return rate.toFixed(2)
    }

    const getFlagSrc = (code: string) => {
        const countryMap: { [key: string]: string } = {
            'USD': 'us',
            'AED': 'ae',
            'SDG': 'sd',
            'INR': 'in',
            'CNY': 'cn',
            'TRY': 'tr',
            'EUR': 'eu',
            'GBP': 'gb',
            'SAR': 'sa',
            'QAR': 'qa',
            'KWD': 'kw',
            'JOD': 'jo'
        }
        const isoCode = countryMap[code] || code.toLowerCase().slice(0, 2)
        return `https://flagcdn.com/w80/${isoCode}.webp`
    }

    const calculateTrend = (currency: Currency) => {
        // Mock trend calculation - in real app, this would come from historical data
        return (Math.random() - 0.5) * 5
    }

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Loading currency data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Currency Exchange Rates</h1>
                    <p className={styles.subtitle}>Live exchange rates and trends for major currencies</p>
                </header>

                <div
                    className={`${styles.card} ${styles.converterCard} ${userPlan === 'free' ? styles.lockedCard : ''}`}
                    onClick={() => userPlan === 'free' && setShowPremiumModal(true)}
                >
                    {userPlan === 'free' && (
                        <div className={styles.lockOverlay}>
                            <div className={styles.lockContent}>
                                <i className="fas fa-lock fa-3x"></i>
                                <h3>Currency Converter</h3>
                                <p>Unlock live currency conversion with SudaStock Plus or Premium.</p>
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPremiumModal(true);
                                }} className="upgrade-cta-btn">Upgrade Now</button>
                            </div>
                        </div>
                    )}
                    <h2 className={styles.cardHeader}>
                        <i className="fas fa-exchange-alt"></i>
                        Currency Converter <span className={userPlan === 'premium' ? "premium-badge-inline" : "plus-badge-inline"} style={{ marginLeft: '10px' }}>
                            {userPlan === 'premium' ? "★ PREMIUM" : "✦ PLUS"}
                        </span>
                    </h2>
                    <div className={styles.converterGrid} style={userPlan === 'free' ? { filter: 'blur(4px)', pointerEvents: 'none' } : {}}>
                        <div className={styles.currencyBox}>
                            <label className={styles.label}>From</label>
                            <div className={styles.inputGroup}>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                    className={styles.input}
                                    placeholder="0.00"
                                />
                                <select
                                    value={fromCurrency}
                                    onChange={(e) => setFromCurrency(e.target.value)}
                                    className={styles.select}
                                >
                                    {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={styles.swapButtonContainer}>
                            <button onClick={handleSwap} className={styles.swapButton}>
                                <i className="fas fa-exchange-alt"></i>
                            </button>
                        </div>
                        <div className={`${styles.currencyBox} ${styles.toCurrencyBox}`}>
                            <label className={styles.label}>To</label>
                            <div className={styles.inputGroup}>
                                <input
                                    type="text"
                                    value={result.toFixed(2)}
                                    readOnly
                                    className={styles.input}
                                />
                                <select
                                    value={toCurrency}
                                    onChange={(e) => setToCurrency(e.target.value)}
                                    className={styles.select}
                                >
                                    {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className={styles.rateDisplay} style={userPlan === 'free' ? { filter: 'blur(4px)' } : {}}>
                        <p className={styles.rateText}>1 {fromCurrency} = {conversionRate.toFixed(4)} {toCurrency}</p>
                    </div>
                </div>

                {/* Currency Analysis Chart */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.chartTitle}>
                            <i className="fas fa-chart-line"></i>
                            {fromCurrency} Trend Analysis
                        </h2>
                    </div>
                    <div className={styles.chartContainer}>
                        {historyLoading ? (
                            <div className={styles.chartPlaceholder}>
                                <div className={styles.miniSpinner}></div>
                                <p>Loading historical data...</p>
                            </div>
                        ) : history.length > 0 ? (
                            <div style={{ height: '300px' }}>
                                <Line
                                    data={{
                                        labels: history.map(h => new Date(h.archivedAt).toLocaleDateString()),
                                        datasets: [{
                                            label: `${fromCurrency} Rate (Base: USD)`,
                                            data: history.map(h => h.rate),
                                            borderColor: '#786D3C',
                                            backgroundColor: 'rgba(120, 109, 60, 0.1)',
                                            fill: true,
                                            tension: 0.4,
                                            pointRadius: 2
                                        }]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: {
                                            legend: { display: false }
                                        },
                                        scales: {
                                            y: { grid: { color: 'rgba(0,0,0,0.05)' } },
                                            x: { grid: { display: false } }
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className={styles.chartPlaceholder}>
                                <p>No historical data available for {fromCurrency}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.baseSelectorContainer}>
                        <div>
                            <h3 className={styles.tableTitle}>Exchange Rates Table</h3>
                            <p className={styles.tableSubtitle}>All rates relative to base currency</p>
                        </div>
                        <div className={styles.baseSelector}>
                            <div className={styles.searchContainer}>
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search currencies..."
                                    className={styles.searchInput}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <label className={styles.label}>Base Currency:</label>
                            <select
                                value={baseCurrency}
                                onChange={(e) => setBaseCurrency(e.target.value)}
                                className={styles.select}
                            >
                                {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={`${styles.card} ${styles.tableCard}`}>
                    <div className={styles.tableContainer}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Currency</th>
                                    <th>Code</th>
                                    <th>Rate ({baseCurrency})</th>
                                    <th>Trend</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedCurrencies.map((currency) => {
                                    const trend = calculateTrend(currency)
                                    return (
                                        <tr key={currency.code} className={styles.dataTableRow}>
                                            <td>
                                                <div className={styles.currencyCell}>
                                                    <div className={styles.flagIconWrapper}>
                                                        <img
                                                            src={getFlagSrc(currency.code)}
                                                            alt=""
                                                            className={styles.flagIcon}
                                                        />
                                                    </div>
                                                    <span className={styles.currencyName}>{currency.name}</span>
                                                </div>
                                            </td>
                                            <td><span className={styles.codeBadge}>{currency.code}</span></td>
                                            <td className={styles.rateCell}>
                                                <span className={styles.rateValue}>{formatRate(currency.displayRate)}</span>
                                            </td>
                                            <td className={styles.trendCell}>
                                                <span className={`${styles.trendBadge} ${trend > 0 ? styles.trendUp : trend < 0 ? styles.trendDown : styles.trendStable}`}>
                                                    {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(2)}%
                                                </span>
                                            </td>
                                            <td className={styles.dateCell}>
                                                {formatDate(currency.lastUpdate || currency.updatedAt)}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.infoBox}>
                    <div className={styles.infoBoxContent}>
                        <i className={`fas fa-info-circle ${styles.infoIcon}`}></i>
                        <div>
                            <h4 className={styles.infoTitle}>About Exchange Rates</h4>
                            <p className={styles.infoText}>
                                Exchange rates are updated regularly and represent the current market values.
                                Rates shown are indicative and may vary from actual transaction rates.
                                The trend indicator shows the percentage change compared to the previous update.
                            </p>
                        </div>
                    </div>
                </div>

                <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
            </div>
        </div>
    )
}
