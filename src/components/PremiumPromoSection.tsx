'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './PremiumPromoSection.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

export default function PremiumPromoSection() {
    const [isVisible, setIsVisible] = useState(false)
    const [plan, setPlan] = useState('free')

    const { t, language } = useLanguage()

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
                            <i className="fas fa-gem"></i> {t('premiumAccess')}
                        </div>
                        <h2 className={styles.title}>
                            {t('levelUp')} <span className={styles.highlight}>{t('plusPremium')}</span>
                        </h2>
                        <p className={styles.description}>
                            {t('dontMissTrends')}
                        </p>
                        <div className={styles.featuresWrapper}>
                            <div className={styles.featureGroup}>
                                <h4>{t('plusBenefits')}</h4>
                                <ul className={styles.featuresList}>
                                    <li><i className="fas fa-check-circle"></i> {t('months5History')}</li>
                                    <li><i className="fas fa-check-circle"></i> {t('currencyConverter')}</li>
                                    <li><i className="fas fa-check-circle"></i> {t('csvExports')}</li>
                                </ul>
                            </div>
                            <div className={styles.featureGroup}>
                                <h4>{t('premiumPower')}</h4>
                                <ul className={styles.featuresList}>
                                    <li><i className="fas fa-check-circle"></i> {t('fullYearHistory')}</li>
                                    <li><i className="fas fa-check-circle"></i> {t('priorityAlerts')}</li>
                                    <li><i className="fas fa-check-circle"></i> {t('unlimitedExports')}</li>
                                </ul>
                            </div>
                        </div>
                        <div className={styles.actions}>
                            <Link href="/pricing" className={styles.primaryBtn}>
                                {t('explorePlans')}
                            </Link>
                            <Link href="/contact" className={styles.secondaryBtn}>
                                {t('contactSales')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
