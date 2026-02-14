'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { FaTachometerAlt, FaUserCircle, FaChartBar, FaBoxOpen, FaEnvelope, FaSignOutAlt } from 'react-icons/fa'
import styles from './user.module.css'

export default function UserDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className={styles.container}>
            {/* Sidebar Navigation */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2 className={styles.sidebarTitle}>SudaStock</h2>
                </div>

                <nav className={styles.nav}>
                    <Link href="/user" className={`${styles.navItem} ${styles.navItemActive}`}>
                        <span className={styles.navIcon}><FaTachometerAlt /></span>
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/market-data" className={styles.navItem}>
                        <span className={styles.navIcon}><FaChartBar /></span>
                        <span>Market Data</span>
                    </Link>
                    <Link href="/products" className={styles.navItem}>
                        <span className={styles.navIcon}><FaBoxOpen /></span>
                        <span>Products</span>
                    </Link>
                    <Link href="/contact" className={styles.navItem}>
                        <span className={styles.navIcon}><FaEnvelope /></span>
                        <span>Contact</span>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.navItem} style={{ marginTop: 'auto', background: 'none', border: 'none', cursor: 'pointer', width: '100%' }}>
                        <span className={styles.navIcon}><FaSignOutAlt /></span>
                        <span>Logout</span>
                    </button>
                </nav>

                <div className={styles.userProfile}>
                    <div className={styles.userAvatar}>
                        {session.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className={styles.userInfo}>
                        <div className={styles.userName}>{session.user?.name || 'User'}</div>
                        <div className={styles.userEmail}>{session.user?.email}</div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.welcomeTitle}>
                            Welcome back, {session.user?.name?.split(' ')[0] || 'User'}!
                        </h1>
                        <p className={styles.welcomeSubtitle}>
                            Here's what's happening with your account today.
                        </p>
                    </div>
                </header>

                <div className={styles.dashboardGrid}>
                    {/* Profile Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIconBox}>
                                <FaUserCircle />
                            </div>
                            <div className={styles.cardTitle}>My Profile</div>
                        </div>
                        <p className={styles.cardDescription}>
                            Manage your personal information, security settings, and account preferences.
                        </p>
                        <button className={styles.cardButton}>
                            Edit Profile
                        </button>
                    </div>

                    {/* Market Data Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIconBox}>
                                <FaChartBar />
                            </div>
                            <div className={styles.cardTitle}>Market Data</div>
                        </div>
                        <p className={styles.cardDescription}>
                            Access real-time pricing, trends, and analytics for agricultural commodities.
                        </p>
                        <Link href="/market-data" className={styles.cardButton}>
                            View Market Data
                        </Link>
                    </div>

                    {/* Products Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIconBox}>
                                <FaBoxOpen />
                            </div>
                            <div className={styles.cardTitle}>Products</div>
                        </div>
                        <p className={styles.cardDescription}>
                            Browse our catalog of premium Sudanese agricultural products available for trade.
                        </p>
                        <Link href="/products" className={styles.cardButton}>
                            Browse Products
                        </Link>
                    </div>

                    {/* Support Card */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardIconBox}>
                                <FaEnvelope />
                            </div>
                            <div className={styles.cardTitle}>Support</div>
                        </div>
                        <p className={styles.cardDescription}>
                            Need assistance? Contact our support team for help with your account or trades.
                        </p>
                        <Link href="/contact" className={styles.cardButton}>
                            Contact Support
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
