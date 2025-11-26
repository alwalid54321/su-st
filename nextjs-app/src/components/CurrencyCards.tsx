'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Currency {
    code: string
    rate: number
    last_update: string
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
                    setCurrencies(data)
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
            case 'INR': return '/images/flags/in.png'
            case 'CNY': return '/images/flags/cn.png'
            case 'TRY': return '/images/flags/tr.png'
            default: return null
        }
    }

    if (loading) return null

    return (
        <section className="currency-data-section">
            <div className="section-header">
                <h2>Currency Exchange Rates</h2>
                <span className="update-time">
                    Last update: {currencies[0] ? new Date(currencies[0].last_update).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </span>
            </div>
            <div className="currency-cards-container">
                {currencies.map((currency) => {
                    return (
                        <div key={currency.code} className="currency-card">
                            <div className="currency-content">
                                <div className="currency-header">
                                    {getFlagSrc(currency.code) ? (
                                        <Image
                                            src={getFlagSrc(currency.code)!}
                                            alt={`${currency.code} Flag`}
                                            width={24}
                                            height={24}
                                            className="currency-flag"
                                        />
                                    ) : (
                                        <div className="currency-flag" style={{ backgroundColor: 'var(--primary-dark)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px', width: '24px', height: '24px', borderRadius: '50%' }}>
                                            {currency.code.slice(0, 2)}
                                        </div>
                                    )}
                                    <span className="currency-code">{currency.code}</span>
                                </div>
                                <div className="currency-rate">
                                    <div className="currency-rate-row">
                                        <span className="rate-value">1.00</span>
                                        <span className="currency-arrow">→</span>
                                        <span className="target-code">SDG</span>
                                        <span className="target-value">{Number(currency.rate).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="currency-updated">
                                    <span className="update-label">Last updated:</span>
                                    <span className="update-time">{new Date(currency.last_update).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <Link href="/market-data" className="currency-more-btn">More</Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
