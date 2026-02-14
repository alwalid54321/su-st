'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface AdminSecurityGuardProps {
    children: ReactNode;
}

export default function AdminSecurityGuard({ children }: AdminSecurityGuardProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin/login');
        } else if (status === 'authenticated') {
            const isAdmin = (session?.user as any)?.isStaff || (session?.user as any)?.isSuperuser;
            if (!isAdmin) {
                router.push('/');
            }
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    gap: 2,
                    bgcolor: '#f8fafc'
                }}
            >
                <CircularProgress sx={{ color: '#1B1464' }} />
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Verifying Credentials...
                </Typography>
            </Box>
        );
    }

    const isAdmin = (session?.user as any)?.isStaff || (session?.user as any)?.isSuperuser;

    if (status === 'authenticated' && isAdmin) {
        return <>{children}</>;
    }

    return null;
}
