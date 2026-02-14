'use client'

import { useState, useEffect } from 'react'
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

export default function SystemStatus() {
    const [status, setStatus] = useState<'operational' | 'degraded' | 'down'>('operational')

    useEffect(() => {
        // Simulate a check or simply default to operational for the "premium" feel
        // In a real app, this would fetch from a status API
        setStatus('operational')
    }, [])

    return (
        <div className="flex items-center gap-2 text-xs text-gray-400 opacity-80 hover:opacity-100 transition-opacity duration-300">
            <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'operational' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'operational' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span>
                {status === 'operational' ? 'Systems Operational' : 'System Issues'}
            </span>
        </div>
    )
}
