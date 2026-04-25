'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import styles from './dashboard.module.css'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [announcements, setAnnouncements] = useState<any[]>([])
    const [marketUpdates, setMarketUpdates] = useState<any[]>([])

    useEffect(() => {
        // Mock data fetching
        setAnnouncements([
            { id: 1, title: 'System Upgrade Notice', date: '2025-11-25', priority: 'high' },
            { id: 2, title: 'New API Version Released', date: '2025-11-24', priority: 'medium' },
            { id: 3, title: 'Holiday Maintenance Schedule', date: '2025-11-22', priority: 'low' },
        ]);
        setMarketUpdates([
            { name: 'Sesame Gadaref', date: '2025-11-25' },
            { name: 'Acacia Senegal', date: '2025-11-25' },
            { name: 'Cotton', date: '2025-11-24' },
        ]);
    }, [])

    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Market Value',
                data: [1200, 1250, 1230, 1280, 1300, 1320],
                borderColor: '#1B1464',
                backgroundColor: 'rgba(27, 20, 100, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ]
    }

    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
    }

    if (status === 'loading') {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        router.push('/login')
        return null
    }

    const statItems = [
        { title: 'Total Balance', value: '$24,500' },
        { title: 'Active Trades', value: '14 Active' },
        { title: 'Total Orders', value: '1,240' },
        { title: 'Network', value: '34 Partners' },
    ]

    return (
        <div>
            <header className={styles.mainContentHeader}>
                <h1 className={styles.mainContentTitle}>Dashboard</h1>
                <p className={styles.mainContentSubtitle}>Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!</p>
            </header>

            <div className={styles.dashboardGrid}>
                {statItems.map(item => (
                    <div key={item.title} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>{item.title}</h2>
                        </div>
                        <div className={styles.cardContent}>
                            <p>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.dashboardGrid} style={{ marginTop: '2rem' }}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Market Analysis</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <div className={styles.chartContainer}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Recent Updates</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <ul className={styles.recentUpdatesList}>
                            {marketUpdates.map((item, idx) => (
                                <li key={idx}>
                                    {item.name} - {item.date}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Announcements</h2>
                    </div>
                    <div className={styles.cardContent}>
                        <ul className={styles.announcementsList}>
                            {announcements.map(item => (
                                <li key={item.id}>
                                    {item.title} - {item.date}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
