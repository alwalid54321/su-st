'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import styles from './PremiumModal.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

interface PremiumModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [mounted, setMounted] = useState(false)
    const { t, language } = useLanguage()

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
        <div className={`${styles.overlay} ${isOpen ? styles.active : ''}`} onClick={onClose} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={`${styles.modal} ${isOpen ? styles.modalActive : ''}`} onClick={e => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <i className="fas fa-crown"></i>
                    </div>
                    <h2>{t('unlockFullAccess')}</h2>
                    <p>{t('getUnlimitedAccess')}</p>
                </div>

                <div className={styles.features}>
                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                            <i className="fas fa-history"></i>
                        </div>
                        <div className={styles.featureText}>
                            <h3>{t('upTo1Year')}</h3>
                            <p>{t('deepDiveTrends')}</p>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                            <i className="fas fa-exchange-alt"></i>
                        </div>
                        <div className={styles.featureText}>
                            <h3>{t('currencyConverter')}</h3>
                            <p>{t('currencyConverterDesc')}</p>
                        </div>
                    </div>

                    <div className={styles.featureItem}>
                        <div className={styles.featureIcon}>
                            <i className="fas fa-file-csv"></i>
                        </div>
                        <div className={styles.featureText}>
                            <h3>{t('exportData')}</h3>
                            <p>{t('downloadCSV')}</p>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link href="/pricing" className={styles.upgradeBtn}>
                        {t('viewPlansUpgrade')}
                        <i className={`fas ${language === 'ar' ? 'fa-arrow-left' : 'fa-arrow-right'}`}></i>
                    </Link>
                    <button className={styles.maybeLaterBtn} onClick={onClose}>
                        {t('maybeLater')}
                    </button>
                </div>

                <div className={styles.guarantee}>
                    <i className="fas fa-shield-alt"></i>
                    <span>{t('securePayments')}</span>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}

