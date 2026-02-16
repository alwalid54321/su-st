'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './PremiumPromoSection.module.css'

export default function PremiumPromoSection() {
    const [isVisible, setIsVisible] = useState(false)
    const [plan, setPlan] = useState('free')

    useEffect(() => {
        // Only show to users who aren't on high-tier plans
        const checkPlan = async () => {
            try {
                const res = await fetch('/api/user/plan')
                if (res.ok) {
                    const data = await res.json()
                    setPlan(data.plan)
                    // If plan is 'premium', definitely don't show the promo
                    if (data.plan !== 'premium' && data.plan !== 'plus') {
                        setIsVisible(true)
                    }
                }
            } catch (err) {
                console.error(err)
                setIsVisible(true)
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
                            Level Up Your Analysis with <span className={styles.highlight}>Plus & Premium</span>
                        </h2>
                        <p className={styles.description}>
                            Don't miss out on deep market trends. Upgrade to extend your data access and unlock professional tools.
                        </p>
                        <div className={styles.featuresWrapper}>
                            <div className={styles.featureGroup}>
                                <h4>Plus Benefits</h4>
                                <ul className={styles.featuresList}>
                                    <li><i className="fas fa-check-circle"></i> 5 Months Market History</li>
                                    <li><i className="fas fa-check-circle"></i> Currency Converter</li>
                                    <li><i className="fas fa-check-circle"></i> CSV Exports</li>
                                </ul>
                            </div>
                            <div className={styles.featureGroup}>
                                <h4>Premium Power</h4>
                                <ul className={styles.featuresList}>
                                    <li><i className="fas fa-check-circle"></i> 1 Full Year History</li>
                                    <li><i className="fas fa-check-circle"></i> Priority Alert Handling</li>
                                    <li><i className="fas fa-check-circle"></i> Unlimited Data Exports</li>
                                </ul>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <Link href="/pricing" className={styles.primaryBtn}>
                                Explore Plans
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
