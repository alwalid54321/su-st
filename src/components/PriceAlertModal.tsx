'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import styles from './PriceAlertModal.module.css'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { useLanguage } from '@/contexts/LanguageContext'

interface Props {
    isOpen: boolean
    onClose: () => void
    productName: string
    productId: number
    currentPrice: number
}

export default function PriceAlertModal({ isOpen, onClose, productName, productId, currentPrice }: Props) {
    const { data: session } = useSession()
    const [targetPrice, setTargetPrice] = useState(currentPrice)
    const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const { permission, subscribeToPush } = usePushNotifications()

    const { t, language } = useLanguage()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Ensure push is enabled if possible
        if (permission === 'default') {
            await subscribeToPush()
        }

        try {
            const res = await fetch('/api/user/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    marketDataId: productId,
                    targetPrice: Number(targetPrice),
                    condition
                })
            })

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => {
                    setSuccess(false)
                    onClose()
                }, 1500)
            } else {
                alert('Failed to set alert')
            }
        } catch (error) {
            console.error('Error setting alert:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.overlay} onClick={onClose} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>{t('setPriceAlert')}</h3>
                    <button onClick={onClose} className={styles.closeBtn}>&times;</button>
                </div>

                {!session ? (
                    <div className={styles.authPrompt}>
                        <div className={styles.authIcon}>
                            <i className="fas fa-user-lock"></i>
                        </div>
                        <h4>{t('signInRequired')}</h4>
                        <p>{t('signInAlertMsg')}</p>
                        <div className={styles.authActions}>
                            <Link href="/login" className={styles.loginBtn}>{t('login')}</Link>
                            <Link href="/register" className={styles.registerBtn}>{t('register')}</Link>
                        </div>
                    </div>
                ) : success ? (
                    <div className={styles.successMessage}>
                        <i className="fas fa-check-circle"></i> {t('alertSetSuccess')}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <p className={styles.productInfo}>
                            {t('alertFor')} <strong>{t(productName) || productName}</strong> ({t('avgGlobalPrice')}: {currentPrice} SDG)
                        </p>

                        <div className={styles.formGroup}>
                            <label>{t('notifyWhen')}</label>
                            <div className={styles.toggleGroup}>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${condition === 'ABOVE' ? styles.active : ''}`}
                                    onClick={() => setCondition('ABOVE')}
                                >
                                    {t('above')} 📈
                                </button>
                                <button
                                    type="button"
                                    className={`${styles.toggleBtn} ${condition === 'BELOW' ? styles.active : ''}`}
                                    onClick={() => setCondition('BELOW')}
                                >
                                    {t('below')} 📉
                                </button>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>{t('targetPriceSDG')}</label>
                            <input
                                type="number"
                                value={targetPrice}
                                onChange={(e) => setTargetPrice(Number(e.target.value))}
                                className={styles.input}
                                min="0"
                                step="0.01"
                                required
                            />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? t('saving') : t('createAlert')}
                        </button>

                        {permission === 'default' && (
                            <p className={styles.note}>{t('permNote')}</p>
                        )}
                        {permission === 'denied' && (
                            <p className={styles.errorText}>{t('permBlocked')}</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    )
}
