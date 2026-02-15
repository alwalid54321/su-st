'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import styles from './edit-gallery.module.css'

export default function EditGalleryImage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const isNew = id === 'new'

    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        description: '',
        order: 0,
        isActive: true
    })

    useEffect(() => {
        if (!isNew && id) {
            async function fetchData() {
                try {
                    const res = await fetch(`/api/admin/gallery/${id}`)
                    if (res.ok) {
                        const data = await res.json()
                        // If the fetched data is not the current version, redirect to the current one
                        if (!data.isCurrent && data.currentId) {
                            router.replace(`/admin/gallery/${data.currentId}`);
                            return;
                        }
                        setFormData({
                            title: data.title,
                            imageUrl: data.imageUrl,
                            description: data.description || '',
                            order: data.order,
                            isActive: data.isActive
                        })
                    } else if (res.status === 404) {
                        console.warn(`Gallery image with ID ${id} not found.`);
                        router.push('/admin/gallery'); // Redirect to list if not found
                    }
                } catch (error) {
                    console.error('Failed to fetch data', error)
                } finally {
                    setLoading(false)
                }
            }
            fetchData()
        }
    }, [isNew, id])

    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setSuccessMessage('')
        setErrorMessage('')

        try {
            const url = '/api/admin/gallery'; // Always POST to base URL for new versions
            const method = 'POST'; // Always POST for saving/updating with versioning

            const dataToSend = {
                ...formData,
                ...(isNew ? {} : { previousRecordId: parseInt(id) }) // Pass previous ID if updating an existing item
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend)
            })

            const responseData = await res.json()

            if (res.ok) {
                setSuccessMessage(responseData.message || 'Gallery image saved successfully!')
                setTimeout(() => {
                    router.push('/admin/gallery')
                    router.refresh()
                }, 1500)
            } else {
                setErrorMessage(responseData.error || 'Failed to save image')
            }
        } catch (error) {
            console.error('Error saving data', error)
            setErrorMessage('An unexpected error occurred.')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: name === 'order' ? parseInt(value) || 0 : value
        }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: checked
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
                    <h1 className={styles.title}>
                        {isNew ? 'Add New Image' : 'Edit Image'}
                    </h1>
                    <p className={styles.subtitle}>
                        {isNew ? 'Upload a new image to the gallery' : `Update details for ${formData.title}`}
                    </p>
                </div>
                <button
                    onClick={() => router.back()}
                    className={styles.backButton}
                >
                    <i className="fas fa-arrow-left"></i> Back to Gallery
                </button>
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
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <i className="fas fa-image"></i> Image Details
                    </h3>
                    <div className={styles.grid}>
                        <div>
                            <label className={styles.label}>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className={styles.input}
                                placeholder="e.g., Harvest Season 2024"
                            />
                        </div>

                        <div>
                            <label className={styles.label}>Image URL</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={formData.imageUrl}
                                    onChange={handleChange}
                                    required
                                    className={`${styles.input} ${styles.inputWithIcon}`}
                                    placeholder="/images/gallery/your-image.jpg"
                                />
                                <i className={`fas fa-link ${styles.inputIcon}`}></i>
                            </div>
                            <p className={styles.helpText}>Provide a direct URL or path to an image in the public folder.</p>
                        </div>

                        <div>
                            <label className={styles.label}>Description (Optional)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className={styles.textarea}
                                placeholder="Add a brief description of the image..."
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <i className="fas fa-sliders-h"></i> Display Settings
                    </h3>
                    <div className={`${styles.grid} ${styles.gridMd2}`}>
                        <div>
                            <label className={styles.label}>Display Order</label>
                            <input
                                type="number"
                                name="order"
                                value={formData.order}
                                onChange={handleChange}
                                className={styles.input}
                            />
                            <p className={styles.helpText}>Lower numbers appear first in the gallery.</p>
                        </div>
                        <div className={styles.toggleContainer}>
                            <label className={styles.toggleLabel}>
                                <div className={styles.toggleSwitch}>
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleCheckboxChange}
                                        className={styles.toggleInput}
                                    />
                                    <span className={styles.toggleSlider}></span>
                                </div>
                                <span className={styles.toggleText}>
                                    {formData.isActive ? 'Visible in Gallery' : 'Hidden from Gallery'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className={styles.saveButton}
                    >
                        {saving ? (
                            <>
                                <span className={styles.spinner}></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-save"></i>
                                Save Image
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
