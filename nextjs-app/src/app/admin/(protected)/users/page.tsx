'use client'

import { useState, useEffect } from 'react'
import styles from './users.module.css'

interface User {
    id: number
    username: string
    email: string
    firstName: string | null
    lastName: string | null
    isStaff: boolean
    isActive: boolean
    isSuperuser: boolean
    plan: 'free' | 'plus'
    emailVerified: boolean
    dateJoined: string
    lastLogin: string
    profileImage: string | null
}

const UsersPage = () => {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/users')
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            } else {
                console.error('Failed to fetch users')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleTogglePlan = async (user: User) => {
        const newPlan = user.plan === 'plus' ? 'free' : 'plus'
        if (!confirm(`Are you sure you want to change ${user.username}'s plan to ${newPlan.toUpperCase()}?`)) return

        setActionLoading(user.id)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: newPlan })
            })

            if (res.ok) {
                // Optimistic update
                setUsers(users.map(u => u.id === user.id ? { ...u, plan: newPlan } : u))
            } else {
                alert('Failed to update plan')
            }
        } catch (error) {
            console.error('Error updating plan:', error)
            alert('Error updating plan')
        } finally {
            setActionLoading(null)
        }
    }

    const handleToggleStatus = async (user: User) => {
        const newStatus = !user.isActive
        const action = newStatus ? 'activate' : 'deactivate'
        if (!confirm(`Are you sure you want to ${action} ${user.username}?`)) return

        setActionLoading(user.id)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: newStatus })
            })

            if (res.ok) {
                setUsers(users.map(u => u.id === user.id ? { ...u, isActive: newStatus } : u))
            } else {
                const data = await res.json()
                alert(data.error || 'Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Error updating status')
        } finally {
            setActionLoading(null)
        }
    }

    const getRoleClass = (user: User) => {
        if (user.isSuperuser) return styles.roleAdmin
        if (user.isStaff) return styles.roleEditor
        return styles.roleUser
    }

    const getStatusClass = (isActive: boolean) => {
        return isActive ? styles.statusActive : styles.statusInactive
    }

    return (
        <div className={styles.container}>
            <header className={styles.mainContentHeader}>
                <h1 className={styles.mainContentTitle}>User Management</h1>
                <p className={styles.mainContentSubtitle}>Manage registered users and subscription plans.</p>
            </header>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>All Users</h2>
                    <button className={styles.refreshButton} onClick={fetchUsers} disabled={isLoading}>
                        <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i> Refresh
                    </button>
                </div>
                <div className={styles.cardContent}>
                    {isLoading ? (
                        <p className={styles.loadingMessage}>Loading Users...</p>
                    ) : users.length > 0 ? (
                        <div className={styles.tableWrapper}>
                            <table className={styles.usersTable}>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Role</th>
                                        <th>Plan</th>
                                        <th>Status</th>
                                        <th>Join Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <img
                                                        className={styles.userCellAvatar}
                                                        src={user.profileImage || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                                                        alt=""
                                                    />
                                                    <div className={styles.userCellDetails}>
                                                        <div className={styles.userName}>{user.username}</div>
                                                        <div className={styles.userEmail}>{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.roleBadge} ${getRoleClass(user)}`}>
                                                    {user.isSuperuser ? 'Superuser' : user.isStaff ? 'Staff' : 'User'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`plan-badge ${user.plan === 'plus' ? 'plan-plus' : 'plan-free'}`}>
                                                    {user.plan === 'plus' && <i className="fas fa-gem" style={{ marginRight: '4px', fontSize: '0.8em' }}></i>}
                                                    {user.plan.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${getStatusClass(user.isActive)}`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>{new Date(user.dateJoined).toLocaleDateString()}</td>
                                            <td>
                                                <div className={styles.actionsButtons}>
                                                    <button
                                                        className={`${styles.actionButton} ${user.plan === 'plus' ? styles.btnDowngrade : styles.btnUpgrade}`}
                                                        onClick={() => handleTogglePlan(user)}
                                                        disabled={actionLoading === user.id}
                                                        title={user.plan === 'plus' ? 'Downgrade to Free' : 'Upgrade to Plus'}
                                                    >
                                                        {user.plan === 'plus' ? 'Downgrade' : 'Upgrade'}
                                                    </button>
                                                    {!user.isSuperuser && (
                                                        <button
                                                            className={`${styles.actionButton} ${user.isActive ? styles.btnDeactivate : styles.btnActivate}`}
                                                            onClick={() => handleToggleStatus(user)}
                                                            disabled={actionLoading === user.id}
                                                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                                        >
                                                            {user.isActive ? 'Ban' : 'Unban'}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.noUsers}>
                            <p>No users found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UsersPage
