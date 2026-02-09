'use client'

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
    CircularProgress,
    Typography,
    Box,
    Container,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { logger } from '@/lib/logger';
import {
    faMapMarkerAlt,
    faPhone,
    faEnvelope,
    faClock,
} from '@fortawesome/free-solid-svg-icons';
import {
    faFacebook,
    faTwitter,
    faInstagram,
    faLinkedin,
} from '@fortawesome/free-brands-svg-icons';

const validationSchema = yup.object({
    name: yup.string().trim().required('Name is required'),
    email: yup.string().email('Enter a valid email').required('Email is required'),
    phone: yup.string().matches(/^[0-9+()\s-]+$/, 'Enter a valid phone number'),
    company: yup.string(),
    country: yup.string(),
    subject: yup.string().required('Please select a subject'),
    message: yup.string().trim().required('Message is required'),
});

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [trackingNumber, setTrackingNumber] = useState('');

    const handleTrackOrder = (e: React.FormEvent) => {
        e.preventDefault()
        if (trackingNumber) {
            alert(`Inquiry Status: ${trackingNumber} is being reviewed by our sales team. \n\nWe will contact you within 24 hours.`)
        }
    }

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            company: '',
            country: '',
            subject: '',
            message: '',
            _gotcha: '', // Honeypot field
        },
        validationSchema: validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setStatus('loading');
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to send message');
                }

                setStatus('success');
                setSnackbarOpen(true);
                setErrorMessage('');
                resetForm();
            } catch (error: any) {
                logger.error('Contact form submission error:', error, 'ContactPage');
                setStatus('error');
                setSnackbarOpen(true);
                setErrorMessage(error.message || 'Failed to send message. Please try again later.');
            }
        },
    });

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <React.Fragment>
            {/* ... existing Head ... */}
            <Head>
                <title>Contact Us - SudaStock</title>
                <meta name="description" content="Get in touch with SudaStock for inquiries, quotes, or support." />
                <meta name="keywords" content="SudaStock contact, agricultural data support, Sudan market inquiry" />
                <meta property="og:title" content="Contact Us - SudaStock" />
                <meta property="og:description" content="Get in touch with SudaStock for inquiries, quotes, or support." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.sudastock.com/contact" />
                {/* <meta property="og:image" content="https://www.sudastock.com/images/contact-hero.jpg" /> */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "ContactPage",
                            "name": "Contact Us - SudaStock",
                            "url": "https://www.sudastock.com/contact",
                            "description": "Get in touch with SudaStock for inquiries, quotes, or support.",
                            "mainEntityOfPage": {
                                "@type": "WebPage",
                                "@id": "https://www.sudastock.com/contact"
                            },
                            "contactPoint": [
                                {
                                    "@type": "ContactPoint",
                                    "telephone": "+971 502 330 481",
                                    "contactType": "Customer Service",
                                    "email": "info@sudastock.com"
                                }
                            ]
                        })
                    }}
                />
            </Head>
            <Box sx={{
                minHeight: '100vh',
                backgroundColor: '#f8f9fa',
            }}>
                {/* Hero Section */}
                <Box
                    sx={{
                        position: 'relative',
                        backgroundImage: 'url(/images/contact-hero.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '100vh',
                        minHeight: { xs: '400px', md: '600px' },
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
                            backgroundColor: 'rgba(27, 20, 100, 0.6)',
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
                                fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                                fontWeight: 700,
                                marginBottom: '1rem',
                                textTransform: 'uppercase',
                                letterSpacing: '3px',
                                color: 'white',
                            }}
                        >
                            contact us
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.3rem' }, lineHeight: 1.6, opacity: 0.95 }}>
                            Get in touch with our team for inquiries, quotes, or support
                        </Typography>
                    </Box>
                </Box>

                <Container maxWidth="lg" sx={{ paddingY: { xs: '50px', md: '80px' } }}>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 4,
                        marginX: { xs: '20px', md: '0' }
                    }}>
                        {/* Contact Info Section */}
                        <Box sx={{
                            flex: { xs: '1 1 100%', md: '0 0 40%' },
                            maxWidth: { xs: '100%', md: '40%' }
                        }}>
                            <Box
                                sx={{
                                    backgroundColor: 'var(--primary-dark)',
                                    color: 'white',
                                    padding: '40px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <Box>
                                    <Typography variant="h4" component="h2" sx={{
                                        fontSize: '2rem',
                                        marginBottom: '20px',
                                        color: 'white',
                                        position: 'relative',
                                        paddingBottom: '15px',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            width: '60px',
                                            height: '3px',
                                            backgroundColor: 'var(--accent)',
                                        },
                                    }}>
                                        Get In Touch
                                    </Typography>
                                    <Typography paragraph sx={{ marginBottom: '30px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.9)' }}>
                                        We're here to help with any questions about our products, services, or anything else you might want to know about SudaStock.
                                    </Typography>

                                    <Box sx={{ marginTop: '30px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px', gap: '15px' }}>
                                            <Box sx={{
                                                width: 40, height: 40,
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--accent)', fontSize: '1.2rem', flexShrink: 0, marginTop: '2px'
                                            }}>
                                                <FontAwesomeIcon icon={faMapMarkerAlt} />
                                            </Box>
                                            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                Office No.7, 12th Floor<br />
                                                The Bayswater Tower<br />
                                                Business Bay, Dubai<br />
                                                United Arab Emirates
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px', gap: '15px' }}>
                                            <Box sx={{
                                                width: 40, height: 40,
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--accent)', fontSize: '1.2rem', flexShrink: 0, marginTop: '2px'
                                            }}>
                                                <FontAwesomeIcon icon={faPhone} />
                                            </Box>
                                            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                +971 502 330 481
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px', gap: '15px' }}>
                                            <Box sx={{
                                                width: 40, height: 40,
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--accent)', fontSize: '1.2rem', flexShrink: 0, marginTop: '2px'
                                            }}>
                                                <FontAwesomeIcon icon={faEnvelope} />
                                            </Box>
                                            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                info@sudastock.com
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px', gap: '15px' }}>
                                            <Box sx={{
                                                width: 40, height: 40,
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'var(--accent)', fontSize: '1.2rem', flexShrink: 0, marginTop: '2px'
                                            }}>
                                                <FontAwesomeIcon icon={faClock} />
                                            </Box>
                                            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                                Mon-Fri: 9:00 AM - 5:00 PM
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Social Media Links */}
                                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' }, gap: '20px', marginTop: '30px' }}>
                                    <Link href="#" target="_blank" rel="noopener noreferrer">
                                        {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                                        }
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                color: 'white',
                                                borderColor: 'white',
                                                '&:hover': { borderColor: 'var(--accent)', color: 'var(--accent)' },
                                                minWidth: 'unset', padding: '8px', borderRadius: '50%'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faFacebook} size="lg" />
                                        </Button>
                                    </Link>
                                    <Link href="#" target="_blank" rel="noopener noreferrer">
                                        {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                                        }
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                color: 'white',
                                                borderColor: 'white',
                                                '&:hover': { borderColor: 'var(--accent)', color: 'var(--accent)' },
                                                minWidth: 'unset', padding: '8px', borderRadius: '50%'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faTwitter} size="lg" />
                                        </Button>
                                    </Link>
                                    <Link href="#" target="_blank" rel="noopener noreferrer">
                                        {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                                        }
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                color: 'white',
                                                borderColor: 'white',
                                                '&:hover': { borderColor: 'var(--accent)', color: 'var(--accent)' },
                                                minWidth: 'unset', padding: '8px', borderRadius: '50%'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faInstagram} size="lg" />
                                        </Button>
                                    </Link>
                                    <Link href="#" target="_blank" rel="noopener noreferrer">
                                        {/* @next-codemod-error This Link previously used the now removed `legacyBehavior` prop, and has a child that might not be an anchor. The codemod bailed out of lifting the child props to the Link. Check that the child component does not render an anchor, and potentially move the props manually to Link. */
                                        }
                                        <Button
                                            variant="outlined"
                                            sx={{
                                                color: 'white',
                                                borderColor: 'white',
                                                '&:hover': { borderColor: 'var(--accent)', color: 'var(--accent)' },
                                                minWidth: 'unset', padding: '8px', borderRadius: '50%'
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faLinkedin} size="lg" />
                                        </Button>
                                    </Link>
                                </Box>
                            </Box>
                        </Box>

                        {/* Contact Form Section */}
                        <Box sx={{
                            flex: { xs: '1 1 100%', md: '0 0 58%' },
                            maxWidth: { xs: '100%', md: '58%' } // 58% + 40% = 98% -> gap handles rest
                        }}>
                            <Box
                                sx={{
                                    backgroundColor: 'white',
                                    padding: '40px',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    height: '100%',
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                                    <Box
                                        component="form"
                                        onSubmit={handleTrackOrder}
                                        sx={{
                                            display: 'flex',
                                            gap: 1,
                                            backgroundColor: '#f0f0f0',
                                            padding: '6px',
                                            borderRadius: '8px',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                                        }}
                                    >
                                        <input
                                            type="text"
                                            placeholder="Tracking #"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                padding: '4px 8px',
                                                fontSize: '0.85rem',
                                                outline: 'none',
                                                width: '120px'
                                            }}
                                        />
                                        <Button
                                            type="submit"
                                            size="small"
                                            variant="contained"
                                            sx={{
                                                backgroundColor: 'var(--primary-dark)',
                                                '&:hover': { backgroundColor: 'var(--accent)' },
                                                textTransform: 'none',
                                                fontSize: '0.75rem',
                                                minWidth: 'auto',
                                                px: 2
                                            }}
                                        >
                                            Track
                                        </Button>
                                    </Box>
                                </Box>

                                <Typography variant="h4" component="h2" sx={{
                                    fontSize: '2rem',
                                    marginBottom: '30px',
                                    color: 'var(--primary-dark)',
                                    position: 'relative',
                                    paddingBottom: '15px',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        width: '60px',
                                        height: '3px',
                                        backgroundColor: 'var(--accent)',
                                    },
                                }}>
                                    Send Us A Message
                                </Typography>

                                <form onSubmit={formik.handleSubmit}>
                                    {/* Using Box for grid layout for inputs */}
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                                        {/* Honeypot Field */}
                                        <div style={{ display: 'none' }} aria-hidden="true">
                                            <label htmlFor="_gotcha">Do not fill this field</label>
                                            <input
                                                type="text"
                                                id="_gotcha"
                                                name="_gotcha"
                                                value={(formik.values as any)._gotcha}
                                                onChange={formik.handleChange}
                                                tabIndex={-1}
                                                autoComplete="off"
                                            />
                                        </div>

                                        <Box>
                                            <TextField
                                                fullWidth
                                                id="name"
                                                name="name"
                                                label="Your Name"
                                                value={formik.values.name}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.name && Boolean(formik.errors.name)}
                                                helperText={formik.touched.name && formik.errors.name}
                                            />
                                        </Box>
                                        <Box>
                                            <TextField
                                                fullWidth
                                                id="email"
                                                name="email"
                                                label="Email Address"
                                                value={formik.values.email}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.email && Boolean(formik.errors.email)}
                                                helperText={formik.touched.email && formik.errors.email}
                                            />
                                        </Box>
                                        <Box>
                                            <TextField
                                                fullWidth
                                                id="phone"
                                                name="phone"
                                                label="Phone Number"
                                                value={formik.values.phone}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.phone && Boolean(formik.errors.phone)}
                                                helperText={formik.touched.phone && formik.errors.phone}
                                            />
                                        </Box>
                                        <Box>
                                            <TextField
                                                fullWidth
                                                id="company"
                                                name="company"
                                                label="Company Name"
                                                value={formik.values.company}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.company && Boolean(formik.errors.company)}
                                                helperText={formik.touched.company && formik.errors.company}
                                            />
                                        </Box>
                                        <Box>
                                            <TextField
                                                fullWidth
                                                id="country"
                                                name="country"
                                                label="Country"
                                                value={formik.values.country}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.country && Boolean(formik.errors.country)}
                                                helperText={formik.touched.country && formik.errors.country}
                                            />
                                        </Box>
                                        <Box>
                                            <FormControl fullWidth error={formik.touched.subject && Boolean(formik.errors.subject)}>
                                                <InputLabel id="subject-label">Subject</InputLabel>
                                                <Select
                                                    labelId="subject-label"
                                                    id="subject"
                                                    name="subject"
                                                    value={formik.values.subject}
                                                    label="Subject"
                                                    onChange={formik.handleChange}
                                                    onBlur={formik.handleBlur}
                                                >
                                                    <MenuItem value="">Select a subject</MenuItem>
                                                    <MenuItem value="general">General Inquiry</MenuItem>
                                                    <MenuItem value="products">Product Information</MenuItem>
                                                    <MenuItem value="pricing">Pricing & Quotes</MenuItem>
                                                    <MenuItem value="support">Technical Support</MenuItem>
                                                    <MenuItem value="other">Other</MenuItem>
                                                </Select>
                                                {formik.touched.subject && formik.errors.subject && (
                                                    <Typography variant="caption" color="error">
                                                        {formik.errors.subject}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Box>
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <TextField
                                                fullWidth
                                                id="message"
                                                name="message"
                                                label="Your Message"
                                                multiline
                                                rows={6}
                                                value={formik.values.message}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.message && Boolean(formik.errors.message)}
                                                helperText={formik.touched.message && formik.errors.message}
                                                sx={{ '& .MuiInputBase-root': { padding: 0 } }}
                                            />
                                        </Box>
                                        <Box sx={{ gridColumn: '1 / -1' }}>
                                            <Button
                                                color="primary"
                                                variant="contained"
                                                fullWidth
                                                type="submit"
                                                disabled={formik.isSubmitting || status === 'loading'}
                                                sx={{
                                                    backgroundColor: 'var(--primary-dark)',
                                                    color: 'white',
                                                    padding: '14px 30px',
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    borderRadius: '4px',
                                                    marginTop: '10px',
                                                    transition: 'all 0.3s',
                                                    '&:hover': {
                                                        backgroundColor: 'var(--accent)',
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                                    },
                                                }}
                                            >
                                                {status === 'loading' ? <CircularProgress size={24} color="inherit" /> : 'Send Message'}
                                            </Button>
                                        </Box>
                                    </Box>
                                </form>
                            </Box>
                        </Box>
                    </Box>
                    {/* Google Maps Section */}
                    <Box sx={{ marginTop: 4 }}>
                        <Box
                            sx={{
                                height: { xs: '300px', sm: '350px', md: '450px' },
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                width: '100%',
                            }}
                        >
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!4v1741826789629!6m8!1m7!1sqfYB9di-En-qi0pFyAudwg!2m2!1d25.18447082783544!2d55.26358743995144!3f108.96!4f38.099999999999994!5f0.7820865974627469"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </Box>
                    </Box>
                </Container>

                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={status === 'success' ? 'success' : 'error'} sx={{ width: '100%' }}>
                        {status === 'success' ? 'Thank you for your message! We\'ll get back to you soon.' : errorMessage}
                    </Alert>
                </Snackbar>
            </Box >
        </React.Fragment >
    );
}