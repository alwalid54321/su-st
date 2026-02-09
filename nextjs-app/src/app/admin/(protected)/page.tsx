'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './admin.module.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export default function AdminDashboard() {
    // Mock Data for Admin Dashboard
    const stats = [
        { label: 'Total Products', value: '9', icon: 'fa-box-open', color: 'Blue' },
        { label: 'Variations', value: '4', icon: 'fa-tags', color: 'Purple' },
        { label: 'Ports', value: '6', icon: 'fa-anchor', color: 'Green' },
        { label: 'Active Currencies', value: '6', icon: 'fa-money-bill-wave', color: 'Yellow' },
    ]

    const recentActivity = [
        { action: 'Updated Price', item: 'Sesame Gadadref', user: 'Admin', time: '2 mins ago', icon: 'fa-edit', color: 'Blue' },
        { action: 'Added Port', item: 'Port Sudan', user: 'Admin', time: '15 mins ago', icon: 'fa-plus', color: 'Green' },
        { action: 'New Variation', item: 'Organic', user: 'Admin', time: '1 hour ago', icon: 'fa-tag', color: 'Purple' },
        { action: 'Currency Rate', item: 'USD/SDG', user: 'Admin', time: '3 hours ago', icon: 'fa-exchange-alt', color: 'Yellow' },
    ]

    // Consolidated Data from old Dashboard
    const [announcements, setAnnouncements] = useState<any[]>([
        { id: 1, title: 'System Upgrade Notice', date: '2025-11-25', priority: 'high' },
        { id: 2, title: 'New API Version Released', date: '2025-11-24', priority: 'medium' },
        { id: 3, title: 'Holiday Maintenance Schedule', date: '2025-11-22', priority: 'low' },
    ]);

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Market Value',
                data: [1200, 1250, 1230, 1280, 1300, 1320],
                borderColor: '#1B1464',
                backgroundColor: 'rgba(27, 20, 100, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ]
    }

    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    }

    return (
        <div className={styles.dashboardContainer}>
            {/* Header Section */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.headerTitle}>Admin Dashboard</h1>
                    <p className={styles.headerSubtitle}>Overview of system activity and performance</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/variations" className={styles.primaryButton} style={{ marginRight: '10px' }}>
                        <i className="fas fa-tags"></i> Variations
                    </Link>
                    <Link href="/admin/ports" className={styles.primaryButton}>
                        <i className="fas fa-anchor"></i> Ports
                    </Link>
                </div>
            </header>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statCardHeader}>
                            <div className={`${styles.statIcon} ${styles[`icon${stat.color}`]}`}>
                                <i className={`fas ${stat.icon}`}></i>
                            </div>
                            <span className={styles.statValue}>{stat.value}</span>
                        </div>
                        <h3 className={styles.statLabel}>{stat.label}</h3>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className={styles.mainGrid}>

                {/* Market Analysis Chart (Spans 2 columns) */}
                <div className={styles.card} style={{ gridColumn: 'span 2' }}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Market Analysis</h2>
                    </div>
                    <div className={styles.cardContent} style={{ padding: '1.5rem' }}>
                        <div className={styles.chartContainer}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Announcements (Spans 1 column) */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Announcements</h2>
                        <Link href="/admin/announcements" className={styles.viewAllButton}>Manage</Link>
                    </div>
                    <div className={styles.cardContent} style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                        <ul className={styles.announcementsList}>
                            {announcements.map(item => (
                                <li key={item.id}>
                                    <strong>{item.title}</strong>
                                    <br />
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{item.date}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Recent Activity (Spans 2 columns) */}
                <div className={`${styles.card} ${styles.recentActivityContainer}`}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Recent Activity</h2>
                        <button className={styles.viewAllButton}>View All</button>
                    </div>
                    <div className={styles.activityList}>
                        {recentActivity.map((activity, index) => (
                            <div key={index} className={styles.activityItem}>
                                <div className={`${styles.activityIcon} ${styles[`activityIcon${activity.color}`]}`}>
                                    <i className={`fas ${activity.icon}`}></i>
                                </div>
                                <div className={styles.activityContent}>
                                    <p className={styles.activityText}>
                                        {activity.action}: <span>{activity.item}</span>
                                    </p>
                                    <p className={styles.activitySubtext}>
                                        by {activity.user} • {activity.time}
                                    </p>
                                </div>
                                <button className={styles.activityAction}>
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Side Panel (Spans 1 column) */}
                <div className={styles.sidePanel}>
                    <div className={`${styles.card} ${styles.statusCard}`}>
                        <h2 className={styles.cardTitle}>System Status</h2>
                        <div className={styles.statusList}>
                            <div className={styles.statusItem}>
                                <span className={styles.statusLabel}>Server Status</span>
                                <span className={`${styles.statusBadge} ${styles.statusBadgeGreen}`}>
                                    <span className={styles.statusPulse}></span>
                                    Operational
                                </span>
                            </div>
                            <div className={styles.statusItem}>
                                <span className={styles.statusLabel}>Database</span>
                                <span className={`${styles.statusBadge} ${styles.statusBadgeConnected}`}>Connected</span>
                            </div>
                            <div className={styles.statusItem}>
                                <span className={styles.statusLabel}>Last Backup</span>
                                <span className={styles.statusTime}>2 hours ago</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.helpCard}>
                        <h2 className={styles.helpTitle}>Need Help?</h2>
                        <p className={styles.helpText}>Check the documentation or contact support for assistance with the admin panel.</p>
                        <button className={styles.helpButton}>
                            View Documentation
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
