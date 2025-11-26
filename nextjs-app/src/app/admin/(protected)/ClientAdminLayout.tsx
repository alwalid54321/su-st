'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import styles from './client-admin-layout.module.css'

export function ClientAdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const { data: session } = useSession()

    const userName = session?.user?.name || 'Admin User'
    const userEmail = session?.user?.email || ''
    const userInitial = session?.user?.name?.[0] || session?.user?.email?.[0] || 'A'

    const isActive = (path: string) => pathname === path || (path === '/admin' && pathname === '/admin/(protected)');

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/admin/login' })
    }

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className={styles.sidebarOverlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.aside} ${sidebarOpen ? styles.asideOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.headerContent}>
                        <div className={styles.logoGroup}>
                            <div className={styles.logoIconContainer}>
                                <i className={`fas fa-chart-pie ${styles.logoIcon}`}></i>
                            </div>
                            <div>
                                <h1 className={styles.logoTitle}>SudaStock</h1>
                                <p className={styles.logoSubtitle}>Admin Portal</p>
                            </div>
                        </div>
                        <button
                            className={styles.closeButton}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.navSectionTitle}>
                        Main Menu
                    </div>

                    <Link
                        href="/admin"
                        className={`${styles.navLink} ${isActive('/admin') ? styles.navLinkActive : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className={`${styles.navLinkIconContainer} ${isActive('/admin') ? styles.navLinkActive : ''}`}>
                            <i className={`fas fa-tachometer-alt ${styles.navLinkIcon}`}></i>
                        </div>
                        <span className={styles.navLinkText}>Dashboard</span>
                    </Link>

                    <Link
                        href="/admin/market-data"
                        className={`${styles.navLink} ${pathname?.startsWith('/admin/market-data') ? styles.navLinkActive : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className={`${styles.navLinkIconContainer} ${pathname?.startsWith('/admin/market-data') ? styles.navLinkActive : ''}`}>
                            <i className={`fas fa-chart-line ${styles.navLinkIcon}`}></i>
                        </div>
                        <span className={styles.navLinkText}>Market Data</span>
                    </Link>

                    <Link
                        href="/admin/currencies"
                        className={`${styles.navLink} ${pathname?.startsWith('/admin/currencies') ? styles.navLinkActive : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className={`${styles.navLinkIconContainer} ${pathname?.startsWith('/admin/currencies') ? styles.navLinkActive : ''}`}>
                            <i className={`fas fa-money-bill-wave ${styles.navLinkIcon}`}></i>
                        </div>
                        <span className={styles.navLinkText}>Currencies</span>
                    </Link>

                    <Link
                        href="/admin/gallery"
                        className={`${styles.navLink} ${pathname?.startsWith('/admin/gallery') ? styles.navLinkActive : ''}`}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <div className={`${styles.navLinkIconContainer} ${pathname?.startsWith('/admin/gallery') ? styles.navLinkActive : ''}`}>
                            <i className={`fas fa-images ${styles.navLinkIcon}`}></i>
                        </div>
                        <span className={styles.navLinkText}>Gallery</span>
                    </Link>

                    <div className={styles.navSectionTitle}>
                        System
                    </div>

                    <Link
                        href="/"
                        target="_blank"
                        className={styles.navLink}
                    >
                        <div className={styles.navLinkIconContainer}>
                            <i className={`fas fa-external-link-alt ${styles.navLinkIcon}`}></i>
                        </div>
                        <span className={styles.navLinkText}>View Live Site</span>
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {userInitial}
                        </div>
                        <div className={styles.userTextContent}>
                            <p className={styles.userName}>{userName}</p>
                            <p className={styles.userEmail}>{userEmail}</p>
                        </div>
                    </div>
                    <button onClick={handleSignOut} className={styles.logoutButton}>
                        <i className="fas fa-sign-out-alt"></i>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Header with burger menu */}
            <div className={styles.mobileHeader}>
                <button
                    className={styles.burgerButton}
                    onClick={() => setSidebarOpen(true)}
                >
                    <i className="fas fa-bars"></i>
                </button>
                <span className={styles.mobileHeaderTitle}>SudaStock Admin</span>
            </div>
        </>
    )
}

