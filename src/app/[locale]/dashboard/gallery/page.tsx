'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './gallery.module.css'

export default function DashboardGalleryPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace('/admin/gallery')
    }, [router])

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.spinner}></div>
                <p className={styles.message}>Redirecting to Gallery...</p>
            </div>
        </div>
    )
}
