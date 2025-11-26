'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './login.module.css'

export default function AdminLoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
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
            } else {
                router.push('/admin')
                router.refresh()
            }
        } catch (error) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.backgroundPattern}></div>
            <div className={styles.backgroundGradient}></div>

            <div className={styles.loginBox}>
                <div className={styles.formContainer}>
                    <header className={styles.header}>
                        <div className={styles.logoContainer}>
                            <i className={`fas fa-shield-alt ${styles.logoIcon}`}></i>
                        </div>
                        <h1 className={styles.title}>Admin Portal</h1>
                        <p className={styles.subtitle}>Secure Access Required</p>
                    </header>

                    <div className={styles.formContent}>
                        {error && (
                            <div className={styles.errorBox}>
                                <i className={`fas fa-lock ${styles.errorIcon}`}></i>
                                <div>
                                    <p className={styles.errorTitle}>Access Denied</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div>
                                <label className={styles.label}>Admin Email</label>
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputIcon}>
                                        <i className="fas fa-user-shield"></i>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className={styles.input}
                                        placeholder="admin@sudastock.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={styles.label}>Password</label>
                                <div className={styles.inputWrapper}>
                                    <div className={styles.inputIcon}>
                                        <i className="fas fa-key"></i>
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className={styles.input}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitButton}
                            >
                                {loading ? 'Verifying Credentials...' : 'Access Dashboard'}
                            </button>
                        </form>

                        <footer className={styles.footer}>
                            <Link href="/" className={styles.backLink}>
                                <i className="fas fa-arrow-left"></i> Back to Main Site
                            </Link>
                        </footer>
                    </div>
                </div>

                <div className={styles.copyright}>
                    <p>&copy; 2024 SudaStock. All rights reserved.</p>
                    <p>Unauthorized access is strictly prohibited.</p>
                </div>
            </div>
        </div>
    )
}
