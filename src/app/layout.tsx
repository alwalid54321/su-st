import ThemeRegistry from '@/components/ThemeRegistry'
import Providers from '@/components/Providers'
import ConditionalNavbar from '@/components/ConditionalNavbar'
import ConditionalWrapper from '@/components/ConditionalWrapper'
import ErrorBoundary from '@/components/ErrorBoundary'
import StyledJsxRegistry from '@/lib/styled-jsx-registry'
import './globals.css'

export const metadata = {
  title: "SudaStock - Sudan's Premier Agricultural Commodities Platform",
  description: 'Connecting local producers with global markets through transparent data and reliable logistics.',
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
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
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
