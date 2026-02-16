'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './currencies.module.css'

interface Currency {
    id: number
    code: string
    name: string
    rate: number
    symbol: string
    isBase: boolean
    isAutoUpdate: boolean
    updatedAt: string
}

export default function CurrencyList() {
    const [currencies, setCurrencies] = useState<Currency[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)

    useEffect(() => {
        fetchCurrencies()
    }, [])

    const fetchCurrencies = async () => {
        try {
            const res = await fetch('/api/admin/currencies')
            if (res.ok) {
                const data = await res.json()
                setCurrencies(data)
            }
        } catch (error) {
            console.error('Failed to fetch currencies', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async () => {
        setSyncing(true)
        try {
            const res = await fetch('/api/admin/currencies/sync', { method: 'POST' })
            if (res.ok) {
                await fetchCurrencies()
                alert('Currencies synced successfully')
            } else {
                alert('Failed to sync currencies')
            }
        } catch (error) {
            console.error('Sync failed', error)
            alert('Sync failed')
        } finally {
            setSyncing(false)
        }
    }

    const toggleAutoUpdate = async (id: number, currentValue: boolean) => {
        try {
            const res = await fetch(`/api/admin/currencies/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAutoUpdate: !currentValue })
            })
            if (res.ok) {
                fetchCurrencies()
            }
        } catch (error) {
            console.error('Failed to toggle auto-update', error)
        }
    }

    if (loading) {
        return (
            <div className={styles.loaderContainer}>
                <div className={styles.loader}></div>
            </div>
        )
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Currencies</h1>
                    <p className={styles.subtitle}>Manage exchange rates and supported currencies</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        onClick={handleSync}
                        className={styles.syncButton}
                        disabled={syncing}
                    >
                        <i className={`fas fa-sync ${syncing ? 'fa-spin' : ''}`}></i>
                        {syncing ? ' Syncing...' : ' Sync Now'}
                    </button>
                    <Link href="/admin/currencies/new" className={styles.addButton}>
                        <i className="fas fa-plus"></i> Add Currency
                    </Link>
                </div>
            </header>

            {/* Data Table */}
            <div className={styles.dataTableContainer}>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Currency</th>
                                <th>Code</th>
                                <th>Exchange Rate</th>
                                <th>Auto Update</th>
                                <th>Last Updated</th>
                                <th className={styles.actionsCell}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currencies.map((currency) => (
                                <tr key={currency.id}>
                                    <td className={styles.currencyCell}>
                                        <div className={styles.flagContainer}>
                                            <Image
                                                src={`/images/flags/${currency.code.toLowerCase()}.png`}
                                                alt={currency.code}
                                                fill
                                                className={styles.flagImage}
                                                onError={(e) => {
                                                    // Hide the image and display currency code as fallback
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                    const parent = target.closest(`.${styles.flagContainer}`);
                                                    if (parent) {
                                                        const fallback = document.createElement('span');
                                                        fallback.className = styles.flagFallback;
                                                        fallback.textContent = currency.code;
                                                        parent.appendChild(fallback);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <div className={styles.currencyName}>{currency.name}</div>
                                            {currency.isBase && (
                                                <span className={styles.baseCurrencyLabel}>Base Currency</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.codeBadge}>{currency.code}</span>
                                    </td>
                                    <td className={styles.rate}>
                                        <span className={styles.rateValue}>{Number(currency.rate).toFixed(4)}</span>
                                        <span className={styles.rateUnit}>per USD</span>
                                    </td>
                                    <td>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={currency.isAutoUpdate}
                                                onChange={() => toggleAutoUpdate(currency.id, currency.isAutoUpdate)}
                                            />
                                            <span className={styles.slider}></span>
                                        </label>
                                    </td>
                                    <td className={styles.date}>
                                        {new Date(currency.updatedAt).toLocaleDateString()}
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <Link href={`/admin/currencies/${currency.id}`} className={styles.editLink}>
                                            Edit <i className={`fas fa-chevron-right ${styles.editIcon}`}></i>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
