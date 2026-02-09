'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Button,
    Menu,
    MenuItem,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Container,
    Slide,
    useScrollTrigger,
    Divider,
    Collapse
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CollectionsIcon from '@mui/icons-material/Collections';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import CampaignIcon from '@mui/icons-material/Campaign';

const goldColor = '#786D3C';
const textColor = '#1B1464';


export default function Navbar() {
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [productsAnchorEl, setProductsAnchorEl] = useState<null | HTMLElement>(null);
    const [dashboardAnchorEl, setDashboardAnchorEl] = useState<null | HTMLElement>(null);

    // Mobile dropdown states
    const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
    const [mobileDashboardOpen, setMobileDashboardOpen] = useState(false);

    const pathname = usePathname();

    // Scroll trigger for transparency
    const scrolled = useScrollTrigger({
        disableHysteresis: true,
        threshold: 20,
    });

    const isProductsMenuOpen = Boolean(productsAnchorEl);
    const isDashboardMenuOpen = Boolean(dashboardAnchorEl);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProductsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setProductsAnchorEl(event.currentTarget);
    };

    const handleProductsMenuClose = () => {
        setProductsAnchorEl(null);
    };

    const handleDashboardMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setDashboardAnchorEl(event.currentTarget);
    };

    const handleDashboardMenuClose = () => {
        setDashboardAnchorEl(null);
    };

    // Close mobile menu on route change
    useEffect(() => {
        if (mobileOpen) {
            setMobileOpen(false);
        }
    }, [pathname]);

    // Helper to determine admin status
    const isAdmin = session && ((session.user as any).isStaff || (session.user as any).isSuperuser);

    const navItems = [
        { name: 'HOME', href: '/' },
        { name: 'ABOUT US', href: '/about' },
        { name: 'DATA', href: '/market-data' },
        { name: 'CONTACT US', href: '/contact' },
    ];

    const productsDropdownItems = [
        { name: 'All Products', href: '/products', desc: 'View all our products', icon: '📦' },
        { name: 'Sesame Seeds', href: '/products?category=sesame', desc: 'Premium Sudanese sesame', icon: '🌾' },
        { name: 'Gum Arabic', href: '/products?category=gum', desc: 'High-grade gum arabic', icon: '🌳' },
        { name: 'Cotton', href: '/products?category=cotton', desc: 'Quality cotton products', icon: '☁️' },
        { name: 'Others', href: '/products?category=others', desc: 'Peanuts, Hibiscus & more', icon: '🥜' },
    ];

    const dashboardDropdownItems = [
        { name: 'Overview', href: '', desc: 'Dashboard Home', icon: <DashboardIcon fontSize="small" /> },
        { name: 'Market Data', href: '/market-data', desc: 'Manage Market Rates', icon: <ShowChartIcon fontSize="small" /> },
        { name: 'Currencies', href: '/currencies', desc: 'Manage Currencies', icon: <AttachMoneyIcon fontSize="small" /> },
        { name: 'Product Variat.', href: '/variations', desc: 'Manage Quality Grades', icon: <SettingsIcon fontSize="small" /> },
        { name: 'Shipping Ports', href: '/ports', desc: 'Manage Ports', icon: <DashboardIcon fontSize="small" /> },
        { name: 'Gallery', href: '/gallery', desc: 'Manage Images', icon: <CollectionsIcon fontSize="small" /> },
        { name: 'Announcements', href: '/announcements', desc: 'Manage News', icon: <CampaignIcon fontSize="small" /> },
        { name: 'Users', href: '/users', desc: 'Manage Users', icon: <PeopleIcon fontSize="small" /> },
        { name: 'Settings', href: '/settings', desc: 'System Settings', icon: <SettingsIcon fontSize="small" /> },
    ];

    // Determine if navbar should be transparent
    const isTransparent = !scrolled && pathname === '/';
    const navBgColor = isTransparent ? 'transparent' : '#fff';
    const navShadow = isTransparent ? 'none' : '0 2px 10px rgba(0,0,0,0.05)';

    const drawer = (
        <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ py: 2, display: 'flex', justifyContent: 'flex-end', px: 2 }}>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Divider />
            <List sx={{ flexGrow: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemText sx={{ textAlign: 'center' }}>
                            <Link href={item.href} style={{ textDecoration: 'none', color: textColor, display: 'block', padding: '10px' }}>
                                <Typography variant="button" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                            </Link>
                        </ListItemText>
                    </ListItem>
                ))}

                {/* Mobile Products Dropdown */}
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemText sx={{ textAlign: 'center' }}>
                        <Box
                            onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                            sx={{
                                py: 1.5,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: textColor
                            }}
                        >
                            <Typography variant="button" sx={{ fontWeight: 600, mr: 1 }}>PRODUCTS</Typography>
                            {mobileProductsOpen ? <ExpandLess /> : <ExpandMore />}
                        </Box>
                        <Collapse in={mobileProductsOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                                {productsDropdownItems.map((item) => (
                                    <ListItem key={item.name} disablePadding>
                                        <Link href={item.href} style={{ textDecoration: 'none', color: textColor, width: '100%' }}>
                                            <ListItemText primary={item.name} sx={{ textAlign: 'center', py: 1 }} />
                                        </Link>
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                    </ListItemText>
                </ListItem>

                {/* Mobile Admin Dashboard Dropdown */}
                {isAdmin && (
                    <ListItem disablePadding sx={{ display: 'block' }}>
                        <ListItemText sx={{ textAlign: 'center' }}>
                            <Box
                                onClick={() => setMobileDashboardOpen(!mobileDashboardOpen)}
                                sx={{
                                    py: 1.5,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: goldColor
                                }}
                            >
                                <Typography variant="button" sx={{ fontWeight: 700, mr: 1 }}>ADMIN DASHBOARD</Typography>
                                {mobileDashboardOpen ? <ExpandLess /> : <ExpandMore />}
                            </Box>
                            <Collapse in={mobileDashboardOpen} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}>
                                    {dashboardDropdownItems.map((item) => (
                                        <ListItem key={item.name} disablePadding>
                                            <Link href={`/admin${item.href}`} style={{ textDecoration: 'none', color: textColor, width: '100%' }}>
                                                <ListItemText primary={item.name} sx={{ textAlign: 'center', py: 1 }} />
                                            </Link>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        </ListItemText>
                    </ListItem>
                )}

                {!isAdmin && session && (
                    <ListItem disablePadding>
                        <ListItemText sx={{ textAlign: 'center' }}>
                            <Link href="/user" style={{ textDecoration: 'none', color: goldColor, display: 'block', padding: '10px' }}>
                                <Typography variant="button" sx={{ fontWeight: 700 }}>MY DASHBOARD</Typography>
                            </Link>
                        </ListItemText>
                    </ListItem>
                )}
            </List>

            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {session ? (
                    <Button
                        onClick={() => signOut()}
                        variant="contained"
                        fullWidth
                        sx={{ bgcolor: goldColor, color: '#fff', '&:hover': { bgcolor: '#5a512d' } }}
                    >
                        Logout
                    </Button>
                ) : (
                    <>
                        <Button component="a" href="/login" variant="outlined" fullWidth sx={{ color: textColor, borderColor: textColor }}>
                            Login
                        </Button>
                        <Button component="a" href="/register" variant="contained" fullWidth sx={{ bgcolor: goldColor, color: '#fff', '&:hover': { bgcolor: '#5a512d' } }}>
                            Register
                        </Button>
                    </>
                )}
            </Box>
        </Box>
    );

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    bgcolor: navBgColor,
                    color: textColor,
                    boxShadow: navShadow,
                    transition: 'all 0.3s ease',
                    backdropFilter: isTransparent ? 'blur(10px)' : 'none'
                }}
            >
                <Container maxWidth="xl">
                    <Toolbar disableGutters sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 2 }}>

                        {/* 1. Logo (Left) */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gridColumn: '1' }}>
                            <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    width={180}
                                    height={60}
                                    style={{ objectFit: 'contain' }}
                                    priority
                                />
                            </Link>
                        </Box>

                        {/* 2. Desktop Nav (Center) */}
                        <Box sx={{ display: { xs: 'none', lg: 'flex' }, justifyContent: 'center', alignItems: 'center', gap: 3, gridColumn: '2' }}>
                            {navItems.map((item) => (
                                <Button
                                    key={item.name}
                                    component="a"
                                    href={item.href}
                                    sx={{
                                        color: pathname === item.href ? (isTransparent ? '#fff' : goldColor) : (isTransparent ? '#fff' : textColor),
                                        bgcolor: pathname === item.href ? (isTransparent ? 'rgba(255,255,255,0.2)' : 'rgba(120, 109, 60, 0.1)') : 'transparent',
                                        textTransform: 'uppercase',
                                        fontWeight: pathname === item.href ? 700 : 600,
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.5px',
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        '&:hover': {
                                            color: isTransparent ? '#fff' : goldColor,
                                            backgroundColor: isTransparent ? 'rgba(255,255,255,0.3)' : 'rgba(120, 109, 60, 0.05)',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {item.name}
                                </Button>
                            ))}

                            <Button
                                id="products-button"
                                aria-controls={isProductsMenuOpen ? 'products-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={isProductsMenuOpen ? 'true' : undefined}
                                onClick={handleProductsMenuOpen}
                                endIcon={<KeyboardArrowDownIcon />}
                                sx={{
                                    color: pathname.startsWith('/products') ? (isTransparent ? '#fff' : goldColor) : (isTransparent ? '#fff' : textColor),
                                    bgcolor: pathname.startsWith('/products') ? (isTransparent ? 'rgba(255,255,255,0.2)' : 'rgba(120, 109, 60, 0.1)') : 'transparent',
                                    textTransform: 'uppercase',
                                    fontWeight: pathname.startsWith('/products') ? 700 : 600,
                                    fontSize: '0.9rem',
                                    letterSpacing: '0.5px',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    '&:hover': {
                                        color: isTransparent ? '#fff' : goldColor,
                                        backgroundColor: isTransparent ? 'rgba(255,255,255,0.3)' : 'rgba(120, 109, 60, 0.05)',
                                        transform: 'translateY(-2px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Products
                            </Button>
                        </Box>

                        {/* 3. Auth/Profile (Right) */}
                        <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'flex-end', gap: 2, gridColumn: '3' }}>
                            {isAdmin ? (
                                <Button
                                    id="dashboard-button"
                                    aria-controls={isDashboardMenuOpen ? 'dashboard-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={isDashboardMenuOpen ? 'true' : undefined}
                                    onClick={handleDashboardMenuOpen}
                                    endIcon={<KeyboardArrowDownIcon />}
                                    sx={{
                                        color: pathname.startsWith('/admin') ? (isTransparent ? '#fff' : goldColor) : (isTransparent ? '#fff' : textColor),
                                        textTransform: 'uppercase',
                                        fontWeight: pathname.startsWith('/admin') ? 700 : 600,
                                        fontSize: '0.9rem',
                                        '&:hover': {
                                            color: isTransparent ? '#fff' : goldColor,
                                            backgroundColor: 'transparent'
                                        }
                                    }}
                                >
                                    Admin Dashboard
                                </Button>
                            ) : session ? (
                                <Button
                                    component="a"
                                    href="/user"
                                    sx={{
                                        color: pathname === '/user' ? (isTransparent ? '#fff' : goldColor) : (isTransparent ? '#fff' : textColor),
                                        textTransform: 'uppercase',
                                        fontWeight: pathname === '/user' ? 700 : 600,
                                        fontSize: '0.9rem',
                                        '&:hover': {
                                            color: isTransparent ? '#fff' : goldColor,
                                            backgroundColor: 'transparent'
                                        }
                                    }}
                                >
                                    My Dashboard
                                </Button>
                            ) : null}

                            {session ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography variant="body1" sx={{ cursor: 'pointer', color: isTransparent ? '#fff' : textColor, fontWeight: 600 }}>
                                        Hello, {session.user?.name?.split(' ')[0] || 'User'}
                                    </Typography>
                                    <Button
                                        onClick={() => signOut()}
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            bgcolor: goldColor,
                                            color: '#fff',
                                            fontWeight: 700,
                                            '&:hover': { bgcolor: '#5a512d' },
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        Logout
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                    <Button
                                        component="a"
                                        href="/login"
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            color: isTransparent ? '#fff' : textColor,
                                            borderColor: isTransparent ? '#fff' : textColor,
                                            fontWeight: 600,
                                            '&:hover': {
                                                borderColor: goldColor,
                                                color: goldColor,
                                                bgcolor: isTransparent ? 'rgba(255,255,255,0.1)' : 'transparent'
                                            }
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        component="a"
                                        href="/register"
                                        variant="contained"
                                        size="small"
                                        sx={{
                                            bgcolor: goldColor,
                                            color: '#fff',
                                            fontWeight: 700,
                                            '&:hover': { bgcolor: '#5a512d' },
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        Register
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        {/* Mobile Menu Icon */}
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ display: { lg: 'none' }, color: isTransparent ? '#fff' : textColor, gridColumn: '3', justifySelf: 'end' }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </Container>
            </AppBar>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', lg: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
                }}
            >
                {drawer}
            </Drawer>

            {/* Shared Products Menu */}
            <Menu
                id="products-menu"
                anchorEl={productsAnchorEl}
                open={isProductsMenuOpen}
                onClose={handleProductsMenuClose}
                MenuListProps={{ 'aria-labelledby': 'products-button' }}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }
                }}
            >
                {productsDropdownItems.map((item) => (
                    <MenuItem key={item.name} onClick={handleProductsMenuClose} sx={{ py: 1.5, px: 2.5 }}>
                        <Box component="a" href={item.href} sx={{ display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none', color: '#1B1464' }}>
                            <Typography component="span" sx={{ fontSize: '1.5rem' }}>{item.icon}</Typography>
                            <Box>
                                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>

            {/* Shared Dashboard Menu */}
            <Menu
                id="dashboard-menu"
                anchorEl={dashboardAnchorEl}
                open={isDashboardMenuOpen}
                onClose={handleDashboardMenuClose}
                MenuListProps={{ 'aria-labelledby': 'dashboard-button' }}
                PaperProps={{
                    sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }
                }}
            >
                {dashboardDropdownItems.map((item) => (
                    <MenuItem key={item.name} onClick={handleDashboardMenuClose} sx={{ py: 1.5, px: 2.5 }}>
                        <Box component="a" href={`/admin${item.href}`} sx={{ display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none', color: '#1B1464' }}>
                            <Box component="span" sx={{ display: 'flex', color: goldColor }}>{item.icon}</Box>
                            <Box>
                                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                            </Box>
                        </Box>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}