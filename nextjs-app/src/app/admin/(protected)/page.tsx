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
    LinearProgress,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Inventory as ProductIcon,
    Category as VariationIcon,
    Anchor as PortIcon,
    CurrencyExchange as CurrencyIcon,
    TrendingUp as UpIcon,
    TrendingDown as DownIcon,
    Notifications as AnnouncementIcon,
    FlashOn as ActionIcon,
} from '@mui/icons-material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const goldColor = '#786D3C';
const navyColor = '#1B1464';

export default function AdminDashboard() {
    const theme = useTheme();

    const stats = [
        { label: 'Total Products', value: '124', change: '+12%', icon: <ProductIcon />, color: '#3b82f6' },
        { label: 'Variations', value: '45', change: '+5%', icon: <VariationIcon />, color: '#8b5cf6' },
        { label: 'Ports', value: '8', change: 'Stable', icon: <PortIcon />, color: '#10b981' },
        { label: 'Currencies', value: '12', change: '+2', icon: <CurrencyIcon />, color: goldColor },
    ];

    const chartData = {
        labels: ['01 Feb', '02 Feb', '03 Feb', '04 Feb', '05 Feb', '06 Feb', '07 Feb'],
        datasets: [
            {
                label: 'Market Volume',
                data: [450, 590, 800, 810, 560, 550, 940],
                fill: true,
                borderColor: navyColor,
                backgroundColor: alpha(navyColor, 0.1),
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: navyColor,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: navyColor,
                titleFont: { weight: 'bold' as const },
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            y: { grid: { display: false }, ticks: { font: { size: 10 } } },
            x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        },
    };

    const activities = [
        { title: 'New Product Added', time: '2 mins ago', desc: 'Sesame Grade A - Gadarif', icon: <ProductIcon />, type: 'success' },
        { title: 'Price Change', time: '15 mins ago', desc: 'Cotton Short Staple ↓ 2.4%', icon: <CurrencyIcon />, type: 'warning' },
        { title: 'Port Status Update', time: '1 hr ago', desc: 'Port Sudan: Operational', icon: <PortIcon />, type: 'info' },
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
                {/* Main Market Card */}
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: navyColor }}>Market Performance</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Daily transaction volume and price index</Typography>
                            </Box>
                            <Button size="small" variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                                Export CSV
                            </Button>
                        </Box>
                        <Box sx={{ height: 320 }}>
                            <Line data={chartData} options={chartOptions} />
                        </Box>
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
                                </Grid>
                            </Paper>
                        </Grid>

                        {/* Recent Activity */}
                        <Grid size={{ xs: 12 }}>
                            <Paper sx={{ p: 3, borderRadius: 6, border: '1px solid rgba(0,0,0,0.05)' }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Recent Logs</Typography>
                                <List sx={{ p: 0 }}>
                                    {activities.map((act, i) => (
                                        <ListItem key={i} sx={{ px: 0, py: 1.5 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: alpha(theme.palette.divider, 0.4), color: navyColor, width: 32, height: 32 }}>
                                                    {React.cloneElement(act.icon as any, { fontSize: 'small' })}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={act.title}
                                                secondary={act.desc}
                                                primaryTypographyProps={{ fontWeight: 700, fontSize: '0.85rem' }}
                                                secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                            />
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{act.time}</Typography>
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
