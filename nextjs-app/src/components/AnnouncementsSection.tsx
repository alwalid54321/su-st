'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Announcement {
    id: number
    title: string
    content: string
    priority: string
    isActive: boolean
    isFeatured: boolean
    imageUrl?: string | null
    externalLink?: string | null
    category: string
    createdAt: Date | string
    updatedAt: Date | string
}

export default function AnnouncementsSection() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchAnnouncements() {
            try {
                const response = await fetch('/api/announcements')
                if (response.ok) {
                    const data = await response.json()
                    // Sanitize image URLs
                    const sanitizedData = data.map((item: Announcement) => {
                        let imageUrl = item.imageUrl || ''
                        imageUrl = imageUrl.replace(/\\/g, '/')
                        if (imageUrl && !imageUrl.startsWith('http')) {
                            imageUrl = '/' + imageUrl.replace(/^\/+/, '')
                        }
                        return { ...item, imageUrl }
                    })
                    setAnnouncements(sanitizedData)
                }
            } catch (error) {
                console.error('Error fetching announcements:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAnnouncements()
    }, [])

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'news': return 'blue'
            case 'alert': return 'red'
            case 'update': return 'green'
            case 'promotion': return 'gold'
            default: return 'gray'
        }
    }

    const formatDate = (dateString: Date | string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const truncateContent = (content: string, maxLength: number = 150) => {
        if (content.length <= maxLength) return content
        return content.slice(0, maxLength) + '...'
    }

    if (loading) {
        return (
            <section className="announcements-section">
                <div className="announcements-loading">
                    <div className="announcements-spinner"></div>
                    <p>Loading announcements...</p>
                </div>
            </section>
        )
    }

    if (announcements.length === 0) return null

    return (
        <section className="announcements-section">
            <div className="announcements-header">
                <h2 className="announcements-title">Latest News & Announcements</h2>
                <p className="announcements-subtitle">Stay updated with our latest news and important updates</p>
            </div>

            <div className="announcements-grid">
                {announcements.map((announcement, index) => (
                    <div
                        key={announcement.id}
                        className={`announcement-card ${announcement.isFeatured ? 'featured' : ''}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {announcement.imageUrl && (
                            <div className="announcement-image">
                                <Image
                                    src={announcement.imageUrl}
                                    alt={announcement.title}
                                    fill
                                    className="announcement-img"
                                />
                            </div>
                        )}

                        <div className="announcement-content">
                            <div className="announcement-meta">
                                <span className={`category-badge category-${getCategoryColor(announcement.category)}`}>
                                    {announcement.category}
                                </span>
                                {announcement.isFeatured && (
                                    <span className="featured-badge">
                                        <i className="fas fa-star"></i> Featured
                                    </span>
                                )}
                                <span className="announcement-date">{formatDate(announcement.createdAt)}</span>
                            </div>

                            <h3 className="announcement-title-text">{announcement.title}</h3>
                            <p className="announcement-excerpt">{truncateContent(announcement.content)}</p>

                            {announcement.externalLink ? (
                                <a
                                    href={announcement.externalLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="announcement-link"
                                >
                                    Read More <i className="fas fa-external-link-alt"></i>
                                </a>
                            ) : (
                                <Link href={`/announcements/${announcement.id}`} className="announcement-link">
                                    Read More <i className="fas fa-arrow-right"></i>
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="announcements-cta">
                <Link href="/announcements" className="view-all-announcements-btn">
                    View All Announcements
                    <i className="fas fa-chevron-right"></i>
                </Link>
            </div>
        </section>
    )
}
