'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { logger } from '@/lib/logger';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error("Uncaught error caught by ErrorBoundary:", { error, errorInfo }, 'ErrorBoundary');
        // You can also log the error to an error reporting service here
        // For example, a service like Sentry, Bugsnag, or a custom logging endpoint
        // logErrorToMyService(error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Container maxWidth="md" sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    textAlign: 'center',
                    padding: 4
                }}>
                    <Typography variant="h3" component="h1" gutterBottom>
                        Oops! Something went wrong.
                    </Typography>
                    <Typography variant="body1" sx={{ marginBottom: 3 }}>
                        We're sorry for the inconvenience. Please try refreshing the page.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={this.handleReload}>
                        Reload Page
                    </Button>
                    <Box sx={{ mt: 4, color: 'text.secondary' }}>
                        <Typography variant="caption">
                            If the problem persists, please contact support.
                        </Typography>
                    </Box>
                </Container>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
