'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const QuoteContent = () => {
    const searchParams = useSearchParams()
    const productParam = searchParams.get('product')

    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        email: '',
        companyName: '',
        country: '',
        product: '',
        productVariation: '',
        quantity: '',
        port: '',
        services: '',
        currency: '',
        specifications: '',
        note: '',
        _gotcha: '' // Honeypot field
    })

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [trackingNumber, setTrackingNumber] = useState('')
    const [products, setProducts] = useState<any[]>([])
    const [variations, setVariations] = useState<any[]>([])
    const [ports, setPorts] = useState<any[]>([])
    const [currencies, setCurrencies] = useState<any[]>([])
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const fetchData = async () => {
            try {
                const [prodRes, varRes, portRes, currRes] = await Promise.all([
                    fetch('/api/market-data'),
                    fetch('/api/variations'),
                    fetch('/api/ports'),
                    fetch('/api/currencies')
                ])

                if (prodRes.ok) setProducts(await prodRes.json())
                if (varRes.ok) setVariations(await varRes.json())
                if (portRes.ok) setPorts(await portRes.json())
                if (currRes.ok) setCurrencies(await currRes.json())
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
            // Check if it's a valid tracking format or just show the professional message
            alert(`Order ${trackingNumber} is currently: PROCESSED. \n\nPlease check back in 24 hours for shipping updates.`)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            if (!response.ok) {
                throw new Error('Failed to submit quote request')
            }

            setLoading(false)
            setSuccess(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })

            // Reset form
            setFormData({
                name: '',
                contactNumber: '',
                email: '',
                companyName: '',
                country: '',
                product: '',
                productVariation: '',
                quantity: '',
                port: '',
                services: '',
                currency: '',
                specifications: '',
                note: '',
                _gotcha: ''
            })

        } catch (error) {
            console.error('Quote submission error:', error)
            setLoading(false)
            alert('Failed to send request. Please try again.')
        }
    }

    return (
        <div className="quote-container bg-pattern-container">
            <div className="quote-content">
                <div className="quote-form-section">
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

                    {!success ? (
                        <>
                            <p className="subtitle">Reach out and request for your personalized</p>
                            <h1>QUOTATIONS</h1>

                            <form onSubmit={handleSubmit} className="quote-form">
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
                                        name="contactNumber"
                                        placeholder="Contact number"
                                        required
                                        value={formData.contactNumber}
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

                                <div className="form-group" style={{ animationDelay: '0.8s', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="number"
                                        name="quantity"
                                        placeholder="Quantity"
                                        required
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        style={{ flex: 1 }}
                                    />
                                    <span style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>Tons</span>
                                </div>

                                <div className="form-group" style={{ animationDelay: '0.9s' }}>
                                    <select
                                        name="port"
                                        required
                                        value={formData.port}
                                        onChange={handleChange}
                                    >
                                        <option value="">Choose the Port</option>
                                        {ports.map((p) => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group" style={{ animationDelay: '1.0s' }}>
                                    <select
                                        name="services"
                                        value={formData.services}
                                        onChange={handleChange}
                                    >
                                        <option value="">Add on Services</option>
                                        <option value="Logistic">Logistic & Shipping</option>
                                        <option value="Packaging">Special Packaging</option>
                                        <option value="Quality Check">Third-party Quality Check</option>
                                        <option value="Insurance">Export Insurance</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ animationDelay: '1.1s' }}>
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                    >
                                        <option value="">Choose currency</option>
                                        {currencies.map((c) => (
                                            <option key={c.id} value={c.code}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group full-width" style={{ animationDelay: '1.2s' }}>
                                    <textarea
                                        name="specifications"
                                        placeholder="Product Specifications"
                                        rows={3}
                                        value={formData.specifications}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <div className="form-group full-width" style={{ animationDelay: '1.3s' }}>
                                    <textarea
                                        name="note"
                                        placeholder="Additional Notes"
                                        rows={3}
                                        value={formData.note}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <button type="submit" className={`submit-btn ${loading ? 'submitting' : ''}`} disabled={loading}>
                                    {loading ? 'SENDING...' : 'SUBMIT REQUEST'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="success-message">
                            <div className="success-icon">✓</div>
                            <h3>Quote Request Submitted!</h3>
                            <p>Thank you for your interest in our products. Our team will review your request and get back to you with a personalized quote shortly.</p>
                            <button onClick={() => setSuccess(false)} className="contact-btn" style={{ marginTop: '20px' }}>Request Another Quote</button>
                        </div>
                    )}
                </div>

                <div className="info-section">
                    <div className="info-box">
                        <h3>Why Request a Quote?</h3>
                        <p>Get personalized pricing based on your specific needs, quantity, and shipping requirements.</p>
                        <p>Our team will work with you to ensure you get the best value for your order.</p>
                        <Link href="/contact" className="contact-btn">CONTACT US</Link>
                    </div>
                </div>

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

                .quote-content {
                    display: flex;
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                    font-family: inherit;
                }

                .quote-form-section {
                    flex: 2;
                    padding: 50px;
                    position: relative;
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

                .subtitle {
                    color: var(--accent);
                    font-size: 1.1rem;
                    margin-bottom: 5px;
                    font-weight: 500;
                    animation: fadeInDown 0.6s ease-out forwards;
                }

                .quote-form-section h1 {
                    color: var(--primary-dark);
                    font-size: 3rem;
                    margin-bottom: 35px;
                    font-weight: 800;
                    letter-spacing: -1px;
                    animation: fadeInDown 0.8s ease-out forwards;
                }

                .quote-form {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
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

                .form-group textarea {
                    min-height: 120px;
                    resize: vertical;
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
                    margin-top: 15px;
                    grid-column: 1 / -1;
                    animation: fadeInUp 0.5s ease-out forwards;
                    animation-delay: 1.4s;
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

                .info-section {
                    flex: 1;
                    background: linear-gradient(135deg, var(--primary-dark) 0%, #2a1f8a 100%);
                    color: white;
                    padding: 50px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                }

                .info-box {
                    text-align: center;
                    animation: fadeIn 1s ease-out forwards;
                }

                .info-box h3 {
                    font-size: 2rem;
                    margin-bottom: 20px;
                    font-weight: 700;
                    color: white;
                }

                .info-box p {
                    font-size: 1.1rem;
                    margin-bottom: 30px;
                    color: rgba(255, 255, 255, 0.85);
                    line-height: 1.6;
                }

                .contact-btn {
                    background-color: var(--accent);
                    color: white;
                    border: none;
                    padding: 14px 30px;
                    font-size: 1rem;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 700;
                    text-decoration: none;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .contact-btn:hover {
                    background-color: white;
                    color: var(--primary-dark);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
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

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
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

                @media (max-width: 992px) {
                    .quote-content {
                        flex-direction: column;
                    }
                    .info-section {
                        border-left: none;
                        border-top: 1px solid rgba(255, 255, 255, 0.1);
                    }
                }

                @media (max-width: 600px) {
                    .quote-form {
                        grid-template-columns: 1fr;
                    }
                    .quote-form-section h1 {
                        font-size: 2.2rem;
                    }
                    .quote-form-section {
                        padding: 30px 20px;
                    }
                }
            `}</style>
        </div>
    )
}

export default function QuotePage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
            <QuoteContent />
        </Suspense>
    )
}