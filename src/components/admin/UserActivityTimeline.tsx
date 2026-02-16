// User Activity Timeline Component
// Visual timeline of user actions

'use client'

import React, { useEffect, useState } from 'react'
import {
    Box,
    Typography,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    Divider,
    Chip,
    useTheme,
    alpha,
} from '@mui/material'
import {
    Login,
    Download,
    Api,
    Visibility,
    Edit,
    Delete,
    Add,
    Settings,
    Circle,
} from '@mui/icons-material'

interface UserActivity {
    id: number
    userId: number
    page: string
    event: string
    metadata: string | null
    ipAddress: string | null
    createdAt: string
}

interface Props {
    userId: number
    limit?: number
}

// Helper to replace date-fns
function formatDistanceToNow(dateInput: string | Date, options?: { addSuffix?: boolean }): string {
    const date = new Date(dateInput)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    let text = ''
    if (seconds < 60) text = 'less than a minute'
    else if (minutes < 60) text = `${minutes} minute${minutes > 1 ? 's' : ''}`
    else if (hours < 24) text = `${hours} hour${hours > 1 ? 's' : ''}`
    else text = `${days} day${days > 1 ? 's' : ''}`

    return options?.addSuffix ? `${text} ago` : text
}

export default function UserActivityTimeline({ userId, limit = 50 }: Props) {
    const theme = useTheme()
    const [activities, setActivities] = useState<UserActivity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchActivity()
    }, [userId])

    const fetchActivity = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/user-activity/${userId}?limit=${limit}`)
            if (res.ok) {
                const data = await res.json()
                setActivities(data.activities)
            } else {
                setError('Failed to load activity')
            }
        } catch (err) {
            setError('Error loading activity')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const getIcon = (event: string) => {
        switch (event) {
            case 'LOGIN': return <Login color="primary" />
            case 'EXPORT': return <Download color="secondary" />
            case 'API_CALL': return <Api color="action" />
            case 'VIEW': return <Visibility color="info" />
            case 'UPDATE': return <Edit color="warning" />
            case 'DELETE': return <Delete color="error" />
            case 'CREATE': return <Add color="success" />
            default: return <Circle sx={{ fontSize: 12, color: theme.palette.divider }} />
        }
    }

    const formatEvent = (event: string) => {
        return event.replace(/_/g, ' ')
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} />
            </Box>
        )
    }

    if (error) {
        return (
            <Typography color="error" align="center" sx={{ py: 2 }}>
                {error}
            </Typography>
        )
    }

    if (activities.length === 0) {
        return (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                No activity recorded for this user.
            </Typography>
        )
    }

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
            {activities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                            {getIcon(activity.event)}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                                        {formatEvent(activity.event)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                    </Typography>
                                </Box>
                            }
                            secondary={
                                <Box sx={{ mt: 0.5 }}>
                                    <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                                        {activity.page}
                                    </Typography>
                                    {activity.metadata && (
                                        <Typography variant="caption" display="block" color="text.secondary" sx={{
                                            bgcolor: alpha(theme.palette.action.hover, 0.05),
                                            p: 0.5,
                                            borderRadius: 1,
                                            fontFamily: 'monospace'
                                        }}>
                                            {activity.metadata}
                                        </Typography>
                                    )}
                                    {activity.ipAddress && (
                                        <Chip
                                            label={activity.ipAddress}
                                            size="small"
                                            variant="outlined"
                                            sx={{ mt: 1, height: 20, fontSize: '0.65rem' }}
                                        />
                                    )}
                                </Box>
                            }
                        />
                    </ListItem>
                    {index < activities.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
            ))}
        </List>
    )
}
