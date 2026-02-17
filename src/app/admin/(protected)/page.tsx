'use client';

import React from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    Avatar,
    Button,
    Chip,
    useTheme,
    alpha,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Inventory as ProductIcon,
    Category as VariationIcon,
    Anchor as PortIcon,
    CurrencyExchange as CurrencyIcon,
    Notifications as AnnouncementIcon,
    FlashOn as ActionIcon,
    Refresh as RefreshIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import ActivityFeed from '@/components/admin/ActivityFeed';

const goldColor = '#786D3C';
const navyColor = '#1B1464';

export default function AdminDashboard() {
    const theme = useTheme();
    const [loading, setLoading] = React.useState(true);
    const [dashboardData, setDashboardData] = React.useState<any>({
        stats: { totalProducts: 0, totalVariations: 0, totalPorts: 0, totalCurrencies: 0 },
        latestUsers: [],
        latestAnnouncements: []
    });

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/api/admin/dashboard-stats');
                if (res.ok) {
                    const data = await res.json();
                    setDashboardData(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <RefreshIcon sx={{
                    fontSize: 40,
                    color: navyColor,
                    animation: 'spin 1.5s linear infinite',
                    '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                    }
                }} />
            </Box>
        );
    }

    const stats = [
        { label: 'Total Products', value: dashboardData.stats.totalProducts.toString(), change: '+0%', icon: <ProductIcon />, color: '#3b82f6' },
        { label: 'Variations', value: dashboardData.stats.totalVariations.toString(), change: '+0%', icon: <VariationIcon />, color: '#8b5cf6' },
        { label: 'Ports', value: dashboardData.stats.totalPorts.toString(), change: 'Stable', icon: <PortIcon />, color: '#10b981' },
        { label: 'Currencies', value: dashboardData.stats.totalCurrencies.toString(), change: '+0%', icon: <CurrencyIcon />, color: goldColor },
    ];

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: navyColor, letterSpacing: -1 }}>
                        SudaStock Command Center
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Real-time oversight of Sudanese commodities and market fluctuations
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => window.location.reload()}
                    sx={{ borderRadius: 2, borderColor: alpha(navyColor, 0.2), color: navyColor }}
                >
                    Refresh
                </Button>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {stats.map((stat) => (
                    <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card
                            sx={{
                                borderRadius: 4,
                                border: '1px solid rgba(0,0,0,0.05)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                                transition: 'all 0.3s ease',
                                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: alpha(stat.color, 0.1), color: stat.color, borderRadius: 2 }}>
                                        {stat.icon}
                                    </Avatar>
                                    <Chip
                                        label={stat.change}
                                        size="small"
                                        sx={{
                                            bgcolor: stat.change.includes('+') ? alpha('#10b981', 0.1) : alpha('#64748b', 0.1),
                                            color: stat.change.includes('+') ? '#10b981' : '#64748b',
                                            fontWeight: 700,
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{stat.value}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {stat.label}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Main Snapshot Section */}
            <Grid container spacing={3}>
                {/* Snapshot: Latest Users & Announcements */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Grid container spacing={3}>
                        {/* Latest Registrations */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid rgba(0,0,0,0.05)', height: '100%' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: navyColor, mb: 2 }}>New Members</Typography>
                                <List sx={{ p: 0 }}>
                                    {dashboardData.latestUsers.map((user: any) => (
                                        <ListItem key={user.id} sx={{ px: 0, py: 1 }}>
                                            <Avatar sx={{ width: 32, height: 32, mr: 1.5, fontSize: '0.8rem', bgcolor: goldColor }}>{user.username?.[0]}</Avatar>
                                            <ListItemText
                                                primary={user.username}
                                                secondary={user.email}
                                                primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}
                                                secondaryTypographyProps={{ fontSize: '0.7rem' }}
                                            />
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{user.dateJoined}</Typography>
                                        </ListItem>
                                    ))}
                                    {dashboardData.latestUsers.length === 0 && <Typography variant="body2" color="text.secondary">No new users</Typography>}
                                </List>
                                <Button href="/admin/users" sx={{ mt: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}>Full Directory</Button>
                            </Paper>
                        </Grid>

                        {/* Recent News */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid rgba(0,0,0,0.05)', height: '100%' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: navyColor, mb: 2 }}>Recent News</Typography>
                                <List sx={{ p: 0 }}>
                                    {dashboardData.latestAnnouncements.map((ann: any) => (
                                        <ListItem key={ann.id} sx={{ px: 0, py: 1 }}>
                                            <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: alpha(navyColor, 0.05), color: navyColor }}>
                                                <AnnouncementIcon sx={{ fontSize: 18 }} />
                                            </Avatar>
                                            <ListItemText
                                                primary={ann.title}
                                                secondary={ann.category.toUpperCase()}
                                                primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem', noWrap: true }}
                                                secondaryTypographyProps={{ fontSize: '0.7rem', color: goldColor, fontWeight: 800 }}
                                            />
                                            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>{ann.createdAt}</Typography>
                                        </ListItem>
                                    ))}
                                    {dashboardData.latestAnnouncements.length === 0 && <Typography variant="body2" color="text.secondary">No recent news</Typography>}
                                </List>
                                <Button href="/admin/announcements" sx={{ mt: 1, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}>Manage All</Button>
                            </Paper>
                        </Grid>

                        {/* Live Activity Feed - Condensed */}
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid rgba(0,0,0,0.05)' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: navyColor }}>Live Activity Feed</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Real-time audit trailing and user events</Typography>
                                    </Box>
                                </Box>
                                <ActivityFeed />
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Right Column: Actions & Quick Insight */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, borderRadius: 5, bgcolor: navyColor, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                                <ActionIcon sx={{ position: 'absolute', right: -20, top: -20, fontSize: 120, opacity: 0.1, transform: 'rotate(20deg)' }} />
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5 }}>Command Shortcuts</Typography>
                                <Grid container spacing={1.5}>
                                    {[
                                        { label: 'New Product', link: '/admin/market-data', icon: <ProductIcon fontSize="small" /> },
                                        { label: 'Add User', link: '/admin/users', icon: <PersonIcon fontSize="small" /> },
                                        { label: 'Sync Rates', link: '/admin/currencies', icon: <CurrencyIcon fontSize="small" /> },
                                        { label: 'Post Update', link: '/admin/announcements', icon: <AnnouncementIcon fontSize="small" /> },
                                    ].map((action) => (
                                        <Grid key={action.label} size={{ xs: 6 }}>
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                href={action.link}
                                                startIcon={action.icon}
                                                sx={{
                                                    bgcolor: 'rgba(255,255,255,0.08)',
                                                    justifyContent: 'flex-start',
                                                    textTransform: 'none',
                                                    fontSize: '0.7rem',
                                                    py: 1,
                                                    borderRadius: 2,
                                                    '&:hover': { bgcolor: goldColor }
                                                }}
                                            >
                                                {action.label}
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid rgba(0,0,0,0.05)' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: navyColor }}>Market Pulse</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <span>Active Commodities</span>
                                    <span style={{ fontWeight: 800, color: navyColor }}>{dashboardData.stats.totalProducts}</span>
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <span>Sync Schedule</span>
                                    <span style={{ fontWeight: 800, color: '#10b981' }}>Every 15m</span>
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                    <span>Uptime</span>
                                    <span style={{ fontWeight: 800, color: navyColor }}>99.9%</span>
                                </Typography>
                                <Divider sx={{ my: 2, opacity: 0.5 }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                    Last synchronized: {new Date().toLocaleTimeString()}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
