'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './login.module.css'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showOtp, setShowOtp] = useState(false)
    const [otp, setOtp] = useState(['', '', '', '', '', ''])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        await performSignIn()
    }

    const performSignIn = async () => {
        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                setError('Invalid email or password')
                setLoading(false)
            } else {
                router.push('/')
                router.refresh()
            }
        } catch (error) {
            setError('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return; // Only allow single digit
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`)
            nextInput?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`)
            prevInput?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('')
        if (pastedData.every(char => /^\d$/.test(char))) {
          const newOtp = [...otp]
          pastedData.forEach((char, index) => {
            if (index < 6) newOtp[index] = char
          })
          setOtp(newOtp)
          // Focus the last filled input or the absolute last if full
          const focusIndex = Math.min(pastedData.length, 5)
          document.getElementById(`otp-${focusIndex}`)?.focus()
        }
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const result = await signIn('credentials', {
                email,
                otp: otp.join(''),
                redirect: false,
            })

            if (result?.error) {
                setError(result.error)
                setLoading(false)
            } else {
                router.push('/')
                router.refresh()
            }
        } catch (error) {
            setError('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    const handleSendOtp = async () => {
        if (!email) {
            setError('Please enter your email address first to receive an OTP.')
            return
        }
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })
            const data = await res.json()
            if (res.ok) {
                setShowOtp(true)
            } else {
                setError(data.error || 'Failed to send OTP')
            }
        } catch (err) {
            setError('An error occurred while sending OTP.')
        } finally {
            setLoading(false)
        }
    }

    const handleSocialLogin = (provider: string) => {
        signIn(provider, { callbackUrl: '/' })
    }

    return (
        <div className={styles.container}>
            {/* Background Pattern */}
            <div className={styles.backgroundPattern}></div>

            {/* Decorative Gradient Blobs */}
            <div className={`${styles.blob1}`}></div>
            <div className={`${styles.blob2}`}></div>

            <div className={styles.loginBox}>
                <div className={styles.headerText}>
                    <h2 className={styles.headerTitle}>
                        {showOtp ? 'Verify Identity' : 'Welcome Back'}
                    </h2>
                    <p className={styles.headerSubtitle}>
                        {showOtp ? 'Enter the 6-digit code sent to your email' : 'Sign in to access your SudaStock account'}
                    </p>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                {!showOtp ? (
                    <>
                        <form className={styles.form} onSubmit={handleLogin}>
                            <div className={styles.formGroup}>
                                <label htmlFor="email" className={styles.label}>
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    suppressHydrationWarning
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={styles.input}
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="password" className={styles.label}>
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    suppressHydrationWarning
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.input}
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div className={styles.checkboxContainer}>
                                <div className={styles.checkboxGroup}>
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className={styles.checkbox}
                                    />
                                    <label htmlFor="remember-me" className={styles.checkboxLabel}>
                                        Remember me
                                    </label>
                                </div>

                                <div className={styles.forgotPasswordLink}>
                                    <Link href="/forgot-password" className={styles.forgotPasswordLink}>
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={styles.submitButton}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Working...' : 'Sign in'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={loading}
                                    className={styles.submitButton}
                                    style={{ flex: 1, backgroundColor: '#333', color: '#fff' }}
                                >
                                    Send OTP
                                </button>
                            </div>
                        </form>

                        <div className={styles.separator}>
                            <span className={styles.separatorText}>Or continue with</span>
                        </div>

                        <div className={styles.socialLoginGrid}>
                            <button type="button" onClick={() => handleSocialLogin('google')} className={styles.socialLoginButton}>
                                <i className="fab fa-google"></i>
                            </button>
                        </div>
                    </>
                ) : (
                    <form className={styles.form} onSubmit={handleOtpSubmit}>
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
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className={styles.otpInput}
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                />
                            ))}
                        </div>
                        <div className={styles.headerText}>
                            <p className={styles.otpResendText}>
                                Didn't receive the code?{' '}
                                <button type="button" onClick={handleSendOtp} className={styles.otpResendButton}>
                                    Resend
                                </button>
                            </p>
                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.submitButton}
                            >
                                {loading ? 'Verifying...' : 'Verify & Sign In'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowOtp(false)}
                                className={styles.backToLoginLink}
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}

                <div className={styles.loginLinkContainer}>
                    <p className={styles.loginLinkText}>
                        Don't have an account?{' '}
                        <Link href="/register" className={styles.loginLink}>
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
