'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/contexts/LanguageContext'

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
    const { t, language } = useLanguage()
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
        return date.toLocaleDateString(language === 'ar' ? 'ar-SD' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
                    <p>{t('fetchingBroadcasts')}</p>
                </div>
            </section>
        )
    }

    if (announcements.length === 0) return null

    // For seamless infinite scroll, we repeat the items
    const tickerItems = [...announcements, ...announcements]

    return (
        <section className="announcements-section">
            <div className="announcements-header">
                <div>
                    <h2 className="announcements-title">{t('announcements')}</h2>
                </div>
                <Link href="/announcements" className="box-link">
                    {t('viewAll')} <i className={`fas ${language === 'ar' ? 'fa-arrow-left' : 'fa-arrow-right'}`}></i>
                </Link>
            </div>

            <div className="announcements-ticker-container">
                <div className="announcements-track" dir="ltr">
                    {/* Force LTR for ticker to scroll correctly, content inside can be RTL if needed */}
                    {tickerItems.map((announcement, index) => (
                        <div
                            key={`${announcement.id}-${index}`}
                            className={`announcement-box ${announcement.isFeatured ? 'featured' : ''}`}
                            dir={language === 'ar' ? 'rtl' : 'ltr'}
                        >
                            <div className="box-meta">
                                <span className={`box-category category-${getCategoryColor(announcement.category)}`}>
                                    {t(announcement.category) || announcement.category}
                                </span>
                                {announcement.isFeatured && (
                                    <span className="featured-badge">
                                        <i className="fas fa-star"></i>
                                    </span>
                                )}
                            </div>

                            <h3 className="box-title">{announcement.title}</h3>
                            <p className="box-excerpt">{truncateContent(announcement.content, 100)}</p>

                            <div className="box-footer">
                                {announcement.externalLink ? (
                                    <a
                                        href={announcement.externalLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="box-link"
                                    >
                                        {t('details')} <i className={`fas ${language === 'ar' ? 'fa-external-link-alt' : 'fa-external-link-alt'}`}></i>
                                    </a>
                                ) : (
                                    <Link href={`/announcements/${announcement.id}`} className="box-link">
                                        {t('details')} <i className={`fas ${language === 'ar' ? 'fa-arrow-left' : 'fa-arrow-right'}`}></i>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
