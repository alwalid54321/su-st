'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './market-data.module.css'

export default function DashboardMarketDataPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/admin/market-data')
    }, [router])

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.spinner}></div>
                <p className={styles.message}>Redirecting to Market Data...</p>
            </div>
        </div>
    )
}
