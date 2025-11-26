import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ClientAdminLayout } from './ClientAdminLayout'
import styles from './client-admin-layout.module.css' // Import styles for the main content wrapper

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    // Check if user is admin (staff or superuser)
    if (!session?.user || (!(session.user as any).isStaff && !(session.user as any).isSuperuser)) {
        redirect('/admin/login')
    }

    return (
        <div className={styles.adminLayoutWrapper}> {/* Use module class for overall layout */}
            <ClientAdminLayout />

            {/* Main Content Wrapper */}
            <div className={styles.mainContentWrapper}>


                {/* Main Content Area */}
                <main className={styles.mainContentArea}>
                    <div className={styles.mainContentInner}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
