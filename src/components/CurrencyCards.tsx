'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './CurrencyCards.module.css'

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
        // Using FlagCDN for highly optimized WebP flags in correct aspect ratio
        return `https://flagcdn.com/w80/${isoCode}.webp`
    }

    const formatDate = (dateString: Date | string | undefined) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const getLastUpdate = (currency: Currency) => {
        return currency.lastUpdate || currency.updatedAt || currency.createdAt
    }

    if (loading) {
        return (
            <section className={styles.sectionContainer}>
                <div className={styles.sectionHeader}>
                    <div className={styles.titleGroup}>
                        <h2 className={styles.title}>Real-Time Exchange Rates</h2>
                    </div>
                </div>
                <div className={styles.grid}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={styles.loadingSkeleton}></div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div className={styles.titleGroup}>
                    <h2 className={styles.title}>Global Exchange Rates</h2>
                    <p style={{ color: '#6b7280', maxWidth: '600px' }}>
                        Live currency rates against the Sudanese Pound (SDG). Updated in real-time.
                    </p>
                </div>
                <div className={styles.lastUpdate}>
                    <div className={styles.liveIndicator}></div>
                    <span>Live Updates</span>
                </div>
            </div>

            <div className={styles.grid}>
                {currencies.map((currency) => {
                    const trend = (Math.random() - 0.5) * 5 // Mock trend
                    const flagSrc = getFlagSrc(currency.code)

                    return (
                        <Link href="/currencies" key={currency.code} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.currencyIdentifier}>
                                    <div className={styles.flagWrapper}>
                                        {flagSrc ? (
                                            <Image
                                                src={flagSrc}
                                                alt={currency.code}
                                                width={36}
                                                height={24}
                                                className={styles.flagImage}
                                            />
                                        ) : (
                                            <span>{currency.code.slice(0, 2)}</span>
                                        )}
                                    </div>
                                    <div className={styles.codeInfo}>
                                        <span className={styles.code}>{currency.code}</span>
                                        <span className={styles.name}>{currency.name || 'Currency'}</span>
                                    </div>
                                </div>
                                {/* Mini SVG Trend Line Placeholder */}
                                <svg viewBox="0 0 100 40" className={styles.miniChart}>
                                    <path
                                        d={`M0 20 Q 25 ${20 - trend * 2} 50 20 T 100 ${20 + trend * 2}`}
                                        fill="none"
                                        stroke={trend > 0 ? '#10b981' : '#ef4444'}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            <div className={styles.rateArea}>
                                <div className={styles.rateRow}>
                                    <span className={styles.conversion}>1 {currency.code} =</span>
                                    <span className={styles.rateValue}>{Number(currency.rate).toFixed(2)} <span style={{ fontSize: '1rem', color: '#9ca3af' }}>SDG</span></span>
                                </div>
                                <div className={styles.trendRow}>
                                    <span
                                        className={trend > 0 ? styles.trendUp : trend < 0 ? styles.trendDown : styles.trendStable}
                                    >
                                        {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend).toFixed(2)}%
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                        Updated: {formatDate(getLastUpdate(currency))}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            <div className={styles.ctaContainer}>
                <Link href="/currencies" className={styles.viewAllBtn}>
                    View All & Converter
                    <i className="fas fa-arrow-right" style={{ fontSize: '0.8rem', opacity: 0.7 }}></i>
                </Link>
            </div>
        </section>
    )
}
