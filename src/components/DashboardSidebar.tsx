'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import styles from './dashboard-sidebar.module.css'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DashboardSidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { t, language } = useLanguage()

    const navItems = [
        { href: '/dashboard', icon: 'fas fa-home', label: t('dashboard') },
        { href: '/dashboard/market-data', icon: 'fas fa-chart-line', label: t('marketData') },
        { href: '/dashboard/currencies', icon: 'fas fa-money-bill-wave', label: t('currencies') },
        { href: '/dashboard/gallery', icon: 'fas fa-images', label: t('gallery') },
        { href: '/dashboard/announcements', icon: 'fas fa-bullhorn', label: t('announcements') },
        { href: '/dashboard/users', icon: 'fas fa-users', label: t('users') },
        { href: '/dashboard/settings', icon: 'fas fa-cog', label: t('settings') },
    ]

    const handleSignOut = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    const userNameInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : '?'

    return (
        <aside className={styles.sidebar} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={styles.sidebarHeader}>
                <Link href="/dashboard" className={styles.sidebarLogo}>
                    {t('sudaStockAdmin')}
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
                    <span className={styles.userName}>{session?.user?.name || t('adminUser')}</span>
                </div>
                <button onClick={handleSignOut} className={styles.logoutButton}>
                    <i className="fas fa-sign-out-alt"></i>
                    {t('logout')}
                </button>
            </div>
        </aside>
    )
}