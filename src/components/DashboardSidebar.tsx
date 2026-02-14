'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import styles from './dashboard-sidebar.module.css'

export default function DashboardSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()

    const navItems = [
        { href: '/dashboard', icon: 'fas fa-home', label: 'Dashboard' },
        { href: '/dashboard/market-data', icon: 'fas fa-chart-line', label: 'Market Data' },
        { href: '/dashboard/currencies', icon: 'fas fa-money-bill-wave', label: 'Currencies' },
        { href: '/dashboard/gallery', icon: 'fas fa-images', label: 'Gallery' },
        { href: '/dashboard/announcements', icon: 'fas fa-bullhorn', label: 'Announcements' },
        { href: '/dashboard/users', icon: 'fas fa-users', label: 'Users' },
        { href: '/dashboard/settings', icon: 'fas fa-cog', label: 'Settings' },
    ]

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    const userNameInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : '?'

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <Link href="/dashboard" className={styles.sidebarLogo}>
                    SudaStock Admin
                </Link>
            </div>
            <nav className={styles.sidebarNav}>
                <ul>
                    {navItems.map(item => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`${styles.sidebarLink} ${pathname === item.href ? styles.active : ''}`}
                            >
                                <i className={item.icon}></i>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className={styles.sidebarFooter}>
                <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                        {userNameInitial}
                    </div>
                    <span className={styles.userName}>{session?.user?.name || 'Admin User'}</span>
                </div>
                <button onClick={handleSignOut} className={styles.logoutButton}>
                    <i className="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </aside>
    )
}