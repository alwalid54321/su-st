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
    useScrollTrigger
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface HideOnScrollProps {
    children: React.ReactElement;
}

function HideOnScroll(props: HideOnScrollProps) {
    const { children } = props;
    const trigger = useScrollTrigger();

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

export default function Navbar() {
    const { data: session } = useSession();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [productsAnchorEl, setProductsAnchorEl] = useState<null | HTMLElement>(null);
    const [dashboardAnchorEl, setDashboardAnchorEl] = useState<null | HTMLElement>(null);
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
        { name: 'Sesame Seeds', desc: 'Premium quality seeds', icon: '🌱', href: '/products?category=sesame' },
        { name: 'Peanuts', desc: 'Rich & flavorful', icon: '🥜', href: '/products?category=others' },
        { name: 'Gum Arabic', desc: 'Natural acacia gum', icon: '🌳', href: '/products?category=gum' },
        { name: 'Cotton', desc: 'High-grade fiber', icon: '☁️', href: '/products?category=cotton' },
    ];

    const dashboardDropdownItems = [
        { name: 'Market Data', desc: 'Manage products', icon: '📊', href: '/dashboard/market-data' },
        { name: 'Currencies', desc: 'Exchange rates', icon: '💱', href: '/dashboard/currencies' },
        { name: 'Gallery', desc: 'Image management', icon: '🖼️', href: '/dashboard/gallery' },
    ];

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', padding: 2 }}>
                <IconButton onClick={handleDrawerToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <List>
                {navItems.map((item) => (
                    <ListItem key={item.name} disablePadding>
                        <ListItemText sx={{ textAlign: 'center' }}>
                            <Link href={item.href} passHref legacyBehavior>
                                <Button
                                    sx={{
                                        width: '100%',
                                        textTransform: 'uppercase',
                                        fontWeight: pathname === item.href ? 700 : 500,
                                        color: pathname === item.href ? '#1B1464' : 'inherit',
                                        backgroundColor: pathname === item.href ? 'rgba(27, 20, 100, 0.05)' : 'transparent',
                                        '&:hover': { backgroundColor: 'rgba(27, 20, 100, 0.05)' }
                                    }}
                                >
                                    {item.name}
                                </Button>
                            </Link>
                        </ListItemText>
                    </ListItem>
                ))}
                <ListItem disablePadding>
                    <ListItemText sx={{ textAlign: 'center' }}>
                        <Button
                            onClick={handleProductsMenuOpen}
                            endIcon={<KeyboardArrowDownIcon />}
                            sx={{
                                width: '100%',
                                textTransform: 'uppercase',
                                fontWeight: pathname.startsWith('/products') ? 700 : 500,
                                color: pathname.startsWith('/products') ? '#1B1464' : 'inherit',
                                backgroundColor: pathname.startsWith('/products') ? 'rgba(27, 20, 100, 0.05)' : 'transparent',
                                '&:hover': { backgroundColor: 'rgba(27, 20, 100, 0.05)' }
                            }}
                        >
                            Products
                        </Button>
                        <Menu
                            anchorEl={productsAnchorEl}
                            open={isProductsMenuOpen}
                            onClose={handleProductsMenuClose}
                            MenuListProps={{ 'aria-labelledby': 'products-button' }}
                        >
                            {productsDropdownItems.map((item) => (
                                <MenuItem key={item.name} onClick={handleProductsMenuClose}>
                                    <Link href={item.href} passHref legacyBehavior>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
                                            <Typography component="span">{item.icon}</Typography>
                                            <Box>
                                                <Typography variant="subtitle1" component="span">{item.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                            </Box>
                                        </Box>
                                    </Link>
                                </MenuItem>
                            ))}
                        </Menu>
                    </ListItemText>
                </ListItem>

                {isAdmin ? (
                    <ListItem disablePadding>
                        <ListItemText sx={{ textAlign: 'center' }}>
                            <Button
                                onClick={handleDashboardMenuOpen}
                                endIcon={<KeyboardArrowDownIcon />}
                                sx={{
                                    width: '100%',
                                    textTransform: 'uppercase',
                                    fontWeight: pathname.startsWith('/dashboard') ? 700 : 500,
                                    color: pathname.startsWith('/dashboard') ? '#1B1464' : 'inherit',
                                    backgroundColor: pathname.startsWith('/dashboard') ? 'rgba(27, 20, 100, 0.05)' : 'transparent',
                                    '&:hover': { backgroundColor: 'rgba(27, 20, 100, 0.05)' }
                                }}
                            >
                                Admin Dashboard
                            </Button>
                            <Menu
                                anchorEl={dashboardAnchorEl}
                                open={isDashboardMenuOpen}
                                onClose={handleDashboardMenuClose}
                                MenuListProps={{ 'aria-labelledby': 'dashboard-button' }}
                            >
                                {dashboardDropdownItems.map((item) => (
                                    <MenuItem key={item.name} onClick={handleDashboardMenuClose}>
                                        <Link href={item.href} passHref legacyBehavior>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, textDecoration: 'none', color: 'inherit' }}>
                                                <Typography component="span">{item.icon}</Typography>
                                                <Box>
                                                    <Typography variant="subtitle1" component="span">{item.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                                </Box>
                                            </Box>
                                        </Link>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </ListItemText>
                    </ListItem>
                ) : session ? (
                    <ListItem disablePadding>
                        <ListItemText sx={{ textAlign: 'center' }}>
                            <Link href="/user" passHref legacyBehavior>
                                <Button
                                    sx={{
                                        width: '100%',
                                        textTransform: 'uppercase',
                                        fontWeight: pathname === '/user' ? 700 : 500,
                                        color: pathname === '/user' ? '#1B1464' : 'inherit',
                                        backgroundColor: pathname === '/user' ? 'rgba(27, 20, 100, 0.05)' : 'transparent',
                                        '&:hover': { backgroundColor: 'rgba(27, 20, 100, 0.05)' }
                                    }}
                                >
                                    My Dashboard
                                </Button>
                            </Link>
                        </ListItemText>
                    </ListItem>
                ) : null}

                <ListItem disablePadding sx={{ display: 'flex', justifyContent: 'center', marginTop: 2, gap: 1 }}>
                    {session ? (
                        <Button onClick={() => signOut()} variant="contained" sx={{ bgcolor: '#1B1464', '&:hover': { bgcolor: '#2d1f7a' } }}>
                            Logout
                        </Button>
                    ) : (
                        <>
                            <Link href="/login" passHref legacyBehavior>
                                <Button variant="outlined" sx={{ color: '#1B1464', borderColor: '#1B1464' }}>Login</Button>
                            </Link>
                            <Link href="/register" passHref legacyBehavior>
                                <Button variant="contained" sx={{ bgcolor: '#1B1464', '&:hover': { bgcolor: '#2d1f7a' } }}>Register</Button>
                            </Link>
                        </>
                    )}
                </ListItem>
            </List>
        </Box>
    );

    // Dynamic styles based on scroll and path
    // Apply transparency to all main pages as requested: home, about, contact, market-data, products
    const isTransparentPage = ['/', '/about', '/contact', '/market-data'].includes(pathname) || pathname.startsWith('/products');
    const isTransparent = isTransparentPage && !scrolled;

    // Text color: White if transparent, otherwise Navy (#1B1464)
    const textColor = isTransparent ? '#ffffff' : '#1B1464';
    const logoFilter = isTransparent ? 'brightness(0) invert(1)' : 'none';
    const goldColor = '#786D3C'; // Updated Gold Color

    return (
        <>
            <HideOnScroll>
                <AppBar component="nav" sx={{
                    backgroundColor: isTransparent ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
                    boxShadow: isTransparent ? 'none' : '0 2px 10px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease-in-out',
                    backdropFilter: isTransparent ? 'none' : 'blur(10px)',
                    padding: '10px 0',
                }}>
                    <Container maxWidth="xl">
                        <Toolbar disableGutters sx={{ justifyContent: 'space-between', display: 'grid', gridTemplateColumns: { lg: 'auto 1fr auto', xs: '1fr auto' }, gap: 2 }}>

                            {/* 1. Logo (Left) */}
                            <Link href="/" passHref legacyBehavior>
                                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gridColumn: '1' }}>
                                    <Image
                                        src="/images/logo-icon.png"
                                        alt="SudaStock"
                                        width={120}
                                        height={60}
                                        priority
                                        style={{
                                            transition: 'all 0.3s ease-in-out',
                                            filter: logoFilter,
                                            objectFit: 'contain',
                                            width: 'auto',
                                            height: '60px'
                                        }}
                                    />
                                    {/* Text removed as requested */}
                                </Box>
                            </Link>

                            {/* 2. Navigation Links (Center) */}
                            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'center', gap: 4, gridColumn: '2' }}>
                                {navItems.map((item) => (
                                    <Link key={item.name} href={item.href} passHref legacyBehavior>
                                        <Button
                                            sx={{
                                                color: pathname === item.href ? goldColor : textColor,
                                                textTransform: 'uppercase',
                                                fontWeight: pathname === item.href ? 700 : 600,
                                                fontSize: '0.9rem',
                                                letterSpacing: '0.5px',
                                                '&:hover': {
                                                    color: goldColor,
                                                    backgroundColor: 'transparent',
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {item.name}
                                        </Button>
                                    </Link>
                                ))}

                                <Button
                                    id="products-button"
                                    aria-controls={isProductsMenuOpen ? 'products-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={isProductsMenuOpen ? 'true' : undefined}
                                    onClick={handleProductsMenuOpen}
                                    endIcon={<KeyboardArrowDownIcon />}
                                    sx={{
                                        color: pathname.startsWith('/products') ? goldColor : textColor,
                                        textTransform: 'uppercase',
                                        fontWeight: pathname.startsWith('/products') ? 700 : 600,
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.5px',
                                        '&:hover': {
                                            color: goldColor,
                                            backgroundColor: 'transparent',
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    Products
                                </Button>
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
                                            <Link href={item.href} passHref legacyBehavior>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none', color: '#1B1464' }}>
                                                    <Typography component="span" sx={{ fontSize: '1.5rem' }}>{item.icon}</Typography>
                                                    <Box>
                                                        <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                                        <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                                    </Box>
                                                </Box>
                                            </Link>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>

                            {/* 3. Auth/Profile (Right) */}
                            <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', justifyContent: 'flex-end', gap: 2, gridColumn: '3' }}>
                                {isAdmin ? (
                                    <>
                                        <Button
                                            id="dashboard-button"
                                            aria-controls={isDashboardMenuOpen ? 'dashboard-menu' : undefined}
                                            aria-haspopup="true"
                                            aria-expanded={isDashboardMenuOpen ? 'true' : undefined}
                                            onClick={handleDashboardMenuOpen}
                                            endIcon={<KeyboardArrowDownIcon />}
                                            sx={{
                                                color: pathname.startsWith('/dashboard') ? goldColor : textColor,
                                                textTransform: 'uppercase',
                                                fontWeight: pathname.startsWith('/dashboard') ? 700 : 600,
                                                fontSize: '0.9rem',
                                                '&:hover': {
                                                    color: goldColor,
                                                    backgroundColor: 'transparent'
                                                }
                                            }}
                                        >
                                            Admin Dashboard
                                        </Button>
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
                                                    <Link href={item.href} passHref legacyBehavior>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, textDecoration: 'none', color: '#1B1464' }}>
                                                            <Typography component="span" sx={{ fontSize: '1.5rem' }}>{item.icon}</Typography>
                                                            <Box>
                                                                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                                                                <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Link>
                                                </MenuItem>
                                            ))}
                                        </Menu>
                                    </>
                                ) : session ? (
                                    <Link href="/user" passHref legacyBehavior>
                                        <Button
                                            sx={{
                                                color: pathname === '/user' ? goldColor : textColor,
                                                textTransform: 'uppercase',
                                                fontWeight: pathname === '/user' ? 700 : 600,
                                                fontSize: '0.9rem',
                                                '&:hover': {
                                                    color: goldColor,
                                                    backgroundColor: 'transparent'
                                                }
                                            }}
                                        >
                                            My Dashboard
                                        </Button>
                                    </Link>
                                ) : null}

                                {session ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography variant="body1" sx={{ cursor: 'pointer', color: textColor, fontWeight: 600 }}>
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
                                        <Link href="/login" passHref legacyBehavior>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    color: textColor,
                                                    borderColor: textColor,
                                                    fontWeight: 600,
                                                    '&:hover': {
                                                        borderColor: goldColor,
                                                        color: goldColor
                                                    }
                                                }}
                                            >
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/register" passHref legacyBehavior>
                                            <Button
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
                                        </Link>
                                    </Box>
                                )}
                            </Box>

                            {/* Mobile Menu Icon */}
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ display: { lg: 'none' }, color: textColor, gridColumn: '2', justifySelf: 'end' }}
                            >
                                <MenuIcon />
                            </IconButton>
                        </Toolbar>
                    </Container>
                </AppBar>
            </HideOnScroll>
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
        </>
    );
}