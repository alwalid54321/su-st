'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        darkMode: false,
        language: 'en'
    })
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked

        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate API call
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        setTimeout(() => setMessage(null), 3000)
    }

    return (
        <div className="settings-page">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="settings-container">
                            <h2 className="section-title">Account Settings</h2>

                            {message && (
                                <div className={`alert alert-${message.type}`}>
                                    {message.text}
                                    <button onClick={() => setMessage(null)} className="close-btn">&times;</button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                {/* Notification Preferences */}
                                <div className="settings-section">
                                    <h4 className="settings-section-title">Notification Preferences</h4>
                                    <div className="settings-card">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="emailNotifications"
                                                name="emailNotifications"
                                                checked={settings.emailNotifications}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="emailNotifications">Email Notifications</label>
                                            <div className="form-text text-muted">Receive email notifications about account activity, market updates, and announcements.</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Display Preferences */}
                                <div className="settings-section">
                                    <h4 className="settings-section-title">Display Preferences</h4>
                                    <div className="settings-card">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="darkMode"
                                                name="darkMode"
                                                checked={settings.darkMode}
                                                onChange={handleChange}
                                            />
                                            <label className="form-check-label" htmlFor="darkMode">Dark Mode</label>
                                            <div className="form-text text-muted">Switch between light and dark themes for the application interface.</div>
                                        </div>

                                        <div className="form-group-select">
                                            <label htmlFor="language" className="form-label">Language</label>
                                            <select
                                                className="form-select"
                                                id="language"
                                                name="language"
                                                value={settings.language}
                                                onChange={handleChange}
                                            >
                                                <option value="en">English</option>
                                                <option value="ar">Arabic</option>
                                                <option value="fr">French</option>
                                            </select>
                                            <div className="form-text text-muted">Select your preferred language for the application interface.</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Settings */}
                                <div className="settings-section">
                                    <h4 className="settings-section-title">Security Settings</h4>
                                    <div className="settings-card security-card-center">
                                        <div className="security-icon">
                                            <i className="fas fa-shield-alt"></i>
                                        </div>
                                        <h5 className="mb-3 font-bold text-lg">Account Security</h5>
                                        <p className="text-muted mb-4">Manage your password, two-factor authentication, and connected devices.</p>
                                        <button type="button" className="btn settings-btn outline">
                                            <i className="fas fa-key"></i> Change Password
                                        </button>
                                    </div>

                                    <div className="settings-card">
                                        <div className="social-accounts-management">
                                            <div>
                                                <h5 className="mb-2 font-bold text-lg">Social Accounts</h5>
                                                <p className="text-muted mb-0">Manage your connected social accounts for easy login.</p>
                                            </div>
                                            <button type="button" className="btn settings-btn outline">
                                                <i className="fas fa-cog"></i> Manage
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="settings-actions">
                                    <Link href="/dashboard" className="btn settings-btn outline">
                                        <i className="fas fa-arrow-left"></i> Back to Dashboard
                                    </Link>
                                    <button type="submit" className="btn settings-btn primary">
                                        <i className="fas fa-save"></i> Save Settings
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                :root {
                    --accent: #786D3C;
                    --primary-dark: #1B1464;
                    --success-color: #28a745;
                    --error-color: #dc3545;
                    --warning-color: #ffc107;
                }

                .settings-page {
                    min-height: 100vh;
                    background-color: #f8f9fa;
                    padding-top: 2rem;
                    padding-bottom: 3rem;
                    font-family: 'Arial', sans-serif;
                }

                .container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 20px;
                }

                .row {
                    display: flex;
                    justify-content: center;
                }

                .col-lg-8 {
                    width: 100%;
                }

                .settings-container {
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                    padding: 2.5rem;
                    margin-bottom: 3rem;
                    border-top: 5px solid var(--primary-dark);
                }
                
                .section-title {
                    color: var(--primary-dark);
                    font-weight: 700;
                    margin-bottom: 1.8rem;
                    padding-bottom: 0.8rem;
                    border-bottom: 2px solid #f0f2f5;
                    font-size: 2rem;
                }
                
                .settings-section {
                    margin-bottom: 2.5rem;
                }
                
                .settings-section-title {
                    color: var(--accent);
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.6rem;
                    border-bottom: 1px solid #e9ecef;
                    font-size: 1.3rem;
                }
                
                .settings-card {
                    background-color: #fcfcfc;
                    border-radius: 10px;
                    padding: 1.8rem;
                    margin-bottom: 1.5rem;
                    transition: all 0.3s ease;
                    border: 1px solid #eef2f5;
                }
                
                .settings-card:hover {
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.07);
                    transform: translateY(-4px);
                }

                .security-card-center {
                    text-align: center;
                }
                
                .form-check {
                    display: flex;
                    align-items: center;
                    margin-bottom: 1.2rem;
                    position: relative;
                    padding-left: 3em; /* Space for the custom switch */
                }

                .form-switch .form-check-input {
                    width: 2.5em; /* Larger switch width */
                    height: 1.2em; /* Larger switch height */
                    margin-left: -3em;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='rgba%280, 0, 0, 0.25%29'/%3e%3c/svg%3e");
                    background-position: left center;
                    background-repeat: no-repeat;
                    background-size: contain;
                    border: 1px solid rgba(0, 0, 0, 0.25);
                    appearance: none;
                    border-radius: 2em;
                    transition: background-position .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out;
                    cursor: pointer;
                    vertical-align: middle;
                }

                .form-check-input:checked {
                    background-color: var(--primary-dark);
                    border-color: var(--primary-dark);
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3e%3ccircle r='3' fill='%23fff'/%3e%3c/svg%3e");
                    background-position: right center;
                }
                
                .form-check-label {
                    margin-left: 0.8rem;
                    font-weight: 500;
                    cursor: pointer;
                    color: #343a40;
                    font-size: 1rem;
                }

                .form-label {
                    display: block;
                    margin-bottom: 0.6rem;
                    font-weight: 500;
                    color: #343a40;
                    font-size: 1rem;
                }

                .form-group-select {
                    margin-top: 1.5rem;
                }

                .form-select {
                    display: block;
                    width: 100%;
                    padding: 0.8rem 2.5rem 0.8rem 1rem; /* Adjusted padding */
                    font-size: 1rem;
                    font-weight: 400;
                    line-height: 1.5;
                    color: #495057;
                    background-color: #f8f9fa;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 0.75rem center;
                    background-size: 16px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 8px; /* Larger border-radius */
                    transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
                    appearance: none;
                }

                .form-select:focus {
                    border-color: var(--primary-dark);
                    outline: 0;
                    box-shadow: 0 0 0 0.25rem rgba(27, 20, 100, 0.15);
                }
                
                .form-text {
                    margin-top: 0.5rem;
                    font-size: 0.9em;
                    color: #6c757d;
                }
                
                .settings-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 3rem;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                }
                
                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.8rem 1.6rem;
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    cursor: pointer;
                    border: none;
                    font-size: 0.95rem;
                }
                
                .btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                
                .btn.primary {
                    background-color: var(--primary-dark);
                    color: white;
                }
                
                .btn.primary:hover {
                    background-color: #15104f;
                }
                
                .btn.outline {
                    border: 1px solid #ced4da;
                    background-color: white;
                    color: #555;
                }
                
                .btn.outline:hover {
                    border-color: var(--primary-dark);
                    color: var(--primary-dark);
                    background-color: #f8f9fa;
                }
                
                .security-icon {
                    font-size: 2.5rem; /* Larger icon */
                    color: var(--accent);
                    margin-bottom: 1.2rem;
                }

                .social-accounts-management {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .alert {
                    position: relative;
                    padding: 1rem 1.5rem;
                    margin-bottom: 2rem;
                    border: 1px solid transparent;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 1rem;
                    font-weight: 500;
                }

                .alert-success {
                    color: #0f5132;
                    background-color: #d1e7dd;
                    border-color: #badbcc;
                }
                .alert-error {
                    color: #842029;
                    background-color: #f8d7da;
                    border-color: #f5c2c7;
                }

                .close-btn {
                    background: none;
                    border: none;
                    font-size: 1.8rem; /* Larger close button */
                    line-height: 1;
                    color: inherit;
                    cursor: pointer;
                    padding: 0;
                    margin-left: 1rem;
                }
                
                @media (max-width: 768px) {
                    .settings-container {
                        padding: 1.5rem;
                    }
                    
                    .settings-actions {
                        flex-direction: column;
                    }
                    
                    .btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .section-title {
                        font-size: 1.5rem;
                    }

                    .settings-section-title {
                        font-size: 1.1rem;
                    }
                }
            `}</style>
        </div>
    )
}
