'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PriceAlertModal from './PriceAlertModal'

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

                {loading && <div className="text-center py-10 text-gray-500">Loading market data...</div>}

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
                                        <tr key={product.id}>
                                            <td>
                                                <div className="product-name-cell">
                                                    <span className="product-name">{product.name}</span>
                                                    <span className="base-currency">{selectedCurrency}</span>
                                                </div>
                                            </td>
                                            <td className="price-cell">
                                                <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                                <span className="price-value">{convertPrice(product.portSudan)}</span>
                                            </td>
                                            <td className="price-cell">
                                                <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                                <span className="price-value">{convertPrice(product.dmtChina)}</span>
                                            </td>
                                            <td className="price-cell">
                                                <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                                <span className="price-value">{convertPrice(product.dmtUae)}</span>
                                            </td>
                                            <td className="price-cell">
                                                <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                                <span className="price-value">{convertPrice(product.dmtMersing)}</span>
                                            </td>
                                            <td className="price-cell">
                                                <span className="currency-symbol">{getCurrencySymbol(selectedCurrency)}</span>
                                                <span className="price-value">{convertPrice(product.dmtIndia)}</span>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${product.status.toLowerCase()}`}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="forecast-cell">
                                                    <span className={`forecast-trend ${product.trend > 0 ? 'up' : product.trend < 0 ? 'down' : ''}`}>
                                                        {product.trend > 0 ? '↑' : product.trend < 0 ? '↓' : '→'} {Math.abs(product.trend)}%
                                                    </span>
                                                    <span>{product.forecast}</span>
                                                </div>
                                            </td>
                                            <td className="action-column">
                                                <div className="action-row">
                                                    <Link href={`/sample?product=${product.name}`} className="action-btn sample-btn">SAMPLE</Link>
                                                    <Link href={`/quote?product=${product.name}`} className="action-btn quote-btn">QUOTE</Link>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product)
                                                        setAlertModalOpen(true)
                                                    }}
                                                    className="action-btn alert-btn"
                                                    style={{
                                                        marginTop: '8px',
                                                        width: '100%',
                                                        backgroundColor: 'var(--accent)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        padding: '6px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '5px'
                                                    }}
                                                >
                                                    <i className="fas fa-bell"></i> SET ALERT
                                                </button>
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
