'use client'

import { useState, useEffect } from 'react'
import styles from '../market-data/market-data.module.css'

interface Variation {
    id: number
    name: string
    description: string | null
    isActive: boolean
}

export default function VariationsAdmin() {
    const [variations, setVariations] = useState<Variation[]>([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [editingVar, setEditingVar] = useState<Variation | null>(null)
    const [newVar, setNewVar] = useState({ name: '', description: '', isActive: true })

    useEffect(() => {
        fetchVariations()
    }, [])

    const fetchVariations = async () => {
        try {
            const res = await fetch('/api/admin/variations')
            if (res.ok) {
                const data = await res.json()
                setVariations(data)
            }
        } catch (error) {
            console.error('Failed to fetch variations', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        try {
            const method = editingVar ? 'PUT' : 'POST'
            const url = editingVar ? `/api/admin/variations/${editingVar.id}` : '/api/admin/variations'
            const body = editingVar ? editingVar : newVar

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (res.ok) {
                fetchVariations()
                setEditingVar(null)
                setNewVar({ name: '', description: '', isActive: true })
            } else {
                alert('Failed to save variation')
            }
        } catch (error) {
            console.error('Error saving variation:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this variation?')) return

        try {
            const res = await fetch(`/api/admin/variations/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchVariations()
            } else {
                alert('Failed to delete variation')
            }
        } catch (error) {
            console.error('Error deleting variation:', error)
        }
    }

    if (loading) return <div className={styles.loaderContainer}><div className={styles.loader}></div></div>

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Product Variations</h1>
                    <p className={styles.subtitle}>Manage quality grades and varieties (e.g., Grade 1, Organic)</p>
                </div>
            </header>

            <div className={styles.mainGrid} style={{ gridTemplateColumns: '1fr 350px', gap: '2rem', display: 'grid' }}>
                {/* List Section */}
                <div className={styles.dataTableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Variation Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {variations.map((v) => (
                                <tr key={v.id}>
                                    <td><strong>{v.name}</strong></td>
                                    <td>{v.description || 'N/A'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${v.isActive ? styles.statusActive : styles.statusInactive}`}>
                                            {v.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <button onClick={() => setEditingVar(v)} className={styles.editLink} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDelete(v.id)} className={styles.editLink} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', marginLeft: '10px' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Form Section */}
                <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)', fontSize: '1.25rem' }}>
                        {editingVar ? 'Edit Variation' : 'Add New Variation'}
                    </h2>
                    <form onSubmit={handleSave}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Variation Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Grade 1 / Organic"
                                value={editingVar ? editingVar.name : newVar.name}
                                onChange={(e) => editingVar ? setEditingVar({ ...editingVar, name: e.target.value }) : setNewVar({ ...newVar, name: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description (Optional)</label>
                            <textarea
                                value={editingVar ? (editingVar.description || '') : newVar.description}
                                onChange={(e) => editingVar ? setEditingVar({ ...editingVar, description: e.target.value }) : setNewVar({ ...newVar, description: e.target.value })}
                                style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '6px', minHeight: '80px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="varActive"
                                checked={editingVar ? editingVar.isActive : newVar.isActive}
                                onChange={(e) => editingVar ? setEditingVar({ ...editingVar, isActive: e.target.checked }) : setNewVar({ ...newVar, isActive: e.target.checked })}
                            />
                            <label htmlFor="varActive" style={{ fontWeight: 600 }}>Is Active</label>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="submit"
                                disabled={isSaving}
                                style={{ flex: 1, backgroundColor: 'var(--primary-dark)', color: 'white', padding: '0.75rem', borderRadius: '6px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                            >
                                {isSaving ? 'Saving...' : 'Save Variation'}
                            </button>
                            {editingVar && (
                                <button
                                    type="button"
                                    onClick={() => setEditingVar(null)}
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
