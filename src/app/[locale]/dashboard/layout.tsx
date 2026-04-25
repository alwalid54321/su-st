'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'
import styles from '@/components/dashboard-sidebar.module.css' // Using the CSS module for layout styles

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // The useSession and useRouter are kept in case they are used elsewhere in the children
    // but the sidebar logic is now encapsulated in DashboardSidebar.
    const { data: session } = useSession()
    const router = useRouter()
    const pathname = usePathname()

    return (
        <div className={styles.dashboardLayout}>
            <DashboardSidebar />
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    )
}
