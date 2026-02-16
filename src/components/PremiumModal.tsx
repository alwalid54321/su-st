'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import styles from './PremiumModal.module.css'

interface PremiumModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isOpen) {
            setIsVisible(true)
            document.body.style.overflow = 'hidden'
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300)
            document.body.style.overflow = 'unset'
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!mounted) return null
    if (!isVisible && !isOpen) return null

    const modalContent = (
        <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} onClick={onClose}>
            <div className={`${styles.modal} ${isOpen ? styles.modalActive : ''}`} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <i className="fas fa-crown"></i>
                    </div>
                    <h2>Unlock Full Access</h2>
                    <p>Get unlimited access to historical market data and advanced tools</p>
                </div>

                <div className={styles.features}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                            <i className="fas fa-history"></i>
                        </div>
                        <div className={styles.featureText}>
                            <h3>Up to 1 Year History</h3>
                            <p>Deep dive into market trends with Plus (5 months) or Premium (1 year) plans</p>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                            <i className="fas fa-exchange-alt"></i>
                        </div>
                        <div className={styles.featureText}>
                            <h3>Currency Converter</h3>
                            <p>Real-time conversion with historical trend analysis</p>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                            <i className="fas fa-file-csv"></i>
                        </div>
                        <div className={styles.featureText}>
                            <h3>Export Data</h3>
                            <p>Download market data in CSV format for offline analysis</p>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link href="/pricing" className={styles.upgradeBtn}>
                        View Plans & Upgrade
                        <i className="fas fa-arrow-right"></i>
                    </Link>
                    <button className={styles.maybeLaterBtn} onClick={onClose}>
                        Maybe Later
                    </button>
                </div>

                <div className={styles.guarantee}>
                    <i className="fas fa-shield-alt"></i>
                    <span>Secure payments focused on your data privacy</span>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

