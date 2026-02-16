'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PriceAlertModal from './PriceAlertModal'
import Skeleton from './Skeleton'

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
    const [marketData, setMarketData] = useState<MarketData[]>([])
    const [currencies, setCurrencies] = useState<Currency[]>([])
    const [selectedCurrency, setSelectedCurrency] = useState<string>('USD')
    const [exchangeRate, setExchangeRate] = useState<number>(1)
    const [loading, setLoading] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    // Alert Modal State
    const [alertModalOpen, setAlertModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<MarketData | null>(null)

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
    }, [])

    const handleCurrencyChange = (code: string, rate: number) => {
        setSelectedCurrency(code)
        setExchangeRate(rate)
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

    return (
        <section className="market-data-section">
            <div className="container">
                <div className="section-header">
                    <h2>Market Data</h2>
                    <span className="update-time">
                        Last update: {isMounted && marketData[0] ? new Date(marketData[0].lastUpdate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                    <div className="refresh-button">
                        <button onClick={() => window.location.reload()} className="refresh-btn">
                            <i className="fas fa-sync"></i> Refresh
                        </button>
                    </div>
                </div>

                {loading && (
                    <div className="market-table-container">
                        <table className="market-table">
                            <thead>
                                <tr>
                                    <th>PRODUCT</th>
                                    <th>PORT SUDAN</th>
                                    <th>CNF CHINA</th>
                                    <th>CNF UAE</th>
                                    <th>CNF MERSING</th>
                                    <th>CNF INDIA</th>
                                    <th>STATUS</th>
                                    <th>TREND</th>
                                    <th className="action-column">REQUEST</th>
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
                            <p className="currency-disclaimer">Exchange rates are approximate and may vary. Prices are shown for reference only.</p>
                            <div className="currency-toggle">
                                <span className="currency-label">Currency:</span>
                                <div className="currency-options">
                                    {currencies.map((currency) => (
                                        <div
                                            key={currency.code}
                                            className={`currency-option ${selectedCurrency === currency.code ? 'selected' : ''}`}
                                            onClick={() => handleCurrencyChange(currency.code, currency.rate)}
                                        >
                                            {/* Currency flags from Django */}
                                            {currency.code === 'USD' && (
                                                <img src="/images/flags/us.png" alt="USD Flag" className="currency-flag" />
                                            )}
                                            {currency.code === 'AED' && (
                                                <img src="/images/flags/ae.png" alt="AED Flag" className="currency-flag" />
                                            )}
                                            {currency.code === 'SDG' && (
                                                <img src="/images/flags/sd.png" alt="SDG Flag" className="currency-flag" />
                                            )}
                                            {currency.code === 'INR' && (
                                                <img src="/images/flags/inr.png" alt="INR Flag" className="currency-flag" />
                                            )}
                                            {currency.code === 'CNY' && (
                                                <img src="/images/flags/cny.png" alt="CNY Flag" className="currency-flag" />
                                            )}
                                            {currency.code === 'TRY' && (
                                                <img src="/images/flags/try.png" alt="TRY Flag" className="currency-flag" />
                                            )}
                                            {!['USD', 'AED', 'SDG', 'INR', 'CNY', 'TRY'].includes(currency.code) && (
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
                                        <th>PRODUCT</th>
                                        <th>PORT SUDAN</th>
                                        <th>CNF CHINA</th>
                                        <th>CNF UAE</th>
                                        <th>CNF MERSING</th>
                                        <th>CNF INDIA</th>
                                        <th>STATUS</th>
                                        <th>TREND</th>
                                        <th className="action-column">REQUEST</th>
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
                                                    <span className="product-name">{product.name}</span>
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
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td data-label="TREND">
                                                <div className="forecast-cell">
                                                    <span className={`forecast-trend ${product.trend > 0 ? 'up' : product.trend < 0 ? 'down' : ''}`}>
                                                        {product.trend > 0 ? '↑' : product.trend < 0 ? '↓' : '→'} {Math.abs(product.trend)}%
                                                    </span>
                                                    <span>{product.forecast}</span>
                                                </div>
                                            </td>
                                            <td className="action-column" data-label="REQUEST">
                                                <div className="action-row">
                                                    <Link href={`/sample?product=${product.name}`} className="action-btn sample-btn" onClick={(e) => e.stopPropagation()}>SAMPLE</Link>
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
        </section>
    )
}
