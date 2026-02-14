'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
    const pathname = usePathname()

    // Hide navbar on dashboard and admin pages
    const shouldHideNavbar = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

    if (shouldHideNavbar) {
        return null
    }

    return <Navbar />
}
