'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import styles from './DateRangeSelector.module.css'

interface DateRangeSelectorProps {
    startDate: string
    endDate: string
    onRangeChange: (start: string, end: string) => void
    onQuickFilter: (days: number) => void
    isFilterLocked: (days: number) => boolean
    minDate?: string
}

export default function DateRangeSelector({
    startDate,
    endDate,
    onRangeChange,
    onQuickFilter,
    isFilterLocked,
    minDate
}: DateRangeSelectorProps) {
    const { t, language, direction } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '...'
        const date = new Date(dateStr)
        return date.toLocaleDateString(language === 'ar' ? 'ar-SD' : 'en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const quickOptions = [
        { label: t('last7Days'), days: 7 },
        { label: t('last14Days'), days: 14 },
        { label: t('last30Days'), days: 30, type: 'plus' },
        { label: t('last5Months'), days: 150, type: 'plus' },
        { label: t('last1Year'), days: 365, type: 'premium' }
    ]

    return (
        <div className={styles.container} ref={containerRef} dir={direction}>
            <label className={styles.mainLabel}>{t('selectPeriod')}</label>
            <div
                className={`${styles.selectorBox} ${isOpen ? styles.active : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className={`fas fa-calendar-alt ${styles.calendarIcon}`}></i>
                <div className={styles.rangeDisplay}>
                    <span>{formatDate(startDate)}</span>
                    <span className={styles.separator}>—</span>
                    <span>{formatDate(endDate)}</span>
                </div>
                <i className={`fas fa-chevron-down ${styles.chevronIcon} ${isOpen ? styles.rotate : ''}`}></i>
            </div>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.quickSection}>
                        {quickOptions.map((opt) => (
                            <button
                                key={opt.days}
                                className={`${styles.quickBtn} ${isFilterLocked(opt.days) ? styles.locked : ''}`}
                                onClick={() => {
                                    onQuickFilter(opt.days)
                                    if (!isFilterLocked(opt.days)) setIsOpen(false)
                                }}
                            >
                                {opt.label}
                                {opt.type === 'plus' && isFilterLocked(opt.days) && <span className={styles.badge}>✦</span>}
                                {opt.type === 'premium' && isFilterLocked(opt.days) && <span className={styles.premiumBadge}>★</span>}
                            </button>
                        ))}
                    </div>

                    <div className={styles.divider}>
                        <span>{t('customRange')}</span>
                    </div>

                    <div className={styles.customSection}>
                        <div className={styles.inputGroup}>
                            <label>{t('from')}</label>
                            <input
                                type="date"
                                value={startDate}
                                min={minDate}
                                onChange={(e) => onRangeChange(e.target.value, endDate)}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>{t('to')}</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => onRangeChange(startDate, e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
