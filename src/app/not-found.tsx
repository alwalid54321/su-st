'use client'

import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="error-page-container">
            <div className="error-background-glow top"></div>
            <div className="error-background-glow bottom"></div>

            <div className="error-content">
                <div className="error-code">404</div>
                <h1 className="error-title">Page Disappeared</h1>
                <p className="error-message">
                    The market data or page you're looking for seems to have moved or never existed in our trade history.
                </p>

                <div className="error-actions-page">
                    <Link href="/" className="error-btn-home">
                        <i className="fas fa-home"></i> Back to Home
                    </Link>
                    <Link href="/market-data" className="error-btn-secondary-page">
                        <i className="fas fa-chart-line"></i> View Markets
                    </Link>
                </div>
            </div>

            <style jsx>{`
        .error-page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a1f;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
          color: white;
        }

        .error-background-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(120, 109, 60, 0.1) 0%, transparent 70%);
          pointer-events: none;
        }

        .error-background-glow.top {
          top: -200px;
          left: -200px;
        }

        .error-background-glow.bottom {
          bottom: -200px;
          right: -200px;
        }

        .error-content {
          text-align: center;
          position: relative;
          z-index: 10;
          max-width: 600px;
          animation: fadeInUp 0.8s ease-out;
        }

        .error-code {
          font-size: 10rem;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, white 0%, #786D3C 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -5px;
        }

        .error-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          letter-spacing: -1px;
        }

        .error-message {
          font-size: 1.15rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 3rem;
        }

        .error-actions-page {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
        }

        .error-btn-home {
          background: #786D3C;
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 20px rgba(120, 109, 60, 0.2);
        }

        .error-btn-home:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(120, 109, 60, 0.4);
          background: #8a7d44;
        }

        .error-btn-secondary-page {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .error-btn-secondary-page:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-3px);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .error-code { font-size: 6rem; }
          .error-title { font-size: 1.75rem; }
          .error-actions-page { flex-direction: column; }
        }
      `}</style>
        </div>
    )
}
