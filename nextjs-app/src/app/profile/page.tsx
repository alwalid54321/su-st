'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'

export default function ProfilePage() {
    const { data: session } = useSession()

    // Mock extended user data since session only has basic info
    const user = {
        firstName: session?.user?.name?.split(' ')[0] || 'User',
        lastName: session?.user?.name?.split(' ')[1] || 'Name',
        email: session?.user?.email || 'user@example.com',
        username: session?.user?.email?.split('@')[0] || 'username',
        phone: '+249 912 345 678',
        dateJoined: 'November 15, 2023',
        lastLogin: 'November 24, 2023 09:30',
        isActive: true,
        emailVerified: true,
        socialAccounts: [
            { provider: 'google', name: 'Google' }
        ]
    }

    return (
        <div className="profile-page">
            <div className="container">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="profile-container">
                            {/* Header */}
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </div>
                                <div className="profile-info">
                                    <h2>{user.firstName} {user.lastName}</h2>
                                    <p><i className="fas fa-envelope me-2"></i> {user.email}</p>
                                    <p><i className="fas fa-user me-2"></i> {user.username}</p>
                                    <p><i className="fas fa-calendar-alt me-2"></i> Member since {user.dateJoined}</p>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="profile-section">
                                <h3 className="profile-section-title">Personal Information</h3>
                                <div className="grid-2-cols">
                                    <div className="profile-detail">
                                        <div className="profile-detail-label">First Name</div>
                                        <div className="profile-detail-value">{user.firstName}</div>
                                    </div>
                                    <div className="profile-detail">
                                        <div className="profile-detail-label">Last Name</div>
                                        <div className="profile-detail-value">{user.lastName}</div>
                                    </div>
                                    <div className="profile-detail">
                                        <div className="profile-detail-label">Email</div>
                                        <div className="profile-detail-value">{user.email}</div>
                                    </div>
                                    <div className="profile-detail">
                                        <div className="profile-detail-label">Phone</div>
                                        <div className="profile-detail-value">{user.phone}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Settings */}
                            <div className="profile-section">
                                <h3 className="profile-section-title">Account Status</h3>
                                <div className="grid-2-cols">
                                    <div className="profile-detail">
                                        <div className="profile-detail-label">Username</div>
                                        <div className="profile-detail-value">{user.username}</div>
                                    </div>
                                    <div className="profile-detail">
                                        <div className="profile-detail-label">Account Status</div>
                                        <div className="profile-detail-value">
                                            {user.isActive ? (
                                                <span className="badge bg-success">Active</span>
                                            ) : (
                                                <span className="badge bg-danger">Inactive</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="profile-detail">
                                        <div className="profile-detail-label">Email Verified</div>
                                        <div className="profile-detail-value">
                                            {user.emailVerified ? (
                                                <span className="badge bg-success">Verified</span>
                                            ) : (
                                                <span className="badge bg-warning text-dark">Not Verified</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="profile-detail">
                                        <div className="profile-detail-label">Last Login</div>
                                        <div className="profile-detail-value">{user.lastLogin}</div>
                                    </div>
                                </div>

                                {/* Social Connections Card */}
                                <div className="social-connections-card">
                                    <div className="social-connections-title">
                                        <i className="fas fa-link"></i> Connected Social Accounts
                                    </div>

                                    {user.socialAccounts.length > 0 ? (
                                        <div className="social-accounts-list">
                                            {user.socialAccounts.map((account, index) => (
                                                <div key={index} className={`social-account-icon ${account.provider}`} title={account.name}>
                                                    <i className={`fab fa-${account.provider}`}></i>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-social-accounts">
                                            No social accounts connected
                                        </div>
                                    )}

                                    <Link href="/settings" className="btn profile-action-btn outline">
                                        <i className="fas fa-cog"></i> Manage Social Connections
                                    </Link>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="profile-actions">
                                <Link href="/dashboard" className="btn profile-action-btn outline">
                                    <i className="fas fa-arrow-left"></i> Back to Dashboard
                                </Link>
                                <button className="btn profile-action-btn primary">
                                    <i className="fas fa-edit"></i> Edit Profile
                                </button>
                                <Link href="/settings" className="btn profile-action-btn secondary">
                                    <i className="fas fa-key"></i> Change Password
                                </Link>
                            </div>
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

                .profile-page {
                    min-height: 100vh;
                    background-color: #f8f9fa;
                    padding-top: 2rem;
                    padding-bottom: 2rem; /* Added padding bottom */
                    font-family: 'Arial', sans-serif; /* Changed font */
                }

                .container {
                    max-width: 1000px; /* Adjusted max-width */
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

                .profile-container {
                    background-color: white;
                    border-radius: 12px; /* Slightly larger border-radius */
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); /* Softer shadow */
                    padding: 2.5rem;
                    margin-bottom: 3rem;
                    border-top: 5px solid var(--primary-dark); /* Thicker border-top */
                }
                
                .profile-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 2.5rem; /* Increased margin */
                    padding-bottom: 1.8rem; /* Increased padding */
                    border-bottom: 1px solid #e9ecef; /* Lighter border */
                }
                
                .profile-avatar {
                    width: 90px; /* Slightly smaller avatar */
                    height: 90px;
                    border-radius: 50%;
                    background-color: var(--primary-dark);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2.2rem; /* Adjusted font size */
                    font-weight: 600;
                    margin-right: 1.8rem; /* Adjusted margin */
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Added shadow to avatar */
                }
                
                .profile-info h2 {
                    color: var(--primary-dark);
                    margin-bottom: 0.6rem;
                    font-size: 2rem; /* Adjusted font size */
                    font-weight: 700;
                }
                
                .profile-info p {
                    color: #555;
                    margin-bottom: 0.4rem;
                    display: flex;
                    align-items: center;
                    font-size: 0.95rem;
                }

                .profile-info i {
                    margin-right: 0.6rem;
                    width: 20px;
                    text-align: center;
                    color: var(--accent); /* Icon color */
                }
                
                .profile-section {
                    margin-bottom: 2.5rem; /* Increased margin */
                }
                
                .profile-section-title {
                    color: #333; /* Darker title color */
                    font-weight: 700; /* Bolder font */
                    margin-bottom: 1.8rem; /* Increased margin */
                    padding-bottom: 0.8rem; /* Increased padding */
                    border-bottom: 2px solid #f0f2f5; /* Thicker, lighter border */
                    font-size: 1.35rem; /* Adjusted font size */
                }
                
                .grid-2-cols {
                    display: grid;
                    grid-template-columns: repeat(1, 1fr);
                    gap: 1.5rem; /* gap-6 */
                }

                @media (min-width: 768px) {
                    .grid-2-cols {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                .profile-detail {
                    margin-bottom: 0; /* Removed bottom margin, handled by gap */
                    background-color: #f8f9fa; /* Light background for details */
                    padding: 1rem 1.2rem;
                    border-radius: 8px;
                    border: 1px solid #e9ecef;
                }
                
                .profile-detail-label {
                    font-weight: 600;
                    color: #6c757d; /* Grayish label */
                    margin-bottom: 0.3rem;
                    font-size: 0.85rem;
                }
                
                .profile-detail-value {
                    color: #343a40; /* Darker value */
                    font-size: 1rem;
                    font-weight: 500;
                }
                
                .badge {
                    padding: 0.4em 0.8em; /* Adjusted padding */
                    font-size: 0.8em; /* Adjusted font size */
                    font-weight: 700;
                    line-height: 1;
                    color: #fff;
                    text-align: center;
                    white-space: nowrap;
                    vertical-align: baseline;
                    border-radius: 0.35rem; /* Slightly larger border-radius */
                }

                .bg-success { background-color: var(--success-color); }
                .bg-danger { background-color: var(--error-color); }
                .bg-warning { background-color: var(--warning-color); color: #212529; }
                
                .profile-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 3rem; /* Increased margin */
                    flex-wrap: wrap;
                    justify-content: flex-start; /* Align to start */
                }
                
                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.6rem;
                    padding: 0.8rem 1.6rem; /* Adjusted padding */
                    border-radius: 8px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    text-decoration: none;
                    cursor: pointer;
                    border: none;
                    font-size: 0.95rem;
                }
                
                .btn:hover {
                    transform: translateY(-4px); /* More pronounced lift */
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15); /* Stronger shadow */
                }
                
                .btn.primary {
                    background-color: var(--primary-dark);
                    color: white;
                }
                
                .btn.primary:hover {
                    background-color: #15104f; /* Darker shade */
                }
                
                .btn.secondary {
                    background-color: var(--accent);
                    color: white;
                }
                
                .btn.secondary:hover {
                    background-color: #6a6036; /* Darker shade */
                }
                
                .btn.outline {
                    border: 1px solid #ced4da; /* Lighter border */
                    background-color: white;
                    color: #555;
                }
                
                .btn.outline:hover {
                    border-color: var(--primary-dark);
                    color: var(--primary-dark);
                    background-color: #f8f9fa;
                }
                
                .social-connections-card {
                    background-color: #f8f9fa;
                    border-radius: 10px; /* Slightly larger border-radius */
                    padding: 2rem; /* Increased padding */
                    margin-top: 2rem; /* Increased margin */
                    transition: all 0.3s ease;
                    border: 1px solid #e9ecef;
                }
                
                .social-connections-card:hover {
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
                    transform: translateY(-4px);
                }
                
                .social-connections-title {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem; /* Increased gap */
                    color: var(--primary-dark);
                    font-weight: 700; /* Bolder font */
                    margin-bottom: 1.5rem; /* Increased margin */
                    font-size: 1.1rem;
                }
                .social-connections-title i {
                    color: var(--accent);
                }
                
                .social-accounts-list {
                    display: flex;
                    gap: 1.2rem; /* Increased gap */
                    margin-bottom: 1.5rem; /* Increased margin */
                }
                
                .social-account-icon {
                    width: 45px; /* Larger icon size */
                    height: 45px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.3rem; /* Larger font size */
                    color: white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                
                .social-account-icon.google { background-color: #DB4437; }
                .social-account-icon.facebook { background-color: #4267B2; }
                .social-account-icon.apple { background-color: #000; }
                .social-account-icon.microsoft { background-color: #00A4EF; }
                
                .no-social-accounts {
                    color: #6c757d; /* Darker gray */
                    font-style: italic;
                    margin-bottom: 1.5rem; /* Increased margin */
                    font-size: 0.95rem;
                }
                
                @media (max-width: 768px) {
                    .profile-container {
                        padding: 1.5rem;
                    }
                    
                    .profile-header {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .profile-avatar {
                        margin-right: 0;
                        margin-bottom: 1.5rem; /* Adjusted margin */
                    }
                    
                    .profile-actions {
                        flex-direction: column;
                    }
                    
                    .btn {
                        width: 100%;
                        justify-content: center;
                    }

                    .profile-section-title {
                        font-size: 1.15rem;
                    }

                    .social-accounts-list {
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    )
}
