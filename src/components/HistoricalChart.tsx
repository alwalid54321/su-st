'use client';

import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

// Define the shape of the data we expect
interface HistoryDataPoint {
    date: string;
    value: number;
}

interface HistoricalChartProps {
    dataUrl?: string; // Optional URL if we want to fetch dynamic data per product
}

export default function HistoricalChart({ dataUrl }: HistoricalChartProps) {
    const [data, setData] = useState<HistoryDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('1M'); // '1M', '3M', '6M', '1Y'

    // Placeholder data generator to show off the visual
    const generateMockData = (months: number) => {
        const mock: HistoryDataPoint[] = [];
        const now = new Date();
        let baseValue = 1350; // Base value for e.g. Sesame

        for (let i = months * 30; i >= 0; i--) {
            // Create interesting variance
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            baseValue += (Math.random() - 0.48) * 15; // Random walk with slight upward drift

            mock.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: Math.round(baseValue),
            });
        }
        return mock;
    };

    useEffect(() => {
        // In a real scenario, fetch from the API. We'll simulate fetching archive data.
        const loadData = async () => {
            setLoading(true);
            try {
                if (dataUrl) {
                    const res = await fetch(`${dataUrl}?range=${timeRange}`);
                    const json = await res.json();
                    if (json.length > 0) {
                        setData(json);
                        return;
                    }
                }

                // Fallback to mock data if no URL or empty API result (no archives yet)
                const days = timeRange === '1M' ? 1 : timeRange === '3M' ? 3 : timeRange === '6M' ? 6 : 12;
                // reduce points to avoid clutter, maybe 1 point per day
                const mock = generateMockData(days);
                // sample data
                const sampled = mock.filter((_, idx) => idx % (days > 1 ? (days) : 1) === 0);
                setData(sampled);
            } catch (error) {
                console.error('Error fetching chart data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [timeRange, dataUrl]);

    return (
        <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1B1464' }}>
                    Market Trends Overview
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel id="time-range-label">Time Range</InputLabel>
                    <Select
                        labelId="time-range-label"
                        value={timeRange}
                        label="Time Range"
                        onChange={(e) => setTimeRange(e.target.value)}
                        sx={{ borderRadius: 2 }}
                    >
                        <MenuItem value="1M">1 Month</MenuItem>
                        <MenuItem value="3M">3 Months</MenuItem>
                        <MenuItem value="6M">6 Months</MenuItem>
                        <MenuItem value="1Y">1 Year</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {loading ? (
                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-spinner fa-spin" style={{ color: '#D4AF37', fontSize: '2rem' }}></i>
                </Box>
            ) : (
                <Box sx={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                formatter={(value: any) => [`$${value}`, 'Price (USD)']}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#D4AF37"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 8, fill: '#1B1464', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            )}
        </Box>
    );
}
