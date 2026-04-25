'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import PriceAlertModal from './PriceAlertModal'
import Skeleton from './Skeleton'
import { useTranslations, useLocale } from 'next-intl'

interface MarketData {
    id: number
    name: string
    portSudan: number
    dmtChina: number
    dmtUae: number
    dmtMersing: number
    dmtIndia: number
    status: string
    trend: number
    forecast: string
    lastUpdate: string
}

interface Currency {
    code: string
    rate: number
}

export default function MarketDataTable() {
    const router = useRouter()
    const t = useTranslations()
    const locale = useLocale()
    const language = locale
    const [marketData, setMarketData] = useState<MarketData[]>([])
    const [currencies, setCurrencies] = useState<Currency[]>([])
    const [selectedCurrency, setSelectedCurrency] = useState<string>('USD')
    const [exchangeRate, setExchangeRate] = useState<number>(1)
    const [loading, setLoading] = useState(true)
    const [isMounted, setIsMounted] = useState(false)
    const [now, setNow] = useState(new Date())
    const { data: session } = useSession()

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 10000)
        return () => clearInterval(interval)
    }, [])

    // Determine premium status
    const userPlan = (session?.user as any)?.plan || 'free';
    const isPremium = userPlan === 'plus' || userPlan === 'premium' || (session?.user as any)?.isStaff || (session?.user as any)?.isSuperuser;

    // Alert Modal State
    const [alertModalOpen, setAlertModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<MarketData | null>(null)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        async function fetchData() {
            try {
                const [marketRes, currencyRes] = await Promise.all([
                    fetch('/api/market-data'),
                    fetch('/api/currencies')
                ])

                if (marketRes.ok && currencyRes.ok) {
                    const marketData = await marketRes.json()
                    const currencyData = await currencyRes.json()
                    setMarketData(marketData)
                    setCurrencies(currencyData)
                }
            } catch (error) {
                console.error('Failed to fetch data', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()

        const eventSource = new EventSource('/api/market-data/stream')
        eventSource.onmessage = (event) => {
            try {
                setMarketData(JSON.parse(event.data))
            } catch (error) {
                console.error('SSE Error:', error)
            }
        }

        return () => {
            eventSource.close()
        }
    }, [])

    const handleCurrencyChange = (code: string, rate: number) => {
        setSelectedCurrency(code)
        setExchangeRate(rate)
    }

    const exportToCSV = () => {
        if (!marketData || marketData.length === 0) return

        const headers = ['Product', `Port Sudan (${selectedCurrency})`, `CNF China (${selectedCurrency})`, `CNF UAE (${selectedCurrency})`, `CNF Mersing (${selectedCurrency})`, `CNF India (${selectedCurrency})`, 'Status', 'Trend', 'Last Update']

        const csvRows = [headers.join(',')]

        for (const row of marketData) {
            const values = [
                `"${row.name}"`,
                convertPrice(row.portSudan),
                convertPrice(row.dmtChina),
                convertPrice(row.dmtUae),
                convertPrice(row.dmtMersing),
                convertPrice(row.dmtIndia),
                `"${row.status}"`,
                row.trend > 0 ? 'Up' : row.trend < 0 ? 'Down' : 'Stable',
                `"${new Date(row.lastUpdate).toLocaleString()}"`
            ]
            csvRows.push(values.join(','))
        }

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n')
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `market_data_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const convertPrice = (price: number) => {
        if (!price) return 'N/A'
        return (Number(price) * Number(exchangeRate)).toFixed(2)
    }

    const getCurrencySymbol = (code: string) => {
        const symbols: { [key: string]: string } = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'AED': 'AED',
            'SDG': 'SDG',
            'INR': '₹',
            'CNY': '¥',
            'TRY': '₺'
        }
        return symbols[code] || code
    }

    const formatRelativeTime = (dateString: string | undefined) => {
        if (!dateString) return t('N/A')
        const date = new Date(dateString)
        const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000)
        
        try {
            const rtf = new Intl.RelativeTimeFormat(language === 'ar' ? 'ar' : 'en', { numeric: 'auto', style: 'long' })
            if (Math.abs(diffInSeconds) < 60) return rtf.format(diffInSeconds, 'second')
            if (Math.abs(diffInSeconds) < 3600) return rtf.format(Math.floor(diffInSeconds / 60), 'minute')
            if (Math.abs(diffInSeconds) < 86400) return rtf.format(Math.floor(diffInSeconds / 3600), 'hour')
            return rtf.format(Math.floor(diffInSeconds / 86400), 'day')
        } catch (e) {
            return date.toLocaleTimeString()
        }
    }

    return (
        <section className="market-data-section">
            <div className="container">
                <div className="section-header">
                    <h2>{t('Market Data')}</h2>
                    <span className="update-time">
                        {t('Last update')}: {isMounted && marketData[0] ? formatRelativeTime(marketData[0].lastUpdate) : t('N/A')}
                    </span>
                    <div className="action-buttons-container" style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={isPremium ? exportToCSV : () => setShowUpgradeModal(true)} 
                            className="action-btn" 
                            style={{ 
                                backgroundColor: isPremium ? '#786D3C' : '#f8f9fa', 
                                color: isPremium ? '#ffffff' : '#6c757d',
                                border: isPremium ? 'none' : '1px solid #ced4da',
                                fontWeight: 700,
                                opacity: isPremium ? 1 : 0.85
                            }}
                            title={isPremium ? t("Export to CSV") : t("Pro Feature: Upgrade to Export")}
                        >
                            <i className={isPremium ? "fas fa-file-csv" : "fas fa-lock"}></i> 
                            {t('Export CSV')}
                        </button>
                        <button onClick={() => window.location.reload()} className="refresh-btn">
                            <i className="fas fa-sync"></i> {t('Refresh')}
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="market-table-container">
                        <table className="market-table">
                            <thead>
                                <tr>
                                    <th>{t('PRODUCT')}</th>
                                    <th>{t('PORT SUDAN')}</th>
                                    <th>{t('CNF CHINA')}</th>
                                    <th>{t('CNF UAE')}</th>
                                    <th>{t('CNF MERSING')}</th>
                                    <th>{t('CNF INDIA')}</th>
                                    <th>{t('STATUS')}</th>
                                    <th>{t('TREND')}</th>
                                    <th className="action-column">{t('REQUEST')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td><Skeleton className="h-6 w-32" /></td>
                                        <td><Skeleton className="h-6 w-20" /></td>
                                        <td><Skeleton className="h-6 w-20" /></td>
                                        <td><Skeleton className="h-6 w-20" /></td>
                                        <td><Skeleton className="h-6 w-20" /></td>
                                        <td><Skeleton className="h-6 w-20" /></td>
                                        <td><Skeleton className="h-6 w-16" /></td>
                                        <td><Skeleton className="h-6 w-12" /></td>
                                        <td><Skeleton className="h-8 w-24" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && marketData.length === 0 && (
                    <div className="text-center py-10 text-red-500">No market data available. Please check API connection.</div>
                )}

                {!loading && marketData.length > 0 && (
                    <>
                        <div className="currency-toggle-container">
                            <p className="currency-disclaimer">{t('exchangeRatesNote')}</p>
                            <div className="currency-toggle">
                                <span className="currency-label">{t('Currency')}:</span>
                                <div className="currency-options">
                                    {currencies.map((currency) => (
                                        <div
                                            key={currency.code}
                                            className={`currency-option ${selectedCurrency === currency.code ? 'selected' : ''}`}
                                            onClick={() => handleCurrencyChange(currency.code, currency.rate)}
                                        >
                                            {/* Currency flags from Django */}
                                            {currency.code === 'USD' && (
                                                <img src="/images/flags/us.png" alt="USD Flag" className="currency-flag" onError={(e) => (e.currentTarget.src = 'https://flagcdn.com/w40/us.png')} />
                                            )}
                                            {currency.code === 'AED' && (
                                                <img src="/images/flags/ae.png" alt="AED Flag" className="currency-flag" onError={(e) => (e.currentTarget.src = 'https://flagcdn.com/w40/ae.png')} />
                                            )}
                                            {currency.code === 'SDG' && (
                                                <img src="/images/flags/sd.png" alt="SDG Flag" className="currency-flag" onError={(e) => (e.currentTarget.src = 'https://flagcdn.com/w40/sd.png')} />
                                            )}
                                            {currency.code === 'INR' && (
                                                <img src="/images/flags/in.png" alt="INR Flag" className="currency-flag" onError={(e) => (e.currentTarget.src = 'https://flagcdn.com/w40/in.png')} />
                                            )}
                                            {currency.code === 'CNY' && (
                                                <img src="/images/flags/cn.png" alt="CNY Flag" className="currency-flag" onError={(e) => (e.currentTarget.src = 'https://flagcdn.com/w40/cn.png')} />
                                            )}
                                            {currency.code === 'TRY' && (
                                                <img src="/images/flags/tr.png" alt="TRY Flag" className="currency-flag" onError={(e) => (e.currentTarget.src = 'https://flagcdn.com/w40/tr.png')} />
                                            )}
                                            {currency.code === 'EUR' && (
                                                <img src="/images/flags/eu.png" alt="EUR Flag" className="currency-flag" onError={(e) => (e.currentTarget.src = 'https://flagcdn.com/w40/eu.png')} />
                                            )}
                                            {currency.code === 'GBP' && (
                                                <img src="/images/flags/gb.png" alt="GBP Flag" className="currency-flag" onError={(e) => (e.currentTarget.src = 'https://flagcdn.com/w40/gb.png')} />
                                            )}
                                            {!['USD', 'AED', 'SDG', 'INR', 'CNY', 'TRY', 'EUR', 'GBP'].includes(currency.code) && (
                                                <div className="currency-flag-initials">
                                                    {currency.code.slice(0, 2)}
                                                </div>
                                            )}
                                            <span>{currency.code}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="market-table-container">
                            <table className="market-table">
                                <thead>
                                    <tr>
                                        <th>{t('PRODUCT')}</th>
                                        <th>{t('PORT SUDAN')}</th>
                                        <th>{t('CNF CHINA')}</th>
                                        <th>{t('CNF UAE')}</th>
                                        <th>{t('CNF MERSING')}</th>
                                        <th>{t('CNF INDIA')}</th>
                                        <th>{t('STATUS')}</th>
                                        <th>{t('TREND')}</th>
                                        <th className="action-column">{t('REQUEST')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {marketData.map((product) => (
                                        <tr
                                            key={product.id}
                                            onClick={(e) => {
                                                // Prevent navigation if clicking on action buttons
                                                if ((e.target as HTMLElement).closest('.action-btn') || (e.target as HTMLElement).closest('a')) return;
                                                router.push(`/market-data?product=${product.id}`)
                                            }}
                                            style={{ cursor: 'pointer' }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td data-label="PRODUCT">
                                                <div className="product-name-cell">
                                                    <DynamicTranslatedText text={product.name} className="product-name" />
                                                    <span className="base-currency">{selectedCurrency}</span>
                                                </div>
                                            </td>
                                            <td className="price-cell" data-label="PORT SUDAN">
                                                <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                                <span className="price-value">{convertPrice(product.portSudan)}</span>
                                            </td>
                                            <td className="price-cell" data-label="CNF CHINA">
                                                <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                                <span className="price-value">{convertPrice(product.dmtChina)}</span>
                                            </td>
                                            <td className="price-cell" data-label="CNF UAE">
                                                <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                                <span className="price-value">{convertPrice(product.dmtUae)}</span>
                                            </td>
                                            <td className="price-cell" data-label="CNF MERSING">
                                                <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                                <span className="price-value">{convertPrice(product.dmtMersing)}</span>
                                            </td>
                                            <td className="price-cell" data-label="CNF INDIA">
                                                <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                                <span className="price-value">{convertPrice(product.dmtIndia)}</span>
                                            </td>
                                            <td data-label="STATUS">
                                                <span className={`status-badge ${product.status.toLowerCase()}`}>
                                                    <DynamicTranslatedText text={product.status} />
                                                </span>
                                            </td>
                                            <td data-label="TREND">
                                                <div className="forecast-cell">
                                                    <span className={`forecast-trend ${product.trend > 0 ? 'up' : product.trend < 0 ? 'down' : ''}`}>
                                                        {product.trend > 0 ? '↑' : product.trend < 0 ? '↓' : '→'} {Math.abs(product.trend)}%
                                                    </span>
                                                    <DynamicTranslatedText text={product.forecast} />
                                                </div>
                                            </td>
                                            <td className="action-column" data-label="REQUEST">
                                                <div className="action-row">
                                                    <Link href={`/sample?product=${product.name}`} className="action-btn" style={{ backgroundColor: '#1B1464', color: 'white', border: 'none' }} onClick={(e) => e.stopPropagation()}>{t('Request Sample') || 'SAMPLE'}</Link>
                                                    <Link href={`/quote?product=${product.name}`} className="action-btn quote-btn" onClick={(e) => e.stopPropagation()}>QUOTE</Link>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setSelectedProduct(product)
                                                            setAlertModalOpen(true)
                                                        }}
                                                        className="action-btn alert-btn"
                                                    >
                                                        <i className="fas fa-bell"></i> ALERT
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {selectedProduct && (
                <PriceAlertModal
                    isOpen={alertModalOpen}
                    onClose={() => setAlertModalOpen(false)}
                    productName={selectedProduct.name}
                    productId={selectedProduct.id}
                    currentPrice={selectedProduct.portSudan}
                />
            )}

            {showUpgradeModal && (
                <div onClick={() => setShowUpgradeModal(false)} style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        backgroundColor: 'white', padding: '30px', borderRadius: '12px', 
                        maxWidth: '400px', width: '90%', textAlign: 'center',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ fontSize: '48px', color: '#786D3C', margin: '0 0 15px 0' }}>
                            <i className="fas fa-crown"></i>
                        </div>
                        <h3 style={{ color: '#1B1464', margin: '0 0 15px 0', fontSize: '24px' }}>Premium Feature</h3>
                        <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.5' }}>
                            Exporting market data to CSV is a feature reserved for our Plus and Premium members. Upgrade your account today to unlock powerful data analysis tools.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button 
                                onClick={() => setShowUpgradeModal(false)}
                                style={{ padding: '10px 20px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => router.push('/pricing')}
                                style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#786D3C', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                            >
                                View Plans
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

function DynamicTranslatedText({ text, className }: { text: string, className?: string }) {
    return <span className={className}>{text}</span>;
}
