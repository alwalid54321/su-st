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
} from '@mui/material';
import {
    Inventory as ProductIcon,
    Category as VariationIcon,
    Anchor as PortIcon,
    CurrencyExchange as CurrencyIcon,
    Notifications as AnnouncementIcon,
    FlashOn as ActionIcon,
} from '@mui/icons-material';
import ActivityFeed from '@/components/admin/ActivityFeed';

const goldColor = '#786D3C';
const navyColor = '#1B1464';

export default function AdminDashboard() {
    const theme = useTheme();
    const [loading, setLoading] = React.useState(true);
    const [statsData, setStatsData] = React.useState({
        totalProducts: 0,
        totalVariations: 0,
        totalPorts: 0,
        totalCurrencies: 0,
    });

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const statsRes = await fetch('/api/admin/dashboard-stats');
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStatsData(data.stats);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { label: 'Total Products', value: statsData.totalProducts.toString(), change: '+0%', icon: <ProductIcon />, color: '#3b82f6' },
        { label: 'Variations', value: statsData.totalVariations.toString(), change: '+0%', icon: <VariationIcon />, color: '#8b5cf6' },
        { label: 'Ports', value: statsData.totalPorts.toString(), change: 'Stable', icon: <PortIcon />, color: '#10b981' },
        { label: 'Currencies', value: statsData.totalCurrencies.toString(), change: '+0%', icon: <CurrencyIcon />, color: goldColor },
    ];



    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: navyColor, letterSpacing: -1 }}>
                    SudaStock Command Center
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Real-time oversight of Sudanese commodities and market fluctuations
                </Typography>
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

            <Grid container spacing={3}>
                {/* Live Activity Feed */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 6,
                            boxShadow: '0 4px 30px rgba(0,0,0,0.04)',
                            height: '100%',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                            border: '1px solid rgba(0,0,0,0.03)'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: navyColor }}>Live Activity Feed</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Real-time user actions and admin operations</Typography>
                            </Box>
                        </Box>
                        <ActivityFeed />
                    </Paper>
                </Grid>

                {/* Right Panel: Activity & Actions */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Grid container spacing={3}>
                        {/* Quick Actions */}
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, borderRadius: 6, bgcolor: navyColor, color: '#fff', position: 'relative', overflow: 'hidden' }}>
                                <ActionIcon sx={{ position: 'absolute', right: -20, top: -20, fontSize: 120, opacity: 0.1, transform: 'rotate(20deg)' }} />
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Quick Actions</Typography>
                                <Grid container spacing={1}>
                                    <Grid size={{ xs: 6 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            href="/admin/market-data"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                textTransform: 'none',
                                                fontSize: '0.75rem',
                                                '&:hover': { bgcolor: goldColor }
                                            }}
                                        >
                                            Add Product
                                        </Button>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            href="/admin/currencies"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                textTransform: 'none',
                                                fontSize: '0.75rem',
                                                '&:hover': { bgcolor: goldColor }
                                            }}
                                        >
                                            Update Rates
                                        </Button>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            href="/admin/variations"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                textTransform: 'none',
                                                fontSize: '0.75rem',
                                                '&:hover': { bgcolor: goldColor }
                                            }}
                                        >
                                            Variations
                                        </Button>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            href="/admin/ports"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.1)',
                                                textTransform: 'none',
                                                fontSize: '0.75rem',
                                                '&:hover': { bgcolor: goldColor }
                                            }}
                                        >
                                            Ports
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Quick Stats */}
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, borderRadius: 6, border: '1px solid rgba(0,0,0,0.05)' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>System Overview</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    • Total Products: {statsData.totalProducts}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    • Variations: {statsData.totalVariations}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                    • Active Ports: {statsData.totalPorts}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    • Currencies: {statsData.totalCurrencies}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
