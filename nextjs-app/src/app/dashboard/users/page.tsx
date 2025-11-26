'use client'

import { useState, useEffect } from 'react'
import styles from './users.module.css'

const UsersPage = () => {
    const [users, setUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true)
            try {
                // MOCK DATA
                setUsers([
                    { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'admin', isActive: true, createdAt: new Date() },
                    { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com', role: 'editor', isActive: true, createdAt: new Date() },
                    { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com', role: 'user', isActive: false, createdAt: new Date() },
                ]);
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const getRoleClass = (role: string) => {
        const lowerRole = role.toLowerCase()
        if (lowerRole.includes('admin')) {
            return styles.roleAdmin
        }
        if (lowerRole.includes('editor')) {
            return styles.roleEditor
        }
        return styles.roleUser
    }

    const getStatusClass = (isActive: boolean) => {
        return isActive ? styles.statusActive : styles.statusInactive
    }

    return (
        <div className={styles.container}>
            <header className={styles.mainContentHeader}>
                <h1 className={styles.mainContentTitle}>User Management</h1>
                <p className={styles.mainContentSubtitle}>Manage all registered users on the platform.</p>
            </header>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>All Users</h2>
                </div>
                <div className={styles.cardContent}>
                    {isLoading ? (
                        <p className={styles.loadingMessage}>Loading Users...</p>
                    ) : users.length > 0 ? (
                        <table className={styles.usersTable}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
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
                                                <img className={styles.userCellAvatar} src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" />
                                                <div className={styles.userCellDetails}>
                                                    <div>{user.name}</div>
                                                    <div>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.roleBadge} ${getRoleClass(user.role || 'user')}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${getStatusClass(user.isActive)}`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className={styles.actionsButtons}>
                                                <button className={styles.actionButton}>Edit</button>
                                                <button className={styles.actionButton}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
