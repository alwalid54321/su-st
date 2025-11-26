'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // Check if on dashboard or admin pages
    const isAdminPage = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

    if (isAdminPage) {
        // No padding or footer for admin pages
        return <>{children}</>
    }

    // Regular pages get padding and footer
    return (
        <>
            <main className="min-h-screen pt-24">
                {children}
            </main>
            <Footer />
        </>
    )
}
