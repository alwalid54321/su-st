// Activity Feed component for Admin Dashboard
// Displays real-time user and admin activities

'use client'

import React, { useEffect, useState } from 'react'
import {
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    CircularProgress,
    alpha,
    useTheme,
    Box,
} from '@mui/material'
import {
    Login,
    Download,
    Api,
    Person,
    CardMembership,
    AdminPanelSettings,
    TrendingUp,
    CurrencyExchange,
    Settings,
    Visibility,
} from '@mui/icons-material'

interface Activity {
    id: string
    type: 'activity' | 'audit'
    title: string
    desc: string
    time: string
    icon: string
}

const iconMap: Record<string, React.ReactElement> = {
    Login: <Login fontSize="small" />,
    Download: <Download fontSize="small" />,
    Api: <Api fontSize="small" />,
    Person: <Person fontSize="small" />,
    CardMembership: <CardMembership fontSize="small" />,
    AdminPanelSettings: <AdminPanelSettings fontSize="small" />,
    TrendingUp: <TrendingUp fontSize="small" />,
    CurrencyExchange: <CurrencyExchange fontSize="small" />,
    Settings: <Settings fontSize="small" />,
    Visibility: <Visibility fontSize="small" />,
}

export default function ActivityFeed() {
    const theme = useTheme()
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchActivities()
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchActivities, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchActivities = async () => {
        try {
            const res = await fetch('/api/admin/dashboard-activity?limit=8')
            if (res.ok) {
                const data = await res.json()
                setActivities(data.activities)
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading && activities.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={32} />
            </Box>
        )
    }

    return (
        <List sx={{ p: 0, maxHeight: 600, overflowY: 'auto' }}>
            {activities.map((activity) => (
                <ListItem key={activity.id} sx={{ px: 0, py: 1.5 }}>
                    <ListItemAvatar>
                        <Avatar
                            sx={{
                                bgcolor: alpha(theme.palette.divider, 0.4),
                                color: activity.type === 'audit' ? '#1B1464' : '#786D3C',
                                width: 32,
                                height: 32,
                            }}
                        >
                            {iconMap[activity.icon] || <Settings fontSize="small" />}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={activity.title}
                        secondary={activity.desc}
                        primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', minWidth: 60, textAlign: 'right' }}>
                        {activity.time}
                    </Typography>
                </ListItem>
            ))}
            {activities.length === 0 && (
                <ListItem>
                    <ListItemText
                        primary="No recent activity"
                        primaryTypographyProps={{ color: 'text.secondary', textAlign: 'center' }}
                    />
                </ListItem>
            )}
        </List>
    )
}
