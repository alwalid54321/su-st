'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import MarketDataTable from '@/components/MarketDataTable'
import CurrencyCards from '@/components/CurrencyCards'
import GallerySlider from '@/components/GallerySlider'
import AnnouncementsSection from '@/components/AnnouncementsSection'

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
          poster="/images/hero.jpg"
        >
          {/* <source src="/videos/bg_vid.mp4" type="video/mp4" /> */}
          {/* Fallback handled by CSS if video fails or poster is shown */}
        </video>
        <div className="hero-fallback"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-main-title">
            Sudan&#39;s Premier <br />
            <span style={{ color: 'var(--accent)' }}>Agricultural Commodities</span> Platform
          </h1>
          <p className="hero-subtitle">
            Connecting local producers with global markets through transparent data,
            reliable logistics, and real-time market insights.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="hero-btn hero-btn-primary">
              Get Started
            </Link>
            <Link href="/market-data" className="hero-btn hero-btn-secondary">
              View Market Data
            </Link>
          </div>
        </div>
      </section>

      {/* Price Ticker Section */}
      <div className="price-ticker-wrapper">
        <div className="price-ticker">
          <div className="ticker-track">
            {/* Duplicate data for infinite scroll effect */}
            {[...tickerData, ...tickerData].map((item, index) => (
              <div key={`${item.id}-${index}`} className="ticker-item">
                <span className="product-name">{item.name}</span>
                <span className="price">
                  <span className="currency-symbol">$</span>
                  <span className="price-value">{Number(item.value).toFixed(2)}</span>
                </span>
                <span className={`trend-arrow ${item.trend > 0 ? 'up' : item.trend < 0 ? 'down' : ''}`}>
                  {item.trend > 0 ? '↑' : item.trend < 0 ? '↓' : '→'} {Math.abs(item.trend)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Data Section */}
      <MarketDataTable />

      {/* Currency Data Section */}
      <CurrencyCards />

      {/* Gallery Slider Section */}
      <GallerySlider />

      {/* Announcements/News Section */}
      <AnnouncementsSection />

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
      <section className="partners-section">
        <div className="container">
          <div className="section-header">
            <h2 className="gradient-text">EXPERIENCE THE DIFFERENCE</h2>
            <h3>OUR TRUSTED PARTNERS</h3>
          </div>

          <div className="partners-grid">
            <div className="partner-logo">
              <Image src="/images/partners/partner1.jpg" alt="Shabour Sons Logistics" width={150} height={100} style={{ objectFit: 'contain' }} />
            </div>
            <div className="partner-logo">
              <Image src="/images/partners/partner2.jpg" alt="Pure Agri" width={150} height={100} style={{ objectFit: 'contain' }} />
            </div>
            <div className="partner-logo">
              <Image src="/images/partners/partner3.jpg" alt="Wadee" width={150} height={100} style={{ objectFit: 'contain' }} />
            </div>
            <div className="partner-logo">
              <Image src="/images/partners/partner4.jpg" alt="Altaif" width={150} height={100} style={{ objectFit: 'contain' }} />
            </div>
            <div className="partner-logo">
              <Image src="/images/partners/partner5.jpg" alt="WSG" width={150} height={100} style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
