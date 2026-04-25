'use client';

import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Switch,
    FormControlLabel,
    Divider,
    Button,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
    Snackbar,
    Avatar,
    useTheme,
    alpha,
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Email as EmailIcon,
    Palette as PaletteIcon,
    Translate as LanguageIcon,
    Security as SecurityIcon,
    Save as SaveIcon,
    ChevronLeft as BackIcon,
} from '@mui/icons-material';
import Link from 'next/link';

const navyColor = '#1B1464';
const goldColor = '#786D3C';

export default function SettingsPage() {
    const theme = useTheme();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        darkMode: false,
        language: 'en',
        auditLogs: true,
        systemAlerts: true,
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const handleChange = (name: string, value: any) => {
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
    };

    const sectionHeader = (icon: React.ReactNode, title: string) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Avatar sx={{ bgcolor: alpha(navyColor, 0.08), color: navyColor, width: 40, height: 40 }}>
                {icon}
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, color: navyColor }}>
                {title}
            </Typography>
        </Box>
    );

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: navyColor, mb: 0.5 }}>
                        System Settings
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Configure the SudaStock Command Center environment
                    </Typography>
                </Box>
                <Button
                    component={Link}
                    href="/admin"
                    variant="outlined"
                    startIcon={<BackIcon />}
                    sx={{ borderRadius: 2, borderColor: alpha(navyColor, 0.2), color: navyColor, textTransform: 'none' }}
                >
                    Back to Dashboard
                </Button>
            </Box>

            <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 6, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 30px rgba(0,0,0,0.04)' }}>
                {/* Notifications Section */}
                {sectionHeader(<EmailIcon />, 'Notification Preferences')}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                            control={<Switch checked={settings.emailNotifications} onChange={(e) => handleChange('emailNotifications', e.target.checked)} color="primary" />}
                            label={
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 700 }}>Email Reports</Typography>
                                    <Typography variant="caption" color="text.secondary">Receive daily market summary and major price alerts</Typography>
                                </Box>
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                            control={<Switch checked={settings.systemAlerts} onChange={(e) => handleChange('systemAlerts', e.target.checked)} color="primary" />}
                            label={
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 700 }}>System Integrity Alerts</Typography>
                                    <Typography variant="caption" color="text.secondary">Immediate notification of sync failures or connectivity issues</Typography>
                                </Box>
                            }
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 5, opacity: 0.5 }} />

                {/* Display Section */}
                {sectionHeader(<PaletteIcon />, 'Display & Localization')}
                <Grid container spacing={4} sx={{ mb: 5 }}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Interface Language</InputLabel>
                            <Select
                                value={settings.language}
                                onChange={(e) => handleChange('language', e.target.value)}
                                label="Interface Language"
                                sx={{ borderRadius: 3 }}
                            >
                                <MenuItem value="en">English (Global)</MenuItem>
                                <MenuItem value="ar">Arabic (Local)</MenuItem>
                                <MenuItem value="fr">French</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControlLabel
                            control={<Switch checked={settings.darkMode} onChange={(e) => handleChange('darkMode', e.target.checked)} color="primary" />}
                            label={
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 700 }}>Dark Interface</Typography>
                                    <Typography variant="caption" color="text.secondary">Optimize for low-light environments</Typography>
                                </Box>
                            }
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ mb: 5, opacity: 0.5 }} />

                {/* Security Section */}
                {sectionHeader(<SecurityIcon />, 'Security & Auditing')}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid size={{ xs: 12 }}>
                        <FormControlLabel
                            control={<Switch checked={settings.auditLogs} onChange={(e) => handleChange('auditLogs', e.target.checked)} color="primary" />}
                            label={
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 700 }}>Extended Audit Logging</Typography>
                                    <Typography variant="caption" color="text.secondary">Track and store all minor admin interactions for 90 days</Typography>
                                </Box>
                            }
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Button
                            variant="outlined"
                            color="error"
                            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                            onClick={() => window.open('/admin/audit-logs', '_self')}
                        >
                            View Comprehensive Access Logs
                        </Button>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        sx={{
                            borderRadius: 3,
                            bgcolor: navyColor,
                            px: 4,
                            py: 1.2,
                            textTransform: 'none',
                            fontWeight: 800,
                            '&:hover': { bgcolor: alpha(navyColor, 0.9) }
                        }}
                    >
                        Save Environment Settings
                    </Button>
                </Box>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 3, fontWeight: 700 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
