import ThemeRegistry from '@/components/ThemeRegistry'
import Providers from '@/components/Providers'
import ConditionalNavbar from '@/components/ConditionalNavbar'
import ConditionalWrapper from '@/components/ConditionalWrapper'
import ErrorBoundary from '@/components/ErrorBoundary'
import StyledJsxRegistry from '@/lib/styled-jsx-registry'
import './globals.css'

import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111827',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.sudastock.com'),
  title: {
    default: "SudaStock - Sudan's Premier Agricultural Commodities Platform",
    template: '%s | SudaStock',
  },
  description: 'Connecting local producers with global markets through transparent data and reliable logistics. Real-time prices for Sesame, Gum Arabic, Peanuts, and more.',
  keywords: ['Sudan', 'Agriculture', 'Commodities', 'Sesame', 'Gum Arabic', 'Peanuts', 'Market Prices', 'Export', 'Logistics'],
  authors: [{ name: 'SudaStock Team' }],
  creator: 'SudaStock',
  publisher: 'SudaStock',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "SudaStock - Sudan's Agricultural Market Data",
    description: 'Real-time market data, logistics, and insights for Sudanese agricultural exports.',
    url: 'https://www.sudastock.com',
    siteName: 'SudaStock',
    images: [
      {
        url: '/images/branding/logo-icon.png', // Fallback to logo as requested
        width: 800,
        height: 600,
        alt: 'SudaStock Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SudaStock',
    description: 'The definitive source for Sudanese agricultural market data.',
    images: ['/images/branding/logo-icon.png'], // Fallback to logo
  },
  icons: {
    icon: '/images/branding/logo-icon.png',
    shortcut: '/images/branding/logo-icon.png',
    apple: '/images/branding/logo-icon.png',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Comfortaa:wght@400;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                  const isHttps = window.location.protocol === 'https:';
                  
                  if (isHttps || isLocalhost) {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('SW Registered:', registration.scope);
                      },
                      function(err) {
                        console.error('SW Failed:', err);
                      }
                    );
                  }
                });
              }
            `
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "SudaStock",
              "url": "https://www.sudastock.com",
              "logo": "https://www.sudastock.com/images/branding/logo-icon.png",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+971 502 330 481",
                "contactType": "Customer Service"
              },
              "sameAs": [
                "#"
              ]
            })
          }}
        />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <StyledJsxRegistry>
          <ThemeRegistry>
            <Providers>
              <ConditionalNavbar />
              <ConditionalWrapper>
                <ErrorBoundary>
                  <main suppressHydrationWarning>
                    {children}
                  </main>
                </ErrorBoundary>
              </ConditionalWrapper>
            </Providers>
          </ThemeRegistry>
        </StyledJsxRegistry>
      </body>
    </html>
  )
}
