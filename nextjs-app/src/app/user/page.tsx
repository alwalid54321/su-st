'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function UserDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1B1464]"></div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-[#1B1464] to-[#2d1f7a] rounded-2xl shadow-lg p-8 mb-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-[#786D3C] opacity-20 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2">
                            Welcome back, {session.user?.name || 'User'}!
                        </h1>
                        <p className="text-blue-100 max-w-2xl">
                            Access your personalized dashboard to manage your account, view market data, and explore our premium products.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 h-fit">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="h-16 w-16 rounded-full bg-[#786D3C]/10 text-[#786D3C] flex items-center justify-center text-2xl font-bold border-2 border-[#786D3C]/20">
                                {session.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-[#1B1464]">My Profile</h2>
                                <p className="text-sm text-gray-500">{session.user?.email}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Account Status</p>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                            </div>
                            <button className="w-full py-2.5 px-4 border border-[#1B1464] text-[#1B1464] rounded-xl hover:bg-[#1B1464] hover:text-white transition-all duration-300 font-semibold text-sm shadow-sm hover:shadow-md">
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Link href="/market-data" className="group block p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="h-12 w-12 rounded-xl bg-[#1B1464]/10 text-[#1B1464] flex items-center justify-center mb-4 group-hover:bg-[#1B1464] group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-[#1B1464] mb-2 group-hover:text-[#786D3C] transition-colors">Market Data</h3>
                            <p className="text-gray-500 text-sm">View real-time market prices and trends for agricultural commodities.</p>
                        </Link>

                        <Link href="/products" className="group block p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="h-12 w-12 rounded-xl bg-[#786D3C]/10 text-[#786D3C] flex items-center justify-center mb-4 group-hover:bg-[#786D3C] group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-[#1B1464] mb-2 group-hover:text-[#786D3C] transition-colors">Browse Products</h3>
                            <p className="text-gray-500 text-sm">Explore our catalog of premium Sudanese agricultural products.</p>
                        </Link>

                        <Link href="/contact" className="group block p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-[#1B1464] mb-2 group-hover:text-[#786D3C] transition-colors">Contact Support</h3>
                            <p className="text-gray-500 text-sm">Get in touch with our team for inquiries or assistance.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
