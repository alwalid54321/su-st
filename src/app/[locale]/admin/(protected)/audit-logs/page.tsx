'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    alpha,
    useTheme,
    Button,
    TextField,
    MenuItem,
    Grid,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    History as AuditIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    Download as ExportIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';

const navyColor = '#1B1464';
const goldColor = '#786D3C';

export default function AuditLogsPage() {
    const theme = useTheme();
    const t = useTranslations();
    const [logs, setLogs] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        targetType: '',
    });

    const fetchLogs = async () => {
        setLoading(true);
        try {
            let url = `/api/admin/audit-logs?limit=${rowsPerPage}&offset=${page * rowsPerPage}`;
            if (filters.action) url += `&action=${filters.action}`;
            if (filters.targetType) url += `&targetType=${filters.targetType}`;
            
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
                setTotal(data.total);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, rowsPerPage, filters]);

    const getActionColor = (action: string) => {
        if (action.includes('CREATE')) return '#10b981';
        if (action.includes('DELETE')) return '#ef4444';
        if (action.includes('UPDATE')) return '#3b82f6';
        if (action.includes('LOGIN')) return goldColor;
        return '#64748b';
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: navyColor, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AuditIcon sx={{ fontSize: 40 }} /> System Audit Trail
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        Chronological record of all administrative and sensitive user actions
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ExportIcon />}
                        sx={{ borderRadius: 2, color: navyColor, borderColor: alpha(navyColor, 0.2) }}
                    >
                        Export Report
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={fetchLogs}
                        sx={{ borderRadius: 2, bgcolor: navyColor, '&:hover': { bgcolor: alpha(navyColor, 0.9) } }}
                    >
                        Refresh
                    </Button>
                </Box>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 5, border: '1px solid rgba(0,0,0,0.05)' }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Filter by Action"
                            value={filters.action}
                            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                            size="small"
                        >
                            <MenuItem value="">All Actions</MenuItem>
                            <MenuItem value="LOGIN">Logins</MenuItem>
                            <MenuItem value="MARKET_DATA_UPDATE">Market Updates</MenuItem>
                            <MenuItem value="USER_UPDATE">User Updates</MenuItem>
                            <MenuItem value="CURRENCY_UPDATE">Currency Updates</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Target Type"
                            value={filters.targetType}
                            onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
                            size="small"
                        >
                            <MenuItem value="">All Targets</MenuItem>
                            <MenuItem value="User">User</MenuItem>
                            <MenuItem value="MarketData">Market Data</MenuItem>
                            <MenuItem value="Currency">Currency</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            {/* Logs Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 5, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: alpha(navyColor, 0.02) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: navyColor }}>Action</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: navyColor }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: navyColor }}>Target</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: navyColor }}>IP Address</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: navyColor }}>Timestamp</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: navyColor }} align="right">Details</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {logs.map((log) => (
                            <TableRow key={log.id} sx={{ '&:hover': { bgcolor: alpha(navyColor, 0.01) } }}>
                                <TableCell>
                                    <Chip
                                        label={log.action}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(getActionColor(log.action), 0.1),
                                            color: getActionColor(log.action),
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            borderRadius: 1
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{log.user?.username || 'System'}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{log.targetType}</Typography>
                                    {log.targetId && <Typography variant="caption" color="text.secondary">ID: {log.targetId}</Typography>}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{log.ipAddress || 'Unknown'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{new Date(log.createdAt).toLocaleString()}</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="View JSON Changes">
                                        <IconButton size="small" sx={{ color: navyColor }}>
                                            <ViewIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                />
            </TableContainer>
        </Box>
    );
}
