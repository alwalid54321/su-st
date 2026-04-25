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
import { useTranslations } from 'next-intl'

interface MarketTickerItem {
  id: number
  name: string
  value: number
  trend: number
}

export default function Home() {
  const [tickerData, setTickerData] = useState<MarketTickerItem[]>([])
  const t = useTranslations()

  useEffect(() => {
    const eventSource = new EventSource('/api/market-data/stream')

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setTickerData(data)
      } catch (error) {
        console.error('Failed to parse SSE data', error)
      }
    }

    eventSource.onerror = (error) => {
      // Silently handle standard SSE disconnects to prevent console noise
      // console.debug('EventSource status:', eventSource.readyState)
    }

    return () => {
      eventSource.close()
    }
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
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-actions">
            <Link href="/register" className="hero-btn hero-btn-primary">
              {t('Begin Trading')}
            </Link>
            <Link href="/market-data" className="hero-btn hero-btn-secondary">
              {t('Market Insights')}
            </Link>
          </div>
        </div>
      </section>

      {/* Price Ticker Section */}
      <div className="price-ticker-wrapper">
        <div className="ticker-label">
          {t('LIVE MARKET')} <span className="pulse-dot"></span>
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
      <CurrencyCards />

      {/* Smart Price Alerts Promo */}
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
                <span className="premium-badge">{t('REAL-TIME INTELLIGENCE')}</span>
                <h3>{t('NEVER MISS A MARKET MOVE')}</h3>
                <p>{t('stayAheadAlerts')}</p>
                <div className="alert-features">
                  <span><i className="fas fa-check-circle"></i> {t('SMS & Push')}</span>
                  <span><i className="fas fa-check-circle"></i> {t('Target Price Triggers')}</span>
                  <span><i className="fas fa-check-circle"></i> {t('History Tracking')}</span>
                </div>
              </div>
              <div className="alert-action-premium">
                <Link href="/market-data" className="premium-btn-gold">
                  {t('Setup My Alerts')} <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Promo Section */}
      <PremiumPromoSection />

      {/* Announcements Section */}
      <AnnouncementsSection />

      {/* Gallery Slider Section */}
      <GallerySlider />

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content" style={{ margin: '1rem 1rem 1rem 2rem', paddingLeft: '1.5rem' }}>
            <h2>{t('READY TO SOURCE PREMIUM SUDANESE PRODUCTS?')}</h2>
            <p>{t('contactUsToday')}</p>
            <div className="cta-buttons">
              <Link href="/quote" className="btn btn-primary">{t('Request Quote')}</Link>
              <Link href="/sample" className="btn btn-secondary">{t('Request Sample')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Connect With Us Section */}
      <section className="connect-section">
        <div className="connect-background">
          <div className="connect-content">
            <h1 style={{ color: 'white' }}>{t('CONNECT WITH US')}</h1>
            <h1><span className="highlight">{t('ANYWHERE')}</span>, <span className="highlight">{t('ANYTIME')}</span>.</h1>
            <p>
              {t('byTakingSteps')}
            </p>

            <div className="features-cards">
              <Link href="/register" className="feature-card" style={{ textDecoration: 'none' }}>
                <p>{t('Be a part of SudaStock and')}</p>
                <h3><span className="highlight">{t('Register')}</span> {t('with us')}</h3>
              </Link>

              <Link href="/market-data" className="feature-card" style={{ textDecoration: 'none' }}>
                <p>{t('Explore our trade')} <span className="highlight">{t('data')}</span> {t('and perform your own')}</p>
                <h3><span className="highlight">{t('Analysis')}</span></h3>
              </Link>

              <Link href="/products" className="feature-card" style={{ textDecoration: 'none' }}>
                <p>{t('Formulate your')}</p>
                <h3><span className="highlight">{t('Strategies')}</span> {t('and take action')}</h3>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <PartnersSection />
    </div>
  )
}
