'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import MarketDataTable from '@/components/MarketDataTable'
import CurrencyCards from '@/components/CurrencyCards'
import GallerySlider from '@/components/GallerySlider'
import AnnouncementsSection from '@/components/AnnouncementsSection'
import PremiumPromoSection from '@/components/PremiumPromoSection'
import PartnersSection from '@/components/PartnersSection'

interface MarketTickerItem {
  id: number
  name: string
  value: number
  trend: number
}

export default function Home() {
  const [tickerData, setTickerData] = useState<MarketTickerItem[]>([])

  useEffect(() => {
    async function fetchTickerData() {
      try {
        const response = await fetch('/api/market-data')
        if (response.ok) {
          const data = await response.json()
          setTickerData(data)
        }
      } catch (error) {
        console.error('Failed to fetch ticker data', error)
      }
    }
    fetchTickerData()
  }, [])

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero/hero.webp"
        >
          {/* <source src="/videos/bg_vid.mp4" type="video/mp4" /> */}
          {/* Fallback handled by CSS if video fails or poster is shown */}
        </video>
        <div className="hero-content">
          <div className="hero-brand">
            <h1 className="brand-title">SudaStock</h1>
            <div className="brand-logo-icon">
              <Image
                src="/images/branding/logo.png"
                alt="SudaStock Logo"
                width={120}
                height={120}
                className="hero-logo-img"
                priority
              />
            </div>
            <h2 className="brand-arabic">سودا ستوك</h2>
          </div>

          <h1 className="hero-main-title">Premium Sudanese Agricultural Commodities</h1>
          <p className="hero-subtitle">Access real-time market data, global price benchmarks, and direct sourcing from Sudan's richest agricultural hubs.</p>

          <div className="hero-actions">
            <Link href="/register" className="hero-btn hero-btn-primary">
              Begin Trading
            </Link>
            <Link href="/market-data" className="hero-btn hero-btn-secondary">
              Market Insights
            </Link>
          </div>
        </div>
      </section>

      {/* Price Ticker Section */}
      <div className="price-ticker-wrapper">
        <div className="ticker-label">
          LIVE MARKET <span className="pulse-dot"></span>
        </div>
        <div className="price-ticker">
          <div className="ticker-track">
            {/* Multi-duplicate data for smoother infinite scroll on wide screens */}
            {[...tickerData, ...tickerData, ...tickerData].map((item, index) => (
              <Link
                key={`${item.id}-${index}`}
                href={`/market-data?product=${item.id}`}
                className="ticker-item"
                style={{ textDecoration: 'none' }}
              >
                <span className="product-name">{item.name}</span>
                <span className="price">
                  <span className="currency-symbol">$</span>
                  <span className="price-value">{Number(item.value).toFixed(2)}</span>
                </span>
                <div className={`trend-tag ${item.trend > 0 ? 'up' : item.trend < 0 ? 'down' : 'neutral'}`}>
                  {item.trend > 0 ? '+' : ''}{item.trend}%
                  <span className="trend-icon">
                    {item.trend > 0 ? '↗' : item.trend < 0 ? '↘' : '→'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Market Data Section */}
      <MarketDataTable />

      {/* Currency Data Section */}
      {/* Currency Cards Section */}
      <CurrencyCards />

      {/* Smart Price Alerts Promo - High End Restyle */}
      <section className="premium-alerts-section">
        <div className="container">
          <div className="premium-alert-glass">
            <div className="alert-glow"></div>
            <div className="alert-content-wrapper">
              <div className="alert-visual">
                <div className="bell-container">
                  <i className="fas fa-bell bounce-on-hover"></i>
                  <div className="notification-ring"></div>
                </div>
              </div>
              <div className="alert-text-content">
                <span className="premium-badge">REAL-TIME INTELLIGENCE</span>
                <h3>NEVER MISS A MARKET MOVE</h3>
                <p>Stay ahead of global price shifts. Set custom target alerts for your preferred commodities and receive instant push notifications the moment the market moves in your favor.</p>
                <div className="alert-features">
                  <span><i className="fas fa-check-circle"></i> SMS & Push</span>
                  <span><i className="fas fa-check-circle"></i> Target Price Triggers</span>
                  <span><i className="fas fa-check-circle"></i> History Tracking</span>
                </div>
              </div>
              <div className="alert-action-premium">
                <Link href="/market-data" className="premium-btn-gold">
                  Setup My Alerts <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Promo Section */}
      <PremiumPromoSection />

      {/* Gallery Slider Section */}
      <GallerySlider />





      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content" style={{ margin: '1rem 1rem 1rem 2rem', paddingLeft: '1.5rem' }}>
            <h2>READY TO SOURCE PREMIUM SUDANESE PRODUCTS?</h2>
            <p>Contact us today to discuss your requirements and get a personalized quote.</p>
            <div className="cta-buttons">
              <Link href="/quote" className="btn btn-primary">Request Quote</Link>
              <Link href="/sample" className="btn btn-secondary">Request Sample</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Connect With Us Section */}
      <section className="connect-section">
        <div className="connect-background">
          <div className="connect-content">
            <h1 style={{ color: 'white' }}>CONNECT WITH US</h1>
            <h1><span className="highlight">ANYWHERE</span>, <span className="highlight">ANYTIME</span>.</h1>
            <p>
              By taking just a few simple steps, you'll gain access to a
              comprehensive data platform that enhances your
              decision-making and provides a deeper understanding of
              the market. With timely, accurate information at your
              fingertips, you'll be equipped to optimize your trading
              and uncover opportunities previously beyond reach.
            </p>

            <div className="features-cards">
              <Link href="/register" className="feature-card" style={{ textDecoration: 'none' }}>
                <p>Be apart of SudaStock and</p>
                <h3><span className="highlight">Register</span> with us</h3>
              </Link>

              <Link href="/market-data" className="feature-card" style={{ textDecoration: 'none' }}>
                <p>Explore our trade <span className="highlight">data</span> and perform your own</p>
                <h3><span className="highlight">Analysis</span></h3>
              </Link>

              <Link href="/products" className="feature-card" style={{ textDecoration: 'none' }}>
                <p>Formulate your</p>
                <h3><span className="highlight">Strategies</span> and take action</h3>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <AnnouncementsSection />

      {/* Partners Section */}
      <PartnersSection />
    </div>
  )
}
