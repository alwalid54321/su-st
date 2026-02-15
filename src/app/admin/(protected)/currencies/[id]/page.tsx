'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './currency-form.module.css'

interface CurrencyHistory {
    id: number
    rate: number
    archivedAt: string
}

export default function CurrencyFormPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const isNew = id === 'new'

    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)
    const [history, setHistory] = useState<CurrencyHistory[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        rate: 1.0,
        isBase: false
    })

    useEffect(() => {
        if (!isNew && id) {
            fetchCurrency()
        }
    }, [isNew, id])

    useEffect(() => {
        if (!isNew && activeTab === 'history') {
            fetchHistory()
        }
    }, [activeTab, isNew, id])

    const fetchCurrency = async () => {
        try {
            const res = await fetch(`/api/admin/currencies/${id}`)
            if (res.ok) {
                const data = await res.json()
                // If the fetched data is not the current version, redirect to the current one
                if (!data.isCurrent && data.currentId) {
                    router.replace(`/admin/currencies/${data.currentId}`);
                    return;
                }
                setFormData({
                    code: data.code,
                    name: data.name,
                    rate: parseFloat(data.rate) || 1.0,
                    isBase: data.code === 'USD' // Derive isBase from code
                })
            } else if (res.status === 404) {
                console.warn(`Currency with ID ${id} not found.`);
                router.push('/admin/currencies'); // Redirect to list if not found
            }
        } catch (error) {
            console.error('Failed to fetch currency', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchHistory = async () => {
        setLoadingHistory(true)
        try {
            const res = await fetch(`/api/admin/currencies/${id}/history`)
            if (res.ok) {
                const data = await res.json()
                setHistory(data)
            }
        } catch (error) {
            console.error('Failed to fetch history', error)
        } finally {
            setLoadingHistory(false)
        }
    }

    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const url = isNew ? '/api/admin/currencies' : `/api/admin/currencies/${id}/`
            const method = isNew ? 'POST' : 'PUT'

            const dataToSend = {
                code: formData.code.toUpperCase(),
                name: formData.name,
                rate: formData.rate
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            })

            const responseData = await res.json()

            if (res.ok) {
                setSuccessMessage(responseData.message || 'Currency saved successfully!')
                setTimeout(() => {
                    router.push('/admin/currencies')
                    router.refresh()
                }, 1500)
            } else {
                setErrorMessage(responseData.error || 'Failed to save currency')
            }
        } catch (error) {
            console.error('Error saving currency', error)
            setErrorMessage('An unexpected error occurred while saving.')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
        }))
    }

    if (loading) return (
        <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
        </div>
    )

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        {isNew ? 'Add New Currency' : 'Edit Currency'}
                    </h1>
                    <p className={styles.subtitle}>
                        {isNew ? 'Track a new currency exchange rate' : `Update details for ${formData.code}`}
                    </p>
                </div>
                <Link href="/admin/currencies" className={styles.backButton}>
                    <i className="fas fa-arrow-left"></i> Back to List
                </Link>
            </header>

            {/* Tabs */}
            {!isNew && (
                <div className={styles.tabs}>
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`${styles.tabButton} ${activeTab === 'details' ? styles.tabButtonActive : ''}`}
                    >
                        Currency Details
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`${styles.tabButton} ${activeTab === 'history' ? styles.tabButtonActive : ''}`}
                    >
                        Rate History
                    </button>
                </div>
            )}

            {activeTab === 'details' ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                    {successMessage && (
                        <div className={styles.successAlert}>
                            <i className="fas fa-check-circle"></i> {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className={styles.errorAlert}>
                            <i className="fas fa-exclamation-triangle"></i> {errorMessage}
                        </div>
                    )}
                    <div className={styles.formContent}>
                        <div>
                            <label className={styles.formLabel}>Currency Code</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                maxLength={3}
                                className={`${styles.input} ${styles.inputUppercase}`}
                                placeholder="e.g. USD, EUR, SDG"
                            />
                            <p className={styles.helpText}>3-letter ISO currency code</p>
                        </div>

                        <div>
                            <label className={styles.formLabel}>Currency Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={styles.input}
                                placeholder="e.g. US Dollar"
                            />
                        </div>

                        <div>
                            <label className={styles.formLabel}>Exchange Rate (per USD)</label>
                            <input
                                type="number"
                                name="rate"
                                value={formData.rate}
                                onChange={handleChange}
                                step="0.0001"
                                required
                                className={`${styles.input} ${styles.fontMono}`}
                            />
                            <p className={styles.helpText}>Current market rate against USD</p>
                        </div>

                        <div className={styles.checkboxContainer}>
                            <input
                                type="checkbox"
                                name="isBase"
                                checked={formData.isBase}
                                onChange={handleChange}
                                id="isBase"
                                className={styles.checkbox}
                            />
                            <label htmlFor="isBase" className={styles.checkboxLabel}>
                                Set as Base Currency (USD)
                            </label>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className={styles.saveButton}>
                            {saving ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i>
                                    Save Currency
                                </>
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.historyContainer}>
                    <div className={styles.historyHeader}>
                        <h3 className={styles.historyTitle}>Historical Exchange Rates</h3>
                        <p className={styles.historySubtitle}>Previous rate updates for this currency.</p>
                    </div>

                    {loadingHistory ? (
                        <div className={styles.historyLoaderContainer}>
                            <div className={styles.historyLoader}></div>
                            <p className={styles.historyLoaderText}>Loading history...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className={styles.emptyState}>
                            <i className="fas fa-history"></i>
                            <p>No history found for this currency.</p>
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.historyTable}>
                                <thead>
                                    <tr>
                                        <th>Date Archived</th>
                                        <th>Exchange Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((item) => (
                                        <tr key={item.id}>
                                            <td>{new Date(item.archivedAt).toLocaleString()}</td>
                                            <td className={styles.fontMono}>{Number(item.rate).toFixed(4)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
