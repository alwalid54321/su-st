'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './PremiumPromoSection.module.css'

export default function PremiumPromoSection() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Only show to non-plus users
        const checkPlan = async () => {
            try {
                const res = await fetch('/api/user/plan')
                if (res.ok) {
                    const data = await res.json()
                    if (data.plan !== 'plus') {
                        setIsVisible(true)
                    }
                }
            } catch (err) {
                console.error(err)
                setIsVisible(true) // Show on error (likely unauthenticated)
            }
        }
        checkPlan()
    }, [])

    if (!isVisible) return null

    return (
        <section className={styles.section}>
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    <div className={styles.textContent}>
                        <div className={styles.badge}>
                            <i className="fas fa-gem"></i> Premium Access
                        </div>
                        <h2 className={styles.title}>
                            Unlock Deeper Market Insights with <span className={styles.highlight}>SudaStock Plus</span>
                        </h2>
                        <p className={styles.description}>
                            Upgrade your plan to access 5 months of historical market data, advanced currency conversion tools, and export capabilities.
                        </p>
                        <ul className={styles.featuresList}>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span>Extended History (5 Months)</span>
                            </li>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span>Advanced Currency Converter</span>
                            </li>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span>CSV Data Exports</span>
                            </li>
                            <li>
                                <i className="fas fa-check-circle"></i>
                                <span>Priority Support</span>
                            </li>
                        </ul>
                        <div className={styles.actions}>
                            <Link href="/pricing" className={styles.primaryBtn}>
                                Upgrade Now
                            </Link>
                            <Link href="/contact" className={styles.secondaryBtn}>
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
