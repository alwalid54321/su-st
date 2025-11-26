'use client'

import React from 'react';
import Image from 'next/image';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid
} from '@mui/material';

interface FeatureCardProps {
    src: string;
    alt: string;
    title: string;
    description: string;
}

export default function FeatureCard({
    src,
    alt,
    title,
    description,
}: FeatureCardProps) {
    return (
        <Grid item xs={12} sm={6} md={3}>
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
                            src={src}
                            alt={alt}
                            width={60}
                            height={60}
                            style={{ width: 'auto', height: 'auto' }}
                            loading="lazy"
                        />
                    </Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'var(--primary-dark)', marginBottom: '1rem' }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                        {description}
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
    );
}
