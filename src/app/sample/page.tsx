'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

const SampleContent = () => {
    const searchParams = useSearchParams()
    const productParam = searchParams.get('product')

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        companyName: '',
        country: '',
        product: '',
        productVariation: '',
        shippingMethod: '',
        note: '',
        _gotcha: '' // Honeypot field
    })

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [trackingNumber, setTrackingNumber] = useState('')
    const [products, setProducts] = useState<any[]>([])
    const [variations, setVariations] = useState<any[]>([])
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const fetchData = async () => {
            try {
                const [prodRes, varRes] = await Promise.all([
                    fetch('/api/market-data'),
                    fetch('/api/variations')
                ])

                if (prodRes.ok) setProducts(await prodRes.json())
                if (varRes.ok) setVariations(await varRes.json())
            } catch (err) {
                console.error('Failed to fetch form options:', err)
            }
        }
        fetchData()

        if (productParam) {
            setFormData(prev => ({ ...prev, product: productParam }))
        }
    }, [productParam])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleTrackOrder = (e: React.FormEvent) => {
        e.preventDefault()
        if (trackingNumber) {
            alert(`SudaStock Tracking: Sample Request ${trackingNumber} is being processed.\nStatus: PENDING QUALITY CHECK.\nLocation: Port Sudan Logistics Hub.`)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/sample', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Failed to submit sample request')
            }

            setLoading(false)
            setSuccess(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })

            // Reset form
            setFormData({
                name: '',
                phone: '',
                email: '',
                companyName: '',
                country: '',
                product: '',
                productVariation: '',
                shippingMethod: '',
                note: '',
                _gotcha: ''
            })

        } catch (error) {
            console.error('Sample submission error:', error)
            setLoading(false)
            alert('Failed to send request. Please try again.')
        }
    }

    return (
        <div className="sample-container bg-pattern-container">
            <div className="sample-content">
                <div className="tracking-wrapper">
                    <form onSubmit={handleTrackOrder} className="tracking-form">
                        <input
                            type="text"
                            placeholder="Tracking #"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                        <button type="submit">Track order</button>
                    </form>
                </div>

                <div className="sample-header">
                    <h1>Experience it for yourself—request a sample today</h1>
                    <h2>SAMPLE</h2>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="sample-form">
                        {/* Honeypot Field */}
                        <div style={{ display: 'none' }} aria-hidden="true">
                            <label htmlFor="_gotcha">Do not fill this field</label>
                            <input
                                type="text"
                                name="_gotcha"
                                value={formData._gotcha}
                                onChange={handleChange}
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        <div className="form-group" style={{ animationDelay: '0.1s' }}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group" style={{ animationDelay: '0.2s' }}>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Contact number"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group" style={{ animationDelay: '0.3s' }}>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group" style={{ animationDelay: '0.4s' }}>
                            <input
                                type="text"
                                name="companyName"
                                placeholder="Company Name"
                                required
                                value={formData.companyName}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group" style={{ animationDelay: '0.5s' }}>
                            <select
                                name="country"
                                required
                                value={formData.country}
                                onChange={handleChange}
                            >
                                <option value="">Select Country</option>
                                <option value="SD">Sudan</option>
                                <option value="IN">India</option>
                                <option value="CN">China</option>
                                <option value="AE">United Arab Emirates</option>
                                <option value="TR">Turkey</option>
                                <option value="US">United States</option>
                                <option value="UK">United Kingdom</option>
                                <option value="SA">Saudi Arabia</option>
                                <option value="EG">Egypt</option>
                            </select>
                        </div>
                        <div className="form-group" style={{ animationDelay: '0.6s' }}>
                            <select
                                name="product"
                                required
                                value={formData.product}
                                onChange={handleChange}
                            >
                                <option value="">Choose Product</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ animationDelay: '0.7s' }}>
                            <select
                                name="productVariation"
                                value={formData.productVariation}
                                onChange={handleChange}
                            >
                                <option value="">Product Variation</option>
                                {variations.map((v) => (
                                    <option key={v.id} value={v.name}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group" style={{ animationDelay: '0.8s' }}>
                            <select
                                name="shippingMethod"
                                required
                                value={formData.shippingMethod}
                                onChange={handleChange}
                            >
                                <option value="">Shipping Method</option>
                                <option value="Air Freight">Air Freight</option>
                                <option value="Sea Freight">Sea Freight</option>
                                <option value="Land Transport">Land Transport</option>
                                <option value="Express Delivery">Express Delivery</option>
                            </select>
                        </div>
                        <div className="form-group full-width" style={{ animationDelay: '0.9s' }}>
                            <textarea
                                name="note"
                                placeholder="Additional Notes"
                                rows={4}
                                value={formData.note}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                        <button type="submit" className={`submit-btn ${loading ? 'submitting' : ''}`} disabled={loading} style={{ animationDelay: '1.0s' }}>
                            {loading ? 'SENDING...' : 'SEND REQUEST'}
                        </button>
                    </form>
                ) : (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h3>Sample Request Submitted!</h3>
                        <p>Thank you for your interest in our products. We'll get back to you shortly with your sample details.</p>
                        <button onClick={() => setSuccess(false)} className="submit-btn" style={{ marginTop: '20px', opacity: 1, width: 'auto', display: 'inline-block' }}>Request Another Sample</button>
                    </div>
                )}

                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}
            </div>

            <style jsx>{`
                :root {
                    --accent: #786D3C;
                    --primary-dark: #1B1464;
                    --success-color: #28a745;
                }

                .bg-pattern-container {
                    background: linear-gradient(135deg, rgba(27, 20, 100, 0.08) 0%, rgba(120, 109, 60, 0.12) 100%);
                    position: relative;
                    overflow: hidden;
                    padding: 80px 20px;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                }

                .bg-pattern-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-image: 
                        radial-gradient(circle at 20% 30%, rgba(120, 109, 60, 0.15) 0%, transparent 8%),
                        radial-gradient(circle at 80% 70%, rgba(27, 20, 100, 0.1) 0%, transparent 8%);
                    background-size: 30px 30px;
                    opacity: 0.5;
                    pointer-events: none;
                    z-index: 0;
                }

                .bg-pattern-container::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    opacity: 0.02;
                    pointer-events: none;
                    z-index: 0;
                }

                .sample-content {
                    max-width: 1000px;
                    width: 100%;
                    margin: 0 auto;
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    padding: 50px;
                    position: relative;
                    z-index: 1;
                }

                .tracking-wrapper {
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: flex-end;
                }

                .tracking-form {
                    display: flex;
                    gap: 10px;
                    background: #f4f4f4;
                    padding: 8px;
                    border-radius: 8px;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
                }

                .tracking-form input {
                    border: none;
                    background: transparent;
                    padding: 8px 12px;
                    font-size: 0.9rem;
                    color: var(--primary-dark);
                    width: 150px;
                    outline: none;
                }

                .tracking-form button {
                    background: var(--primary-dark);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .tracking-form button:hover {
                    background: var(--accent);
                }

                .sample-header {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .sample-header h1 {
                    color: var(--primary-dark);
                    font-size: 1.8rem;
                    margin-bottom: 15px;
                    font-weight: 600;
                    animation: fadeInDown 0.8s ease-out forwards;
                }

                .sample-header h2 {
                    color: var(--accent);
                    font-size: 3rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    animation: fadeInDown 0.6s ease-out forwards;
                }

                .sample-form {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 25px;
                }

                .form-group {
                    position: relative;
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                }

                .form-group.full-width {
                    grid-column: 1 / -1;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 14px 18px;
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background-color: #fcfcfc;
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    border-color: var(--accent);
                    outline: none;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(120, 109, 60, 0.1);
                    background-color: white;
                }

                .submit-btn {
                    background-color: var(--primary-dark);
                    color: white;
                    border: none;
                    padding: 16px 35px;
                    font-size: 1.1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 700;
                    grid-column: 1 / -1;
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                }

                .submit-btn:hover {
                    background-color: var(--accent);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(27, 20, 100, 0.2);
                }

                .submit-btn:disabled {
                    cursor: not-allowed;
                    opacity: 0.7;
                    transform: none;
                    box-shadow: none;
                }

                .submit-btn.submitting {
                    background: linear-gradient(90deg, var(--primary-dark), var(--accent), var(--primary-dark));
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                    pointer-events: none;
                }

                .success-message {
                    text-align: center;
                    padding: 40px 0;
                    animation: fadeInUp 0.6s ease-out forwards;
                }

                .success-icon {
                    color: var(--success-color);
                    font-size: 4rem;
                    margin-bottom: 20px;
                    animation: pulse 1.5s infinite;
                }

                .success-message h3 {
                    color: var(--primary-dark);
                    font-size: 1.8rem;
                    margin-bottom: 15px;
                    font-weight: 700;
                }

                .success-message p {
                    color: #555;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 100;
                }

                .loading-spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid rgba(27, 20, 100, 0.1);
                    border-radius: 50%;
                    border-top-color: var(--primary-dark);
                    animation: spin 1s linear infinite;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }

                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 600px) {
                    .sample-form {
                        grid-template-columns: 1fr;
                    }
                    
                    .submit-btn {
                        grid-column: 1;
                    }
                    
                    .full-width {
                        grid-column: 1;
                    }
                    .sample-header h2 {
                        font-size: 2.2rem;
                    }
                    .sample-content {
                        padding: 30px 20px;
                    }
                }
            `}</style>
        </div>
    )
}

export default function SamplePage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <SampleContent />
        </Suspense>
    )
}
