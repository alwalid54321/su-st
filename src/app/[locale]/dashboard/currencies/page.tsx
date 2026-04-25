'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './currencies.module.css'

export default function DashboardCurrenciesPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/admin/currencies')
    }, [router])

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.spinner}></div>
                <p className={styles.message}>Redirecting to Currencies...</p>
            </div>
        </div>
    )
}
