'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import styles from './announcement-form.module.css'

export default function AnnouncementFormPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const isNew = id === 'new'

    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        category: 'news',
        priority: 'medium',
        isActive: true,
        isFeatured: false,
        externalLink: ''
    })

    useEffect(() => {
        if (!isNew && id) {
            fetchAnnouncement()
        }
    }, [isNew, id])

    const fetchAnnouncement = async () => {
        try {
            const res = await fetch(`/api/admin/announcements/${id}`)
            if (res.ok) {
                const data = await res.json()
                setFormData({
                    title: data.title,
                    content: data.content,
                    category: data.category || 'news',
                    priority: data.priority || 'medium',
                    isActive: data.isActive ?? true,
                    isFeatured: data.isFeatured ?? false,
                    externalLink: data.externalLink || ''
                })
            } else if (res.status === 404) {
                router.push('/admin/announcements')
            }
        } catch (error) {
            console.error('Failed to fetch announcement', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const url = isNew ? '/api/admin/announcements' : `/api/admin/announcements/${id}`
            const method = isNew ? 'POST' : 'PUT'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const responseData = await res.json()

            if (res.ok) {
                setSuccessMessage(responseData.message || 'Announcement saved successfully!')
                setTimeout(() => {
                    router.push('/admin/announcements')
                    router.refresh()
                }, 1500)
            } else {
                setErrorMessage(responseData.error || 'Failed to save announcement')
            }
        } catch (error) {
            console.error('Error saving announcement', error)
            setErrorMessage('An unexpected error occurred.')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    if (loading) return <div className={styles.loader}>Loading...</div>

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>{isNew ? 'New Announcement' : 'Edit Announcement'}</h1>
                    <p className={styles.subtitle}>Broadcast important updates to SudaStock users.</p>
                </div>
                <Link href="/admin/announcements" className={styles.backButton}>
                    <i className="fas fa-arrow-left"></i> Back
                </Link>
            </header>

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
                    <div className={styles.field}>
                        <label className={styles.label}>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className={styles.input}
                            placeholder="e.g., Scheduled Maintenance"
                        />
                    </div>

                    <div className={styles.grid2}>
                        <div className={styles.field}>
                            <label className={styles.label}>Category</label>
                            <select name="category" value={formData.category} onChange={handleChange} className={styles.select}>
                                <option value="news">News</option>
                                <option value="alert">Alert</option>
                                <option value="update">Platform Update</option>
                                <option value="promotion">Promotion</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Priority</label>
                            <select name="priority" value={formData.priority} onChange={handleChange} className={styles.select}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows={6}
                            className={styles.textarea}
                            placeholder="Write your announcement message here..."
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>External Link (Optional)</label>
                        <input
                            type="url"
                            name="externalLink"
                            value={formData.externalLink}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="https://..."
                        />
                    </div>

                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                            Published (Visible on site)
                        </label>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleChange}
                            />
                            Featured Announcement
                        </label>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
                        Cancel
                    </button>
                    <button type="submit" disabled={saving} className={styles.saveButton}>
                        {saving ? 'Saving...' : 'Save Announcement'}
                    </button>
                </div>
            </form>
        </div>
    )
}
