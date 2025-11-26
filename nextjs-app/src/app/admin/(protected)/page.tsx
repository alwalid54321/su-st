'use client'

import Link from 'next/link'
import styles from './admin.module.css'

export default function AdminDashboard() {
    // Mock Data for Admin Dashboard
    const stats = [
        { label: 'Total Products', value: '9', icon: 'fa-box-open', color: 'Blue' },
        { label: 'Active Currencies', value: '6', icon: 'fa-money-bill-wave', color: 'Green' },
        { label: 'Gallery Images', value: '12', icon: 'fa-images', color: 'Purple' },
        { label: 'Registered Users', value: '145', icon: 'fa-users', color: 'Yellow' },
    ]

    const recentActivity = [
        { action: 'Updated Price', item: 'Sesame Gadadref', user: 'Admin', time: '2 mins ago', icon: 'fa-edit', color: 'Blue' },
        { action: 'New User', item: 'John Doe', user: 'System', time: '15 mins ago', icon: 'fa-user-plus', color: 'Green' },
        { action: 'Currency Rate', item: 'USD/SDG', user: 'Admin', time: '1 hour ago', icon: 'fa-exchange-alt', color: 'Yellow' },
        { action: 'Image Upload', item: 'harvest_2023.jpg', user: 'Editor', time: '3 hours ago', icon: 'fa-upload', color: 'Purple' },
    ]

    return (
        <div className={styles.dashboardContainer}>
            {/* Header Section */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.headerTitle}>Admin Dashboard</h1>
                    <p className={styles.headerSubtitle}>Overview of system activity and performance</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/market-data/new" className={styles.primaryButton}>
                        <i className="fas fa-plus"></i> Add Product
                    </Link>
                    <Link href="/admin/currencies" className={styles.secondaryButton}>
                        <i className="fas fa-sync-alt"></i> Update Rates
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

                {/* Recent Activity */}
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

                {/* Side Panel */}
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
