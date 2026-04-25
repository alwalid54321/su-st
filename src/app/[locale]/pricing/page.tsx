'use client'

import styles from './pricing.module.css'
import Link from 'next/link'

const PricingPage = () => {
    return (
        <div className={styles.pageContainer}>
            <div className={styles.header}>
                <h1 className={styles.title}>Simple, Transparent Pricing</h1>
                <p className={styles.subtitle}>Choose the plan that's right for your trading needs.</p>
            </div>

            <div className={styles.pricingGrid}>
                {/* Free Plan */}
                <div className={styles.pricingCard}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.planName}>Free</h2>
                        <div className={styles.price}>
                            <span className={styles.amount}>$0</span>
                            <span className={styles.period}>/month</span>
                        </div>
                        <p className={styles.description}>Essential tools for casual tracking.</p>
                    </div>
                    <ul className={styles.featuresList}>
                        <li><i className="fas fa-check"></i> Basic Market Insights</li>
                        <li><i className="fas fa-check"></i> 14 Days Price History</li>
                        <li><i className="fas fa-check"></i> Ad-supported Dashboard</li>
                        <li className={styles.disabled}><i className="fas fa-times"></i> Live Currency Converter</li>
                        <li className={styles.disabled}><i className="fas fa-times"></i> CSV Data Export</li>
                    </ul>
                    <Link href="/register" className={styles.planBtn}>Current Plan</Link>
                </div>

                {/* Plus Plan - Featured */}
                <div className={`${styles.pricingCard} ${styles.featuredCard}`}>
                    <div className={styles.featuredBadge}>MOST POPULAR</div>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.planName}>Plus</h2>
                        <div className={styles.price}>
                            <span className={styles.amount}>$29</span>
                            <span className={styles.period}>/month</span>
                        </div>
                        <p className={styles.description}>Deep analytics for active traders.</p>
                    </div>
                    <ul className={styles.featuresList}>
                        <li><i className="fas fa-check"></i> Advanced Market Insights</li>
                        <li><i className="fas fa-check"></i> 150 Days Price History</li>
                        <li><i className="fas fa-check"></i> Live Currency Converter</li>
                        <li><i className="fas fa-check"></i> Basic CSV Exports</li>
                        <li><i className="fas fa-check"></i> Priority Notifications</li>
                    </ul>
                    <Link href="/register?plan=plus" className={`${styles.planBtn} ${styles.featuredBtn}`}>Get Plus</Link>
                </div>

                {/* Premium Plan */}
                <div className={styles.pricingCard}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.planName}>Premium</h2>
                        <div className={styles.price}>
                            <span className={styles.amount}>$99</span>
                            <span className={styles.period}>/month</span>
                        </div>
                        <p className={styles.description}>Maximum data for professional insight.</p>
                    </div>
                    <ul className={styles.featuresList}>
                        <li><i className="fas fa-check"></i> Full Market Ecosystem Access</li>
                        <li><i className="fas fa-check"></i> 365 Days (1 Year) History</li>
                        <li><i className="fas fa-check"></i> API Access (Upcoming)</li>
                        <li><i className="fas fa-check"></i> Unlimited CSV Data Exports</li>
                        <li><i className="fas fa-check"></i> 24/7 Dedicated Support</li>
                    </ul>
                    <Link href="/register?plan=premium" className={styles.planBtn}>Get Premium</Link>
                </div>
            </div>

            <div className={styles.comparisonSec}>
                <h3>Frequently Asked Questions</h3>
                <div className={styles.faqGrid}>
                    <div className={styles.faqItem}>
                        <h4>Can I upgrade or downgrade at any time?</h4>
                        <p>Yes, you can change your plan settings in your profile dashboard at any time. Changes take effect on your next billing cycle.</p>
                    </div>
                    <div className={styles.faqItem}>
                        <h4>What data is included in the history?</h4>
                        <p>We track archival data for all major Sudanese commodities (Sesame, Gum, Cotton, etc.) and global currency rates.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PricingPage
