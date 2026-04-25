'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './announcements.module.css'

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filters, setFilters] = useState({ category: '', isActive: '' })

    const fetchAnnouncements = async () => {
        setIsLoading(true)
        try {
            const queryParams = new URLSearchParams(filters as any).toString()
            const res = await fetch(`/api/admin/announcements?${queryParams}`)
            if (res.ok) {
                const data = await res.json()
                setAnnouncements(data)
            }
        } catch (error) {
            console.error('Failed to fetch announcements', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAnnouncements()
    }, [filters])

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return
        try {
            const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
            if (res.ok) fetchAnnouncements()
        } catch (err) {
            console.error('Delete failed', err)
        }
    }

    const getPriorityClass = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return styles.priorityHigh
            case 'medium': return styles.priorityMedium
            default: return styles.priorityLow
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.mainContentHeader}>
                <div>
                    <h1 className={styles.mainContentTitle}>Announcements</h1>
                    <p className={styles.mainContentSubtitle}>Manage and view all site-wide announcements.</p>
                </div>
                <Link href="/admin/announcements/new" className={styles.addButton}>
                    <i className="fas fa-plus"></i> Create Announcement
                </Link>
            </header>

            <div className={styles.filterBar}>
                <select
                    value={filters.category}
                    onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
                    className={styles.filterSelect}
                >
                    <option value="">All Categories</option>
                    <option value="news">News</option>
                    <option value="alert">Alerts</option>
                    <option value="update">Updates</option>
                </select>
                <select
                    value={filters.isActive}
                    onChange={(e) => setFilters(f => ({ ...f, isActive: e.target.value }))}
                    className={styles.filterSelect}
                >
                    <option value="">All Status</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                </select>
            </div>

            <div className={styles.card}>
                <div className={styles.cardContent}>
                    {isLoading ? (
                        <div className={styles.loader}>
                            <div className={styles.spinner}></div>
                            <p>Loading Announcements...</p>
                        </div>
                    ) : announcements.length > 0 ? (
                        <table className={styles.announcementsTable}>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Category</th>
                                    <th>Date</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.map((item) => (
                                    <tr key={item.id}>
                                        <td className={styles.titleCell}>
                                            <div className={styles.announcementTitle}>{item.title}</div>
                                            {item.isFeatured && <span className={styles.featuredBadge}>FEATURED</span>}
                                        </td>
                                        <td>{item.category}</td>
                                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`${styles.priorityBadge} ${getPriorityClass(item.priority)}`}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={item.isActive ? styles.statusActive : styles.statusInactive}>
                                                {item.isActive ? 'Visible' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className={styles.actionsButtons}>
                                            <Link href={`/admin/announcements/${item.id}`} className={styles.editButton}>Edit</Link>
                                            <button onClick={() => handleDelete(item.id)} className={styles.deleteButton}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyState}>
                            <i className="fas fa-bullhorn"></i>
                            <p>No announcements found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AnnouncementsPage