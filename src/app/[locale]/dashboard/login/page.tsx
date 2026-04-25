'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './dashboard-login.module.css' // Import the new CSS module

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Invalid admin credentials')
                setLoading(false)
            } else {
                const response = await fetch('/api/auth/session')
                const session = await response.json()

                if (session?.user?.isStaff || session?.user?.isSuperuser) {
                    router.push('/dashboard')
                    router.refresh()
                } else {
                    setError('Access denied. Admin privileges required.')
                    setLoading(false)
                    await signIn('credentials', { redirect: false })
                }
            }
        } catch (error) {
            setError('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <header className={styles.loginHeader}>
                    <h2>Admin Portal</h2>
                    <p>Secure login for authorized administrators only</p>
                </header>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className={styles.formGroup}>
                        <label htmlFor="admin-email">Admin Email</label>
                        <input
                            id="admin-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@sudastock.com"
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="admin-password">Admin Password</label>
                        <input
                            id="admin-password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.loginButton}
                        >
                            {loading ? 'Verifying...' : 'Sign in as Admin'}
                        </button>
                    </div>
                </form>

                <div className={styles.loginFooter}>
                    <p>
                        Not an admin?{' '}
                        <Link href="/login">
                            User Login
                        </Link>
                    </p>
                </div>

                <div className={styles.securityNotice}>
                    <p>
                        All admin login attempts are monitored and logged for security purposes
                    </p>
                </div>
            </div>
        </div>
    )
}
