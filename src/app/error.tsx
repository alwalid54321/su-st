'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="error-page-container">
            <div className="error-background-glow top"></div>

            <div className="error-content">
                <div className="error-icon-wrapper">
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h1 className="error-title">Systems Interrupt</h1>
                <p className="error-message">
                    We've encountered an unexpected market shift. Our engineers are investigating the volatility.
                </p>

                <div className="error-actions-page">
                    <button onClick={() => reset()} className="error-btn-primary">
                        <i className="fas fa-redo"></i> Attempt Recovery
                    </button>
                    <Link href="/" className="error-btn-secondary">
                        Back to Safety
                    </Link>
                </div>
            </div>

            <style jsx>{`
        .error-page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d0d0d;
          padding: 2rem;
          position: relative;
          color: white;
          overflow: hidden;
        }

        .error-background-glow {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 70%);
          pointer-events: none;
          top: -300px;
          left: -300px;
        }

        .error-content {
          text-align: center;
          max-width: 500px;
          animation: fadeInUp 0.6s ease-out;
        }

        .error-icon-wrapper {
          font-size: 5rem;
          color: #dc2626;
          margin-bottom: 2rem;
          filter: drop-shadow(0 0 15px rgba(220, 38, 38, 0.3));
        }

        .error-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          letter-spacing: -0.5px;
        }

        .error-message {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin-bottom: 3rem;
        }

        .error-actions-page {
          display: flex;
          gap: 1.25rem;
          justify-content: center;
        }

        .error-btn-primary {
          background: #dc2626;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .error-btn-primary:hover {
          background: #ef4444;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(220, 38, 38, 0.2);
        }

        .error-btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s;
        }

        .error-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .error-actions-page { flex-direction: column; }
        }
      `}</style>
        </div>
    )
}
