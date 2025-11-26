'use client'

import { useState, useEffect } from 'react'
import styles from './currencies.module.css'

// Mock Data
const initialCurrencies = [
    { code: 'USD', name: 'US Dollar', rate: 1, trend: 0, updated_at: '2023-11-24T10:00:00' },
    { code: 'SDG', name: 'Sudanese Pound', rate: 950, trend: -2.5, updated_at: '2023-11-24T10:00:00' },
    { code: 'AED', name: 'UAE Dirham', rate: 3.67, trend: 0.1, updated_at: '2023-11-24T10:00:00' },
    { code: 'CNY', name: 'Chinese Yuan', rate: 7.15, trend: -0.2, updated_at: '2023-11-24T10:00:00' },
    { code: 'INR', name: 'Indian Rupee', rate: 83.3, trend: 0.5, updated_at: '2023-11-24T10:00:00' },
    { code: 'TRY', name: 'Turkish Lira', rate: 28.8, trend: -1.2, updated_at: '2023-11-24T10:00:00' },
    { code: 'EUR', name: 'Euro', rate: 0.92, trend: 0.3, updated_at: '2023-11-24T10:00:00' },
    { code: 'GBP', name: 'British Pound', rate: 0.79, trend: 0.2, updated_at: '2023-11-24T10:00:00' },
]

export default function CurrenciesPage() {
    const [baseCurrency, setBaseCurrency] = useState('USD')
    const [currencies, setCurrencies] = useState(initialCurrencies)

    // Converter State
    const [amount, setAmount] = useState<number>(1)
    const [fromCurrency, setFromCurrency] = useState('USD')
    const [toCurrency, setToCurrency] = useState('SDG')
    const [result, setResult] = useState<number>(0)
    const [conversionRate, setConversionRate] = useState<number>(0)

    const getRate = (code: string) => {
        const currency = currencies.find(c => c.code === code)
        return currency ? currency.rate : 1
    }

    const displayedCurrencies = currencies.map(c => {
        const baseRate = getRate(baseCurrency)
        const rate = baseCurrency === 'USD' ? c.rate : (baseCurrency === c.code ? 1 : c.rate / baseRate)
        return { ...c, displayRate: rate }
    })

    useEffect(() => {
        const fromRate = getRate(fromCurrency)
        const toRate = getRate(toCurrency)
        const amountInUSD = amount / fromRate
        const converted = amountInUSD * toRate
        setResult(converted)
        setConversionRate(toRate / fromRate)
    }, [amount, fromCurrency, toCurrency, currencies])

    const handleSwap = () => {
        setFromCurrency(toCurrency)
        setToCurrency(fromCurrency)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
        })
    }

    const formatRate = (rate: number) => {
        if (rate < 0.01) return rate.toFixed(6)
        if (rate < 1) return rate.toFixed(4)
        return rate.toFixed(2)
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Currency Exchange Rates</h1>
                    <p className={styles.subtitle}>Current exchange rates and trends for major currencies</p>
                </header>

                <div className={`${styles.card} p-8`}>
                    <h2 className={styles.cardHeader}>
                        <i className="fas fa-exchange-alt"></i>
                        Currency Converter
                    </h2>
                    <div className={styles.converterGrid}>
                        <div className={styles.currencyBox}>
                            <label className={styles.label}>From</label>
                            <div className={styles.inputGroup}>
                                <input type="number" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} className={styles.input} placeholder="0.00" />
                                <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className={styles.select}>
                                    {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={styles.swapButtonContainer}>
                            <button onClick={handleSwap} className={styles.swapButton}><i className="fas fa-exchange-alt"></i></button>
                        </div>
                        <div className={`${styles.currencyBox} ${styles.toCurrencyBox}`}>
                            <label className={styles.label}>To</label>
                            <div className={styles.inputGroup}>
                                <input type="text" value={result.toFixed(2)} readOnly className={styles.input} />
                                <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className={styles.select}>
                                    {currencies.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className={styles.rateDisplay}>
                        <p className={styles.rateText}>1 {fromCurrency} = {conversionRate.toFixed(4)} {toCurrency}</p>
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.baseSelectorContainer}>
                        <div>
                            <h3 className={styles.tableTitle}>Exchange Rates Table</h3>
                            <p className={styles.tableSubtitle}>All rates relative to base currency</p>
                        </div>
                        <div className={styles.baseSelector}>
                            <label className={styles.label}>Base Currency:</label>
                            <select value={baseCurrency} onChange={(e) => setBaseCurrency(e.target.value)} className={styles.select}>
                                {currencies.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className={`${styles.card} overflow-hidden`}>
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
                                {displayedCurrencies.map((currency) => (
                                    <tr key={currency.code} className={styles.dataTableRow}>
                                        <td>
                                            <div className={styles.currencyCell}>
                                                <div className={styles.currencyIcon}><span>{currency.code.substring(0, 2)}</span></div>
                                                <span className={styles.currencyName}>{currency.name}</span>
                                            </div>
                                        </td>
                                        <td><span className={styles.codeBadge}>{currency.code}</span></td>
                                        <td className="text-right"><span className={styles.rateValue}>{formatRate(currency.displayRate)}</span></td>
                                        <td className="text-center">
                                            <span className={`${styles.trendBadge} ${currency.trend > 0 ? styles.trendUp : currency.trend < 0 ? styles.trendDown : styles.trendStable}`}>
                                                {currency.trend > 0 ? '↑' : currency.trend < 0 ? '↓' : '→'} {Math.abs(currency.trend)}%
                                            </span>
                                        </td>
                                        <td className={`${styles.dateCell} text-right`}>{formatDate(currency.updated_at)}</td>
                                    </tr>
                                ))}
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
            </div>
        </div>
    )
}
