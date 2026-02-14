'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './gallery.module.css'

interface GalleryItem {
    id: number
    title: string
    imageUrl: string
    category: string
    status: 'active' | 'inactive'
}

export default function GalleryList() {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchGalleryItems()
    }, [])

    const fetchGalleryItems = async () => {
        try {
            const res = await fetch('/api/admin/gallery')
            if (res.ok) {
                const data = await res.json()
                // Map the API response to match GalleryItem interface
                const mappedData = data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    imageUrl: item.imageUrl,
                    category: item.description || 'Uncategorized',
                    status: item.isActive ? 'active' : 'inactive'
                }))
                setGalleryItems(mappedData)
            }
        } catch (error) {
            console.error('Failed to fetch gallery items', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className={styles.loaderContainer}>
                <div className={styles.loader}></div>
            </div>
        )
    }

    if (!mounted) return null

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Gallery</h1>
                    <p className={styles.subtitle}>Manage website images and media assets</p>
                </div>
                <Link href="/admin/gallery/new" className={styles.uploadButton}>
                    <i className="fas fa-upload"></i> Upload Image
                </Link>
            </header>

            {/* Gallery Grid */}
            <div className={styles.galleryGrid}>
                {galleryItems.map((item) => (
                    <div key={item.id} className={styles.galleryItem}>
                        <div className={styles.imageContainer}>
                            <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                className={styles.image}
                            />
                            <div className={`${styles.statusBadge} ${item.status === 'active' ? styles.active : styles.inactive}`}>
                                {item.status === 'active' ? 'Active' : 'Inactive'}
                            </div>
                            <div className={styles.overlay}>
                                <Link href={`/admin/gallery/${item.id}`} className={styles.editLink}>
                                    Edit Image
                                </Link>
                            </div>
                        </div>
                        <div className={styles.itemDetails}>
                            <h3 className={styles.itemTitle} title={item.title}>{item.title}</h3>
                            <p className={styles.itemCategory}>{item.category}</p>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {galleryItems.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyStateIconContainer}>
                            <i className={`fas fa-images ${styles.emptyStateIcon}`}></i>
                        </div>
                        <h3 className={styles.emptyStateTitle}>No images found</h3>
                        <p className={styles.emptyStateSubtitle}>Upload your first image to get started</p>
                    </div>
                )}
            </div>
        </div>
    )
}
