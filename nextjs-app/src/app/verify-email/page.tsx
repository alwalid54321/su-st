'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import styles from './verify-email.module.css'

export default function VerifyEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || 'your email'

    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`)
            nextInput?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`)
            prevInput?.focus()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate verification
        setTimeout(() => {
            setLoading(false)
            setStatus('success')
            setTimeout(() => {
                router.push('/login?verified=true')
            }, 2000)
        }, 1500)
    }

    return (
        <div className={styles.container}>
            {/* Background Elements */}
            <div className={styles.backgroundPattern}></div>
            <div className={styles.backgroundGradient}></div>

            {/* Decorative Blobs */}
            <div className={styles.blob1}></div>
            <div className={styles.blob2}></div>

            <div className={styles.formContainer}>
                <div className={styles.headerText}>
                    <h2 className={styles.headerTitle}>
                        Verify Email
                    </h2>
                    <p className={styles.headerSubtitle}>
                        We've sent a code to <span className={styles.emailHighlight}>{email}</span>
                    </p>
                </div>

                {status === 'success' ? (
                    <div className={styles.successMessage}>
                        <div className={styles.successIconContainer}>
                            <div className={styles.successIcon}>
                                <i className="fas fa-check"></i>
                            </div>
                        </div>
                        <h3 className={styles.successTitle}>Email Verified!</h3>
                        <p className={styles.successText}>Redirecting to login...</p>
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.otpInputGroup}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={styles.otpInput}
                                />
                            ))}
                        </div>

                        <div className={styles.headerText}>
                            <p className={styles.resendCodeText}>
                                Didn't receive the code?{' '}
                                <button type="button" className={styles.resendCodeButton}>
                                    Resend
                                </button>
                            </p>
                            <button
                                type="submit"
                                disabled={loading || otp.some(d => !d)}
                                className={styles.submitButton}
                            >
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </div>

                        <div className={styles.backToLoginLinkContainer}>
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
