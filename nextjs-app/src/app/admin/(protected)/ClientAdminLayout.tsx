'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Button,
    Tooltip,
    useMediaQuery,
    useTheme,
    Fade,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    ShowChart as MarketIcon,
    AttachMoney as CurrencyIcon,
    Collections as GalleryIcon,
    Campaign as AnnouncementIcon,
    ExitToApp as LogoutIcon,
    OpenInNew as ExternalIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import AdminSecurityGuard from '@/components/AdminSecurityGuard';

const DRAWER_WIDTH = 260;
const goldColor = '#786D3C';
const navyColor = '#1B1464';

export function ClientAdminLayout({ children }: { children: React.ReactNode }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [open, setOpen] = useState(!isMobile);
    const pathname = usePathname();
    const { data: session } = useSession();
    const router = useRouter();

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push('/admin/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
        { name: 'Market Data', path: '/admin/market-data', icon: <MarketIcon /> },
        { name: 'Currencies', path: '/admin/currencies', icon: <CurrencyIcon /> },
        { name: 'Gallery', path: '/admin/gallery', icon: <GalleryIcon /> },
        { name: 'Announcements', path: '/admin/announcements', icon: <AnnouncementIcon /> },
    ];

    const isActive = (path: string) => {
        if (path === '/admin') return pathname === '/admin';
        return pathname.startsWith(path);
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: navyColor, color: '#fff' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <DashboardIcon sx={{ color: goldColor }} />
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.5 }}>
                        SudaStock
                    </Typography>
                    <Typography variant="caption" sx={{ color: goldColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Admin Portal
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <List sx={{ px: 2, py: 3, flex: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            component={Link}
                            href={item.path}
                            selected={isActive(item.path)}
                            sx={{
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    color: goldColor,
                                    '& .MuiListItemIcon-root': { color: goldColor },
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                },
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    transform: 'translateX(4px)'
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: 'rgba(255,255,255,0.5)' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.name}
                                primaryTypographyProps={{ fontWeight: isActive(item.path) ? 700 : 500, fontSize: '0.9rem' }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    component={Link}
                    href="/"
                    variant="outlined"
                    startIcon={<ExternalIcon />}
                    sx={{
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.7)',
                        textTransform: 'none',
                        borderRadius: 2,
                        '&:hover': {
                            borderColor: goldColor,
                            color: goldColor,
                            bgcolor: 'rgba(255,255,255,0.05)'
                        }
                    }}
                >
                    Live Site
                </Button>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, px: 1 }}>
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: goldColor,
                            color: navyColor,
                            fontWeight: 700,
                            fontSize: '0.9rem'
                        }}
                    >
                        {session?.user?.name?.[0] || 'A'}
                    </Avatar>
                    <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {session?.user?.name || 'Admin'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block' }}>
                            {session?.user?.email}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    fullWidth
                    startIcon={<LogoutIcon />}
                    onClick={handleSignOut}
                    sx={{
                        color: 'rgba(255,255,255,0.5)',
                        textTransform: 'none',
                        justifyContent: 'flex-start',
                        px: 1.5,
                        '&:hover': {
                            color: '#ff4d4d',
                            bgcolor: 'transparent'
                        }
                    }}
                >
                    Sign Out
                </Button>
            </Box>
        </Box>
    );

    return (
        <AdminSecurityGuard>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
                <AppBar
                    position="fixed"
                    sx={{
                        width: isMobile ? '100%' : `calc(100% - ${open ? DRAWER_WIDTH : 0}px)`,
                        ml: isMobile ? 0 : (open ? `${DRAWER_WIDTH}px` : 0),
                        transition: theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        bgcolor: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        color: navyColor,
                        boxShadow: 'none',
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                onClick={handleDrawerToggle}
                                edge="start"
                                sx={{ mr: 2 }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                {navItems.find(i => isActive(i.path))?.name || 'Admin'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Site">
                                <IconButton component={Link} href="/" size="small">
                                    <ExternalIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            {!isMobile && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2, borderLeft: '1px solid rgba(0,0,0,0.1)', pl: 2 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Toolbar>
                </AppBar>

                <Drawer
                    variant={isMobile ? 'temporary' : 'persistent'}
                    open={open}
                    onClose={handleDrawerToggle}
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            borderRight: 'none',
                            boxShadow: '4px 0 20px rgba(0,0,0,0.05)'
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, md: 4 },
                        width: isMobile ? '100%' : `calc(100% - ${open ? DRAWER_WIDTH : 0}px)`,
                        transition: theme.transitions.create('margin', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        mt: '64px'
                    }}
                >
                    <Fade in timeout={600}>
                        <Box>{children}</Box>
                    </Fade>
                </Box>
            </Box>
        </AdminSecurityGuard>
    );
}

