'use client'

import { useState, useEffect } from 'react'
import styles from './announcements.module.css'

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAnnouncements = async () => {
            setIsLoading(true)
            try {
                // MOCK DATA
                setAnnouncements([
                    { id: 1, title: 'System Upgrade Notice', createdAt: new Date(), priority: 'high' },
                    { id: 2, title: 'New API Version Released', createdAt: new Date(), priority: 'medium' },
                    { id: 3, title: 'Holiday Maintenance Schedule', createdAt: new Date(), priority: 'low' },
                ]);
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchAnnouncements()
    }, [])

    const getPriorityClass = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return styles.priorityHigh
            case 'medium':
                return styles.priorityMedium
            default:
                return styles.priorityLow
        }
    }

    return (
        <div className={styles.container}>
            <header className={styles.mainContentHeader}>
                <h1 className={styles.mainContentTitle}>Announcements</h1>
                <p className={styles.mainContentSubtitle}>Manage and view all site-wide announcements.</p>
            </header>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>All Announcements</h2>
                </div>
                <div className={styles.cardContent}>
                    {isLoading ? (
                        <p className={styles.loadingMessage}>Loading Announcements...</p>
                    ) : announcements.length > 0 ? (
                        <table className={styles.announcementsTable}>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Date</th>
                                    <th>Priority</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.title}</td>
                                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`${styles.priorityBadge} ${getPriorityClass(item.priority)}`}>
                                                {item.priority}
                                            </span>
                                        </td>
                                        <td className={styles.actionsButtons}>
                                            <button className={styles.actionButton}>Edit</button>
                                            <button className={styles.actionButton}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className={styles.noAnnouncements}>No announcements found.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AnnouncementsPage