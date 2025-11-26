'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import styles from './register.module.css'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    })
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<any>({})
    const [loading, setLoading] = useState(false)
    const [passwordStrength, setPasswordStrength] = useState(0)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Calculate password strength
    useEffect(() => {
        if (!formData.password) {
            setPasswordStrength(0)
            return
        }

        let strength = 0
        if (formData.password.length >= 8) strength++
        if (formData.password.length >= 12) strength++
        if (/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) strength++
        if (/[0-9]/.test(formData.password)) strength++
        if (/[^A-Za-z0-9]/.test(formData.password)) strength++

        setPasswordStrength(strength)
    }, [formData.password])

    const getPasswordStrengthLabel = () => {
        if (passwordStrength === 0) return ''
        if (passwordStrength <= 2) return 'Weak'
        if (passwordStrength === 3) return 'Fair'
        if (passwordStrength === 4) return 'Good'
        return 'Strong'
    }

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 2) return '#dc3545'
        if (passwordStrength === 3) return '#ffc107'
        if (passwordStrength === 4) return '#28a745'
        return '#28a745'
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear field-specific error
        if (fieldErrors[name]) {
            setFieldErrors((prev: any) => ({ ...prev, [name]: null }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setFieldErrors({})

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    firstName: formData.firstName.trim() || undefined,
                    lastName: formData.lastName.trim() || undefined
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.details) {
                    // Handle validation errors
                    setFieldErrors(data.details)
                    setError('Please fix the errors below')
                } else {
                    setError(data.error || 'Registration failed')
                }
                setLoading(false)
                return
            }

            // Success! Redirect to login
            router.push('/login?registered=true')
        } catch (error: any) {
            setError(error.message || 'An unexpected error occurred')
            setLoading(false)
        }
    }

    const handleSocialLogin = (provider: string) => {
        signIn(provider, { callbackUrl: '/' })
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
                        Create Account
                    </h2>
                    <p className={styles.headerSubtitle}>
                        Join SudaStock today and access premium market insights
                    </p>
                </div>

                {error && (
                    <div className={styles.errorAlert}>
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.grid2Cols}>
                        <div>
                            <label htmlFor="firstName" className={styles.label}>
                                First Name (Optional)
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="First Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="lastName" className={styles.label}>
                                Last Name (Optional)
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Last Name"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="username" className={styles.label}>
                            Username *
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            value={formData.username}
                            onChange={handleChange}
                            className={`${styles.input} ${fieldErrors.username ? styles.inputError : ''}`}
                            placeholder="Choose a username (3-30 characters)"
                        />
                        {fieldErrors.username && (
                            <p className={styles.fieldError}>{fieldErrors.username[0]}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className={styles.label}>
                            Email Address *
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                            placeholder="Enter your email"
                        />
                        {fieldErrors.email && (
                            <p className={styles.fieldError}>{fieldErrors.email[0]}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="password" className={styles.label}>
                            Password *
                        </label>
                        <div className={styles.passwordInputWrapper}>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                                placeholder="Create a strong password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={styles.togglePasswordBtn}
                            >
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <p className={styles.fieldError}>{fieldErrors.password[0]}</p>
                        )}

                        {formData.password && (
                            <div className={styles.passwordStrengthContainer}>
                                <div className={styles.passwordStrengthBar}>
                                    <div
                                        className={styles.passwordStrengthFill}
                                        style={{
                                            width: `${(passwordStrength / 5) * 100}%`,
                                            backgroundColor: getPasswordStrengthColor()
                                        }}
                                    ></div>
                                </div>
                                <span
                                    className={styles.passwordStrengthLabel}
                                    style={{ color: getPasswordStrengthColor() }}
                                >
                                    {getPasswordStrengthLabel()}
                                </span>
                            </div>
                        )}

                        <ul className={styles.passwordRequirements}>
                            <li className={formData.password.length >= 8 ? styles.met : ''}>
                                At least 8 characters
                            </li>
                            <li className={/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? styles.met : ''}>
                                Upper and lowercase letters
                            </li>
                            <li className={/[0-9]/.test(formData.password) ? styles.met : ''}>
                                At least one number
                            </li>
                            <li className={/[^A-Za-z0-9]/.test(formData.password) ? styles.met : ''}>
                                At least one special character
                            </li>
                        </ul>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className={styles.label}>
                            Confirm Password *
                        </label>
                        <div className={styles.passwordInputWrapper}>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className={styles.togglePasswordBtn}
                            >
                                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className={styles.fieldError}>Passwords do not match</p>
                        )}
                    </div>

                    <div className={styles.submitButtonContainer}>
                        <button
                            type="submit"
                            disabled={loading || passwordStrength < 3}
                            className={styles.submitButton}
                        >
                            {loading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Creating Account...
                                </>
                            ) : 'Create Account'}
                        </button>
                    </div>
                </form>

                <div className={styles.separator}>
                    <span className={styles.separatorText}>Or register with</span>
                </div>

                <div className={styles.socialLoginGrid}>
                    <button onClick={() => handleSocialLogin('google')} className={styles.socialLoginButton}>
                        <i className="fab fa-google"></i>
                    </button>
                    <button onClick={() => handleSocialLogin('facebook')} className={styles.socialLoginButton}>
                        <i className="fab fa-facebook-f"></i>
                    </button>
                    <button onClick={() => handleSocialLogin('apple')} className={styles.socialLoginButton}>
                        <i className="fab fa-apple"></i>
                    </button>
                    <button onClick={() => handleSocialLogin('microsoft')} className={styles.socialLoginButton}>
                        <i className="fab fa-microsoft"></i>
                    </button>
                </div>

                <div className={styles.loginLinkContainer}>
                    <p className={styles.loginLinkText}>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.loginLink}>
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
