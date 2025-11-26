'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './market-data.module.css'

interface MarketData {
    id: number
    name: string
    value: number
    status: string
    trend: number
    lastUpdate: string
    category: string | null
    currency?: string
}

export default function MarketDataList() {
    const [marketData, setMarketData] = useState<MarketData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchMarketData()
    }, [])

    const fetchMarketData = async () => {
        try {
            const res = await fetch('/api/admin/market-data')
            if (res.ok) {
                const data = await res.json()
                setMarketData(data)
            }
        } catch (error) {
            console.error('Failed to fetch market data', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredData = marketData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                    <h1 className={styles.title}>Market Data</h1>
                    <p className={styles.subtitle}>Manage product prices and market trends</p>
                </div>
                <Link href="/admin/market-data/new" className={styles.addButton}>
                    <i className="fas fa-plus"></i> Add New Product
                </Link>
            </header>

            {/* Search and Filter */}
            <div className={styles.searchFilterContainer}>
                <div className={styles.searchInputWrapper}>
                    <i className={`fas fa-search ${styles.searchIcon}`}></i>
                    <input
                        type="text"
                        placeholder="Search products..."
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className={styles.dataTableContainer}>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Price</th>
                                <th>Trend</th>
                                <th>Status</th>
                                <th className={styles.actionsCell}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((item) => (
                                <tr key={item.id}>
                                    <td className={styles.productCell}>
                                        <div className={styles.productInitial}>
                                            {item.name.charAt(0)}
                                        </div>
                                        <span className={styles.productName}>{item.name}</span>
                                    </td>
                                    <td>
                                        <span className={styles.price}>{Number(item.value).toLocaleString()} SDG</span>
                                    </td>
                                    <td>
                                        <span className={`${styles.trendBadge} ${item.trend > 0 ? styles.trendUp : item.trend < 0 ? styles.trendDown : styles.trendStable}`}>
                                            {item.trend > 0 ? '↑' : item.trend < 0 ? '↓' : '→'} {Math.abs(item.trend)}%
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${item.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <Link href={`/admin/market-data/${item.id}`} className={styles.editLink}>
                                            Edit <i className={`fas fa-chevron-right ${styles.editIcon}`}></i>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={styles.noResults}>
                                        <div className={styles.noResultsContent}>
                                            <i className={`fas fa-search ${styles.noResultsIcon}`}></i>
                                            <p>No products found matching "{searchTerm}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
