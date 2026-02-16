'use client'

import React, { useState, useEffect } from 'react'
import {
    Box,
    Paper,
    Typography,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    IconButton,
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    alpha,
    Alert,
    CircularProgress,
    InputAdornment,
} from '@mui/material'
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    AdminPanelSettings as AdminIcon,
    Security as SecurityIcon,
    Person as PersonIcon,
    Block as BlockIcon,
    CheckCircle as CheckCircleIcon,
    History as HistoryIcon,
    MoreVert as MoreVertIcon,
    Star as StarIcon,
} from '@mui/icons-material'
import UserActivityTimeline from '@/components/admin/UserActivityTimeline'

// Helper for crown icon since it's not standard MUI
const SuperUserIcon = (props: any) => <StarIcon {...props} sx={{ color: '#FFD700', ...props.sx }} />

interface User {
    id: number
    username: string
    email: string
    isStaff: boolean
    isActive: boolean
    isSuperuser: boolean
    plan: 'free' | 'plus' | 'premium'
    dateJoined: string
    lastLogin: string
    profileImage: string | null
}

export default function UsersPage() {
    const theme = useTheme()
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<number | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState({
        role: 'all',
        plan: 'all',
        status: 'all',
    })

    // Activity Dialog State
    const [activityUser, setActivityUser] = useState<User | null>(null)
    const [openActivity, setOpenActivity] = useState(false)

    useEffect(() => {
        fetchUsers()
    }, [])

    useEffect(() => {
        filterUsers()
    }, [users, searchQuery, filters])

    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/admin/users')
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const filterUsers = () => {
        let result = [...users]

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(user =>
                user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            )
        }

        // Filters
        if (filters.role !== 'all') {
            if (filters.role === 'superuser') result = result.filter(u => u.isSuperuser)
            else if (filters.role === 'staff') result = result.filter(u => u.isStaff && !u.isSuperuser)
            else if (filters.role === 'user') result = result.filter(u => !u.isStaff && !u.isSuperuser)
        }

        if (filters.plan !== 'all') {
            result = result.filter(u => u.plan === filters.plan)
        }

        if (filters.status !== 'all') {
            const isActive = filters.status === 'active'
            result = result.filter(u => u.isActive === isActive)
        }

        setFilteredUsers(result)
    }

    const handleUpdateUser = async (user: User, updates: Partial<User>) => {
        if (actionLoading) return
        setActionLoading(user.id)
        try {
            const res = await fetch(`/api/admin/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            })
            if (res.ok) {
                setUsers(users.map(u => u.id === user.id ? { ...u, ...updates } : u))
            }
        } catch (error) {
            console.error('Update failed:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const confirmAction = (message: string, action: () => void) => {
        if (confirm(message)) action()
    }

    return (
        <Box>
            {/* Header & Controls */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1B1464', mb: 1 }}>
                    User Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Manage {users.length} registered users
                </Typography>

                <Paper sx={{ p: 2, borderRadius: 4 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                size="small"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Role</InputLabel>
                                <Select
                                    value={filters.role}
                                    label="Role"
                                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                                >
                                    <MenuItem value="all">All Roles</MenuItem>
                                    <MenuItem value="superuser">Superuser</MenuItem>
                                    <MenuItem value="staff">Staff</MenuItem>
                                    <MenuItem value="user">User</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Plan</InputLabel>
                                <Select
                                    value={filters.plan}
                                    label="Plan"
                                    onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
                                >
                                    <MenuItem value="all">All Plans</MenuItem>
                                    <MenuItem value="free">Free</MenuItem>
                                    <MenuItem value="plus">Plus</MenuItem>
                                    <MenuItem value="premium">Premium</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    label="Status"
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                >
                                    <MenuItem value="all">All Status</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Banned</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, md: 2 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={fetchUsers}
                            >
                                Refresh
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            {/* Users Grid */}
            <Grid container spacing={2}>
                {isLoading ? (
                    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={user.id}>
                            <Card sx={{
                                borderRadius: 4,
                                position: 'relative',
                                transition: 'transform 0.2s',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                            }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                                        <Avatar
                                            src={user.profileImage || undefined}
                                            sx={{ width: 56, height: 56, mr: 2, bgcolor: user.isSuperuser ? '#1B1464' : undefined }}
                                        >
                                            {user.username.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, display: 'flex', alignItems: 'center' }}>
                                                {user.username}
                                                {user.isSuperuser && <SuperUserIcon sx={{ ml: 1, fontSize: 18 }} />}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                {user.email}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip
                                                    label={user.plan.toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                        bgcolor: user.plan === 'premium' ? alpha('#786D3C', 0.1) : undefined,
                                                        color: user.plan === 'premium' ? '#786D3C' : undefined
                                                    }}
                                                />
                                                {user.isStaff && (
                                                    <Chip
                                                        label="STAFF"
                                                        size="small"
                                                        color="info"
                                                        variant="outlined"
                                                        sx={{ height: 20, fontSize: '0.65rem' }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Grid container spacing={1} sx={{ mt: 2 }}>
                                        <Grid size={{ xs: 6 }}>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={user.plan}
                                                    onChange={(e) => confirmAction(
                                                        `Change plan to ${e.target.value}?`,
                                                        () => handleUpdateUser(user, { plan: e.target.value as any })
                                                    )}
                                                    disabled={actionLoading === user.id}
                                                    sx={{ fontSize: '0.8rem', height: 32 }}
                                                >
                                                    <MenuItem value="free">Free</MenuItem>
                                                    <MenuItem value="plus">Plus</MenuItem>
                                                    <MenuItem value="premium">Premium</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid size={{ xs: 6 }}>
                                            {user.isActive ? (
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<BlockIcon />}
                                                    onClick={() => confirmAction('Ban user?', () => handleUpdateUser(user, { isActive: false }))}
                                                    disabled={actionLoading === user.id}
                                                    sx={{ height: 32 }}
                                                >
                                                    Ban
                                                </Button>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    startIcon={<CheckCircleIcon />}
                                                    onClick={() => confirmAction('Activate user?', () => handleUpdateUser(user, { isActive: true }))}
                                                    disabled={actionLoading === user.id}
                                                    sx={{ height: 32 }}
                                                >
                                                    Activate
                                                </Button>
                                            )}
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid', borderColor: 'divider', pt: 1 }}>
                                        <Button
                                            size="small"
                                            startIcon={<HistoryIcon />}
                                            onClick={() => {
                                                setActivityUser(user)
                                                setOpenActivity(true)
                                            }}
                                            sx={{ textTransform: 'none', color: 'text.secondary' }}
                                        >
                                            View Logs
                                        </Button>

                                        {!user.isSuperuser && (
                                            <Button
                                                size="small"
                                                startIcon={user.isStaff ? <PersonIcon /> : <SecurityIcon />}
                                                color={user.isStaff ? "warning" : "primary"}
                                                onClick={() => confirmAction(
                                                    user.isStaff ? 'Remove Staff access?' : 'Grant Staff access?',
                                                    () => handleUpdateUser(user, { isStaff: !user.isStaff })
                                                )}
                                                disabled={actionLoading === user.id}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                {user.isStaff ? 'Revoke Staff' : 'Make Staff'}
                                            </Button>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Box sx={{ width: '100%', p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No users found matching your filters.</Typography>
                    </Box>
                )}
            </Grid>

            {/* Activity Dialog */}
            <Dialog
                open={openActivity}
                onClose={() => setOpenActivity(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                    Activity Logs: {activityUser?.username}
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                    {activityUser && <UserActivityTimeline userId={activityUser.id} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenActivity(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
