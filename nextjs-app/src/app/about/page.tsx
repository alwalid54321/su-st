'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
} from '@mui/material';

export default function AboutPage() {
    return (
        <React.Fragment>
            <Head>
                <title>About Us - SudaStock</title>
                <meta name="description" content="Learn about SudaStock: our mission to provide accurate agricultural data and market insights in Sudan." />
                <meta name="keywords" content="SudaStock, agricultural data, Sudan, market insights, farming, trade, investment" />
                <meta property="og:title" content="About Us - SudaStock" />
                <meta property="og:description" content="Learn about SudaStock: our mission to provide accurate agricultural data and market insights in Sudan." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.sudastock.com/about" />
                {/* <meta property="og:image" content="https://www.sudastock.com/images/about-hero.jpg" /> */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "AboutPage",
                            "name": "About Us - SudaStock",
                            "url": "https://www.sudastock.com/about",
                            "description": "Learn about SudaStock: our mission to provide accurate agricultural data and market insights in Sudan.",
                            "mainEntityOfPage": {
                                "@type": "WebPage",
                                "@id": "https://www.sudastock.com/about"
                            },
                            "mentions": [
                                "agricultural data",
                                "market insights",
                                "Sudan",
                                "farming",
                                "trade",
                                "investment",
                                "SudaStock"
                            ]
                        })
                    }}
                />
            </Head>
            <main>
                {/* Hero Section */}
                <Box
                    sx={{
                        position: 'relative',
                        backgroundImage: 'url(/images/hero/about-hero.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '100vh',
                        minHeight: { xs: '400px', md: '400px' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        textAlign: 'center',
                        marginBottom: 0,
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        },
                    }}
                >
                    <Box sx={{
                        position: 'relative',
                        zIndex: 2,
                        maxWidth: 800,
                        padding: { xs: '0 20px', md: '0 20px' },
                    }}>
                        <Typography
                            variant="h3"
                            component="h1"
                            sx={{
                                fontSize: { xs: '2.5rem', md: '3rem' },
                                fontWeight: 700,
                                marginBottom: '1rem',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                color: 'white',
                            }}
                        >
                            ABOUT US
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 1.6 }}>
                            We strive to be the leading provider of agricultural data and market insights in Sudan, connecting farmers, traders, and investors to create a more efficient and transparent market.
                        </Typography>
                    </Box>
                </Box>

                {/* Inspiration Section */}
                <Box
                    sx={{
                        padding: '4rem 0',
                        textAlign: 'center',
                        backgroundColor: '#f8f8f8',
                    }}
                >
                    <Container maxWidth="md">
                        <Typography
                            variant="h4"
                            component="h2"
                            sx={{
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                color: 'var(--primary-dark)', // Assuming --primary-dark is defined in a global CSS or theme
                                marginBottom: '2rem',
                                letterSpacing: '2px',
                                textAlign: 'center',
                            }}
                        >
                            OUR INSPIRATION
                        </Typography>
                        <Box sx={{
                            maxWidth: 900,
                            margin: '0 auto',
                            textAlign: 'center',
                            fontSize: '1.1rem',
                            lineHeight: 1.8,
                            color: '#333',
                        }}>
                            <Typography paragraph>
                                <Typography component="span" sx={{ color: 'var(--accent)', fontWeight: 'bold' }}>SudaStock</Typography> was founded with a vision to revolutionize Sudan's agricultural data sector by providing the most accurate, comprehensive, and accessible information on agricultural commodities, market trends, and trade opportunities.
                            </Typography>

                            <Typography paragraph>
                                Sudan is uniquely positioned as a commercial gateway to the African continent. With vast agricultural resources and strategic location, we believe that reliable data is the foundation for sustainable growth in the agricultural sector.
                            </Typography>

                            <Typography paragraph>
                                Our team combines expertise in agricultural economics, data science, and market analysis to deliver insights that empower stakeholders across the agricultural value chain. We are committed to transparency, accuracy, and innovation in everything we do.
                            </Typography>

                            <Typography paragraph>
                                We're proud to serve as a bridge between traditional agricultural practices and modern data-driven decision making, helping to unlock the full potential of Sudan's agricultural economy and contribute to food security and economic prosperity.
                            </Typography>
                        </Box>
                    </Container>
                </Box>

                {/* Why Choose Us Section */}
                <Box
                    sx={{
                        padding: '4rem 0',
                        backgroundColor: '#e9e9e9',
                        textAlign: 'center',
                    }}
                >
                    <Container maxWidth="md">
                        <Typography
                            variant="h4"
                            component="h2"
                            sx={{
                                textAlign: 'center',
                                color: 'white',
                                backgroundColor: '#555',
                                padding: '1.5rem',
                                marginBottom: '3rem',
                                textTransform: 'uppercase',
                                fontSize: { xs: '1.5rem', md: '1.8rem' },
                                letterSpacing: '2px',
                                display: 'inline-block',
                                width: '100%',
                                maxWidth: 400,
                            }}
                        >
                            Why choose us?
                        </Typography>

                        <Grid container spacing={4} justifyContent="center" sx={{ marginTop: '2rem', marginBottom: '3rem' }}>
                            {/* Feature 1 */}
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Card
                                    sx={{
                                        borderRadius: '10px',
                                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        transition: 'transform 0.3s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                        },
                                        height: '100%', // Ensure cards have equal height
                                    }}
                                >
                                    <CardContent sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '0 !important', // Remove default CardContent padding
                                    }}>
                                        <Box sx={{
                                            width: 60,
                                            height: 60,
                                            margin: '0 auto 1.5rem',
                                            padding: '15px',
                                            backgroundColor: '#f8f8f8',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Image
                                                src="/images/sections/about/team.webp"
                                                alt="Reliable Data"
                                                width={60}
                                                height={60}
                                                style={{ width: 'auto', height: 'auto' }}
                                                loading="lazy"
                                            />
                                        </Box>
                                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                                            Reliable Data
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                                            We collect and verify data from multiple sources to ensure accuracy and reliability you can trust.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Feature 2 */}
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Card
                                    sx={{
                                        borderRadius: '10px',
                                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        transition: 'transform 0.3s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                        },
                                        height: '100%',
                                    }}
                                >
                                    <CardContent sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '0 !important',
                                    }}>
                                        <Box sx={{
                                            width: 60,
                                            height: 60,
                                            margin: '0 auto 1.5rem',
                                            padding: '15px',
                                            backgroundColor: '#f8f8f8',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Image
                                                src="/images/sections/about/trust.webp"
                                                alt="Market Expertise"
                                                width={60}
                                                height={60}
                                                style={{ width: 'auto', height: 'auto' }}
                                                loading="lazy"
                                            />
                                        </Box>
                                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                                            Market Expertise
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                                            Our team of experts provides valuable insights and analysis of agricultural market trends.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Feature 3 */}
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Card
                                    sx={{
                                        borderRadius: '10px',
                                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        transition: 'transform 0.3s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                        },
                                        height: '100%',
                                    }}
                                >
                                    <CardContent sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '0 !important',
                                    }}>
                                        <Box sx={{
                                            width: 60,
                                            height: 60,
                                            margin: '0 auto 1.5rem',
                                            padding: '15px',
                                            backgroundColor: '#f8f8f8',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Image
                                                src="/images/sections/about/growth.webp"
                                                alt="Growth Opportunities"
                                                width={60}
                                                height={60}
                                                style={{ width: 'auto', height: 'auto' }}
                                                loading="lazy"
                                            />
                                        </Box>
                                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                                            Growth Opportunities
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                                            We connect stakeholders across the value chain, creating opportunities for collaboration and growth.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Feature 4 */}
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Card
                                    sx={{
                                        borderRadius: '10px',
                                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                                        padding: '2rem',
                                        textAlign: 'center',
                                        transition: 'transform 0.3s ease',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        '&:hover': {
                                            transform: 'translateY(-10px)',
                                        },
                                        height: '100%',
                                    }}
                                >
                                    <CardContent sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        padding: '0 !important',
                                    }}>
                                        <Box sx={{
                                            width: 60,
                                            height: 60,
                                            margin: '0 auto 1.5rem',
                                            padding: '15px',
                                            backgroundColor: '#f8f8f8',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Image
                                                src="/images/sections/about/market-data.webp"
                                                alt="Comprehensive Coverage"
                                                width={60}
                                                height={60}
                                                style={{ width: 'auto', height: 'auto' }}
                                                loading="lazy"
                                            />
                                        </Box>
                                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                                            Comprehensive Coverage
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                                            Our platform covers a wide range of agricultural commodities and market indicators.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Link href="/contact">
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                sx={{
                                    backgroundColor: 'var(--primary-dark)', // Assuming --primary-dark is defined
                                    color: 'white',
                                    padding: '0.8rem 2rem',
                                    borderRadius: '30px',
                                    marginTop: '2rem',
                                    transition: 'all 0.3s ease',
                                    fontWeight: 600,
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        backgroundColor: 'var(--accent)', // Assuming --accent is defined
                                        transform: 'translateY(-3px)',
                                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                                    },
                                }}
                            >
                                Contact Us
                            </Button>
                        </Link>
                    </Container>
                </Box>
            </main>
        </React.Fragment>
    );
}