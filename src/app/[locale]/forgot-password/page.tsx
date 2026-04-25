'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './forgot-password.module.css'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        setMessage('')

        // Simulate API call
        setTimeout(() => {
            setStatus('success')
            setMessage('If an account exists with this email, you will receive a password reset link shortly.')
        }, 1500)
    }

    return (
        <div className={styles.container}>
            {/* Background Elements */}
            <div className={styles.backgroundPattern}></div>
            <div className={styles.backgroundGradient}></div>

            {/* Decorative Blobs */}
            <div className={`${styles.blob1} ${styles.animateBlob}`}></div>
            <div className={`${styles.blob2} ${styles.animateBlob} ${styles.animationDelay2000}`}></div>

            <div className={styles.formContainer}>
                <div className={styles.headerText}>
                    <h2 className={styles.headerTitle}>
                        Reset Password
                    </h2>
                    <p className={styles.headerSubtitle}>
                        Enter your email to receive reset instructions
                    </p>
                </div>

                {status === 'success' ? (
                    <div className={styles.successMessage}>
                        <div className={styles.successIconContainer}>
                            <div className={styles.successIcon}>
                                <i className="fas fa-check"></i>
                            </div>
                        </div>
                        <h3 className={styles.successTitle}>Check your email</h3>
                        <p className={styles.successText}>{message}</p>
                        <div className={styles.returnToLogin}>
                            <Link href="/login" className={styles.returnToLoginLink}>
                                Return to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className={styles.label}>
                                Email Address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className={styles.submitButton}
                            >
                                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>

                        <div className={styles.backToLogin}>
                            <Link href="/login" className={styles.backToLoginLink}>
                                <i className="fas fa-arrow-left"></i>
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
