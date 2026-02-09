'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Currency {
    id?: number
    code: string
    name?: string
    rate: number
    lastUpdate?: Date | string
    updatedAt?: Date | string
    createdAt?: Date | string
}

export default function CurrencyCards() {
    const [currencies, setCurrencies] = useState<Currency[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCurrencies() {
            try {
                const response = await fetch('/api/currencies')
                if (response.ok) {
                    const data = await response.json()
                    // Limit to top 6 currencies for homepage display
                    setCurrencies(data.slice(0, 6))
                }
            } catch (error) {
                console.error('Failed to fetch currencies', error)
            } finally {
                setLoading(false)
            }
        }
        fetchCurrencies()
    }, [])

    const getFlagSrc = (code: string) => {
        switch (code) {
            case 'USD': return '/images/flags/us.png'
            case 'AED': return '/images/flags/ae.png'
            case 'SDG': return '/images/flags/sd.png'
            case 'INR': return '/images/flags/inr.png'
            case 'CNY': return '/images/flags/cny.png'
            case 'TRY': return '/images/flags/tr.png'
            case 'EUR': return '/images/flags/eu.png'
            case 'GBP': return '/images/flags/gb.png'
            default: return null
        }
    }

    const formatDate = (dateString: Date | string | undefined) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getLastUpdate = (currency: Currency) => {
        return currency.lastUpdate || currency.updatedAt || currency.createdAt
    }

    if (loading) {
        return (
            <section className="currency-data-section">
                <div className="currency-loading">
                    <div className="currency-spinner"></div>
                    <p>Loading currency rates...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="currency-data-section">
            <div className="section-header">
                <h2 className="section-title">Currency Exchange Rates</h2>
                <span className="section-update-time">
                    Last update: {currencies[0] ? formatDate(getLastUpdate(currencies[0])) : 'N/A'}
                </span>
            </div>
            <div className="currency-cards-container">
                {currencies.map((currency, index) => {
                    const trend = (Math.random() - 0.5) * 5 // Mock trend for visual effect
                    return (
                        <div
                            key={currency.code}
                            className="currency-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="currency-content">
                                <div className="currency-header">
                                    {getFlagSrc(currency.code) ? (
                                        <div className="currency-flag-wrapper">
                                            <Image
                                                src={getFlagSrc(currency.code)!}
                                                alt={`${currency.code} Flag`}
                                                width={32}
                                                height={32}
                                                className="currency-flag"
                                            />
                                        </div>
                                    ) : (
                                        <div className="currency-flag-placeholder">
                                            {currency.code.slice(0, 2)}
                                        </div>
                                    )}
                                    <div className="currency-info">
                                        <span className="currency-code">{currency.code}</span>
                                        {currency.name && (
                                            <span className="currency-name">{currency.name}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="currency-rate">
                                    <div className="currency-rate-row">
                                        <span className="rate-label">1.00 {currency.code}</span>
                                        <span className="currency-arrow">→</span>
                                        <div className="rate-result">
                                            <span className="target-code">SDG</span>
                                            <span className="target-value">{Number(currency.rate).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="currency-trend">
                                        <span className={`trend-indicator ${trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'}`}>
                                            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(2)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="currency-footer">
                                    <div className="currency-updated">
                                        <span className="update-label">Updated:</span>
                                        <span className="update-time">
                                            {new Date(getLastUpdate(currency) || Date.now()).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <Link href="/currencies" className="currency-more-btn">
                                        View Details
                                        <i className="fas fa-arrow-right"></i>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            <div className="currency-cta">
                <Link href="/currencies" className="view-all-btn">
                    View All Exchange Rates
                    <i className="fas fa-chevron-right"></i>
                </Link>
            </div>
        </section>
    )
}
