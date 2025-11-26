'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './edit-market-data.module.css'

interface MarketDataHistory {
    id: number
    value: number
    status: string
    archivedAt: string
    trend: number
}

export default function EditMarketData() {
    const params = useParams()
    const id = params?.id as string
    const router = useRouter()
    const isNew = id === 'new'

    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)
    const [history, setHistory] = useState<MarketDataHistory[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        portSudan: 0,
        dmtChina: 0,
        dmtUae: 0,
        dmtMersing: 0,
        dmtIndia: 0,
        value: 0,
        status: 'Active',
        forecast: 'Stable',
        trend: 0,
        category: 'others',
        description: '',
        imageUrl: '',
        specifications: '',
        details: '',
        availability: ''
    })

    useEffect(() => {
        if (!isNew && id) {
            fetchData()
            fetchHistory() // Always fetch history
        }
    }, [isNew, id])

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/market-data/${id}?isCurrent=true`)
            if (res.ok) {
                const data = await res.json()
                // If the fetched data is not the current version, redirect to the current one
                if (!data.isCurrent && data.currentId) {
                    router.replace(`/admin/market-data/${data.currentId}`);
                    return;
                }

                setFormData({
                    name: data.name || '',
                    category: data.category || 'others',
                    value: parseFloat(data.value) || 0,
                    portSudan: parseFloat(data.portSudan) || 0,
                    dmtChina: parseFloat(data.dmtChina) || 0,
                    dmtUae: parseFloat(data.dmtUae) || 0,
                    dmtMersing: parseFloat(data.dmtMersing) || 0,
                    dmtIndia: parseFloat(data.dmtIndia) || 0,
                    status: data.status || 'Active',
                    forecast: data.forecast || 'Stable',
                    trend: parseInt(data.trend) || 0,
                    imageUrl: data.imageUrl || '',
                    description: data.description || '',
                    specifications: data.specifications || '',
                    details: data.details || '',
                    availability: data.availability || ''
                })
            } else if (res.status === 404) {
                console.warn(`Market data with ID ${id} not found.`);
                router.push('/admin/market-data'); // Redirect to list if not found
            }
        } catch (error) {
            console.error('Failed to fetch market data', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchHistory = async () => {
        setLoadingHistory(true)
        try {
            const res = await fetch(`/api/admin/market-data/${id}/history`)
            if (res.ok) {
                const data = await res.json()
                // Sort history from newest to oldest for easy access to last value
                setHistory(data.sort((a: any, b: any) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()))
            }
        } catch (error) {
            console.error('Failed to fetch history', error)
        } finally {
            setLoadingHistory(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const url = isNew ? '/api/admin/market-data' : `/api/admin/market-data/${id}/`
            const method = isNew ? 'POST' : 'PUT'

            // Send data with Prisma camelCase field names
            const dataToSend = {
                name: formData.name,
                category: formData.category,
                value: formData.value,
                portSudan: formData.portSudan,
                dmtChina: formData.dmtChina,
                dmtUae: formData.dmtUae,
                dmtMersing: formData.dmtMersing,
                dmtIndia: formData.dmtIndia,
                status: formData.status,
                forecast: formData.forecast,
                trend: formData.trend,
                imageUrl: formData.imageUrl,
                description: formData.description,
                specifications: formData.specifications,
                details: formData.details,
                availability: formData.availability
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            })

            if (res.ok) {
                const responseData = await res.json();
                router.push('/admin/market-data') // Redirect to the list view after successful operation
                router.refresh()
            } else {
                const errorData = await res.json();
                alert(`Failed to save data: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving data', error)
            alert('Error saving data')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: e.target.type === 'number' ? parseFloat(value) || 0 : value
        }))
    }

    if (loading) return (
        <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
        </div>
    )

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{isNew ? 'Add New Product' : 'Edit Product'}</h1>
                    <p className={styles.subtitle}>{isNew ? 'Create a new commodity listing' : `Update details for ${formData.name}`}</p>
                </div>
                <Link href="/admin/market-data" className={styles.backButton}>
                    <i className="fas fa-arrow-left"></i> Back to List
                </Link>
            </header>

            {!isNew && (
                <div className={styles.tabs}>
                    <button onClick={() => setActiveTab('details')} className={`${styles.tabButton} ${activeTab === 'details' ? styles.tabButtonActive : ''}`}>
                        Product Details
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`${styles.tabButton} ${activeTab === 'history' ? styles.tabButtonActive : ''}`}>
                        Price History
                    </button>
                </div>
            )}

            {activeTab === 'details' ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formContent}>
                        <section className={styles.section}>
                            <h3><span className={`${styles.sectionIcon} ${styles.iconBlue}`}><i className="fas fa-info"></i></span>Basic Information</h3>
                            <div className={`${styles.grid} ${styles.gridCols2}`}>
                                <div>
                                    <label className={styles.label}>Product Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.input} placeholder="e.g., White Sesame Seeds" />
                                </div>
                                <div>
                                    <label className={styles.label}>Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className={styles.select}>
                                        <option value="sesame">Sesame</option>
                                        <option value="gum">Gum Arabic</option>
                                        <option value="cotton">Cotton</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                                <div className={styles.colSpan2}>
                                    <label className={styles.label}>Image URL</label>
                                    <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={styles.input} placeholder="/images/products/..." />
                                </div>
                                <div className={styles.colSpan2}>
                                    <label className={styles.label}>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={styles.textarea} placeholder="Product description..." />
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h3><span className={`${styles.sectionIcon} ${styles.iconGreen}`}><i className="fas fa-tag"></i></span>Pricing Details (USD)</h3>
                            <div className={`${styles.grid} ${styles.gridCols3}`}>
                                {['portSudan', 'dmtChina', 'dmtUae', 'dmtMersing', 'dmtIndia'].map(field => (
                                    <div key={field}>
                                        <label className={styles.label}>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                                        <div className={styles.inputWrapper}>
                                            <span className={styles.inputIcon}>$</span>
                                            <input type="number" name={field} value={formData[field as keyof typeof formData]} onChange={handleChange} step="0.01" className={`${styles.input} ${styles.inputWithIcon} ${styles.fontMono}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h3><span className={`${styles.sectionIcon} ${styles.iconPurple}`}><i className="fas fa-chart-line"></i></span>Market Status</h3>
                            <div className={`${styles.grid} ${styles.gridCols3}`}>
                                <div>
                                    <label className={styles.label}>Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className={styles.select}>
                                        <option value="Active">Active</option>
                                        <option value="Limited">Limited</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={styles.label}>Forecast</label>
                                    <select name="forecast" value={formData.forecast} onChange={handleChange} className={styles.select}>
                                        <option value="Stable">Stable</option>
                                        <option value="Rising">Rising</option>
                                        <option value="Falling">Falling</option>
                                    </select>
                                </div>
                                {/* The Trend (%) input field is removed as it's now calculated automatically */}
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h3><span className={`${styles.sectionIcon} ${styles.iconOrange}`}><i className="fas fa-cogs"></i></span>Technical Specifications (JSON)</h3>
                            <div className={styles.grid}>
                                <div>
                                    <label className={styles.label}>Specifications <span className={styles.labelHelpText}>e.g. {"{"}"purity": "99% spaz"{"}"}</span></label>
                                    <textarea name="specifications" value={formData.specifications} onChange={handleChange} rows={3} className={`${styles.textarea} ${styles.jsonTextarea}`} />
                                </div>
                                <div>
                                    <label className={styles.label}>Details List <span className={styles.labelHelpText}>e.g. ["Origin: Sudan"]</span></label>
                                    <textarea name="details" value={formData.details} onChange={handleChange} rows={3} className={`${styles.textarea} ${styles.jsonTextarea}`} />
                                </div>
                                <div>
                                    <label className={styles.label}>Availability <span className={styles.labelHelpText}>e.g. {"{"}"Jan": "high"{"}"}</span></label>
                                    <textarea name="availability" value={formData.availability} onChange={handleChange} rows={3} className={`${styles.textarea} ${styles.jsonTextarea}`} />
                                </div>
                            </div>
                        </section>

                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={() => router.back()} className={styles.cancelButton}>Cancel</button>
                        <button type="submit" disabled={saving} className={styles.saveButton}>
                            {saving ? <><span className={styles.spinner}></span>Saving...</> : <><i className="fas fa-save"></i>Save Changes</>}
                        </button>
                    </div>
                </form>
            ) : (
                <div className={styles.historyContainer}>
                    <div className={styles.historyHeader}>
                        <h3 className={styles.historyTitle}>Historical Price Data</h3>
                        <p className={styles.historySubtitle}>Previous price updates for this product.</p>
                    </div>
                    {loadingHistory ? (
                        <div className={styles.historyLoaderContainer}>
                            <div className={styles.historyLoader}></div>
                            <p className={styles.historyLoaderText}>Loading history...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className={styles.emptyState}>
                            <i className="fas fa-history"></i>
                            <p>No history found for this product.</p>
                        </div>
                    ) : (
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Date Archived</th>
                                    <th>Price (USD)</th>
                                    <th>Status</th>
                                    <th>Trend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(item => (
                                    <tr key={item.id}>
                                        <td>{new Date(item.archivedAt).toLocaleString()}</td>
                                        <td className={styles.fontMono}>${Number(item.value).toFixed(2)}</td>
                                        <td><span className={`${styles.statusBadge} ${item.status === 'Active' ? styles.statusActive : styles.statusInactive}`}>{item.status}</span></td>
                                        <td><span className={item.trend > 0 ? styles.trendPositive : item.trend < 0 ? styles.trendNegative : styles.trendNeutral}>{item.trend > 0 ? '+' : ''}{item.trend}%</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    )
}