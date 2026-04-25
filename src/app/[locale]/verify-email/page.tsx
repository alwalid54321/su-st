'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './verify-email.module.css'

function VerifyEmailContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const emailFromQuery = searchParams.get('email')

    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleResend = async () => {
        if (!emailFromQuery) return
        setResendLoading(true)
        setError('')
        setSuccess('')

        try {
            const response = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailFromQuery }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to resend code')
            } else {
                setSuccess(data.message || 'Code resent successfully!')
            }
        } catch (err) {
            setError('Failed to resend code')
        } finally {
            setResendLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        if (!emailFromQuery) {
            setError('Email address not found. Please register again.')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailFromQuery,
                    otp: otp.trim()
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Verification failed')
                setLoading(false)
                return
            }

            setSuccess('Email verified successfully! Redirecting to login...')

            setTimeout(() => {
                router.push('/login?verified=true')
            }, 2000)

        } catch (error: any) {
            setError('An unexpected error occurred')
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            {/* Background Elements */}
            <div className={styles.backgroundPattern}></div>
            <div className={styles.backgroundGradient}></div>

            {/* Decorative Blobs */}
            <div className={`${styles.blob1}`}></div>
            <div className={`${styles.blob2}`}></div>

            <div className={styles.formContainer}>
                <div className={styles.headerText}>
                    <h2 className={styles.headerTitle}>
                        Verification
                    </h2>
                    <p className={styles.headerSubtitle}>
                        Enter the 6-digit code sent to<br />
                        <strong>{emailFromQuery || 'your email'}</strong>
                    </p>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <i className={`fas fa-exclamation-circle ${styles.alertIcon}`}></i>
                        {error}
                    </div>
                )}

                {success && (
                    <div className={styles.successAlert}>
                        <i className={`fas fa-check-circle ${styles.alertIcon}`}></i>
                        {success}
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="otp" className={styles.label}>
                            Verification Code
                        </label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            className={styles.input}
                            placeholder="000000"
                            autoComplete="off"
                            autoFocus
                        />
                    </div>

                    <div className={styles.submitButtonContainer}>
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6 || !!success}
                            className={styles.submitButton}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Verifying...
                                </>
                            ) : 'Verify Account'}
                        </button>
                    </div>
                </form>

                <div className={styles.loginLinkContainer}>
                    <p className={styles.loginLinkText}>
                        Didn't receive the code?{' '}
                        <button
                            type="button"
                            className={styles.loginLink}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            onClick={handleResend}
                            disabled={resendLoading}
                        >
                            {resendLoading ? 'Sending...' : 'Resend Code'}
                        </button>
                    </p>
                    <p className={styles.loginLinkText} style={{ marginTop: '0.5rem' }}>
                        <Link href="/login" className={styles.loginLink}>
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
