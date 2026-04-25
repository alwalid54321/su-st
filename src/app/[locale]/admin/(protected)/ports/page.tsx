'use client'

import { useState, useEffect } from 'react'
import styles from '../market-data/market-data.module.css'

interface Port {
    id: number
    name: string
    location: string | null
    isActive: boolean
}

export default function PortsAdmin() {
    const [ports, setPorts] = useState<Port[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [editingPort, setEditingPort] = useState<Port | null>(null)
    const [newPort, setNewPort] = useState({ name: '', location: '', isActive: true })

    useEffect(() => {
        fetchPorts()
    }, [])

    const fetchPorts = async () => {
        try {
            const res = await fetch('/api/admin/ports')
            if (res.ok) {
                const data = await res.json()
                setPorts(data)
            }
        } catch (error) {
            console.error('Failed to fetch ports', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const method = editingPort ? 'PUT' : 'POST'
            const url = editingPort ? `/api/admin/ports/${editingPort.id}` : '/api/admin/ports'
            const body = editingPort ? editingPort : newPort

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                fetchPorts()
                setEditingPort(null)
                setNewPort({ name: '', location: '', isActive: true })
            } else {
                alert('Failed to save port')
            }
        } catch (error) {
            console.error('Error saving port:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this port?')) return

        try {
            const res = await fetch(`/api/admin/ports/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchPorts()
            } else {
                alert('Failed to delete port')
            }
        } catch (error) {
            console.error('Error deleting port:', error)
        }
    }

    if (loading) return <div className={styles.loaderContainer}><div className={styles.loader}></div></div>

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Shipping Ports</h1>
                    <p className={styles.subtitle}>Manage available ports for quotes and samples</p>
                </div>
            </header>

            <div className={styles.mainGrid} style={{ gridTemplateColumns: '1fr 350px', gap: '2rem', display: 'grid' }}>
                {/* List Section */}
                <div className={styles.dataTableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ports.map((port) => (
                                <tr key={port.id}>
                                    <td><strong>{port.name}</strong></td>
                                    <td>{port.location || 'N/A'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${port.isActive ? styles.statusActive : styles.statusInactive}`}>
                                            {port.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <button onClick={() => setEditingPort(port)} className={styles.editLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDelete(port.id)} className={styles.editLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', marginLeft: '10px' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Form Section */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)', fontSize: '1.25rem' }}>
                        {editingPort ? 'Edit Port' : 'Add New Port'}
                    </h2>
                    <form onSubmit={handleSave}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Port Name</label>
                            <input
                                type="text"
                                value={editingPort ? editingPort.name : newPort.name}
                                onChange={(e) => editingPort ? setEditingPort({ ...editingPort, name: e.target.value }) : setNewPort({ ...newPort, name: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Location (Optional)</label>
                            <input
                                type="text"
                                value={editingPort ? (editingPort.location || '') : newPort.location}
                                onChange={(e) => editingPort ? setEditingPort({ ...editingPort, location: e.target.value }) : setNewPort({ ...newPort, location: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="portActive"
                                checked={editingPort ? editingPort.isActive : newPort.isActive}
                                onChange={(e) => editingPort ? setEditingPort({ ...editingPort, isActive: e.target.checked }) : setNewPort({ ...newPort, isActive: e.target.checked })}
                            />
                            <label htmlFor="portActive" style={{ fontWeight: 600 }}>Is Active</label>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                disabled={isSaving}
                                style={{ flex: 1, backgroundColor: 'var(--primary-dark)', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                            >
                                {isSaving ? 'Saving...' : 'Save Port'}
                            </button>
                            {editingPort && (
                                <button
                                    type="button"
                                    onClick={() => setEditingPort(null)}
                                    style={{ backgroundColor: '#e5e7eb', color: '#4b5563', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <style jsx global>{`
                :root {
                    --primary-dark: #1B1464;
                    --accent: #786D3C;
                }
            `}</style>
        </div>
    )
}
