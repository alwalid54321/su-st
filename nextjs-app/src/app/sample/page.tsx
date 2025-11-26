'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SampleContent() {
    const searchParams = useSearchParams()
    const productParam = searchParams.get('product')

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        companyName: '',
        country: '',
        product: '',
        shippingMethod: '',
        note: ''
    })

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (productParam) {
            setFormData(prev => ({ ...prev, product: productParam }))
        }
    }, [productParam])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call
        setTimeout(() => {
            setLoading(false)
            setSuccess(true)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 2000)
    }

    return (
        <div className="sample-container bg-pattern-container">
            <div className="sample-content">
                {!success ? (
                    <div className="sample-form-wrapper">
                        <div className="sample-header">
                            <h1>Experience it for yourself—request a sample today</h1>
                            <h2>SAMPLE</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="sample-form">
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
                                    <option value="sesame-gad">SESAME GADADREF</option>
                                    <option value="sesame-com">SESAME COMMERCIAL</option>
                                    <option value="red-sesame">RED SESAME</option>
                                    <option value="acacia-sen">ACACIA SENEGAL</option>
                                    <option value="acacia-sey">ACACIA SEYAL</option>
                                    <option value="cotton">COTTON</option>
                                    <option value="watermelon">WATERMELON SEEDS</option>
                                    <option value="peanuts">PEANUTS GAVA 80/90</option>
                                    <option value="chickpeas">CHICKPEAS</option>
                                    <option value="pigeon-peas">PIGEON PEAS</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ animationDelay: '0.7s' }}>
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
                            <div className="form-group full-width" style={{ animationDelay: '0.8s' }}>
                                <textarea
                                    name="note"
                                    placeholder="Additional Notes"
                                    rows={4}
                                    value={formData.note}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <button type="submit" className={`submit-btn ${loading ? 'submitting' : ''}`} disabled={loading} style={{ animationDelay: '0.9s' }}>
                                {loading ? 'SENDING...' : 'SEND REQUEST'}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h3>Sample Request Submitted!</h3>
                        <p>Thank you for your interest in our products. We'll get back to you shortly with your sample details.</p>
                        <button onClick={() => setSuccess(false)} className="submit-btn" style={{ marginTop: '20px', opacity: 1, width: 'auto' }}>Request Another Sample</button>
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
                    padding: 50px 0;
                    min-height: calc(100vh - 100px);
                    display: flex; /* Added for centering content vertically */
                    align-items: center; /* Added for centering content vertically */
                    justify-content: center; /* Added for centering content horizontally */
                    font-family: 'Arial', sans-serif;
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

                .sample-content {
                    max-width: 1000px;
                    margin: 0 auto;
                    background-color: white;
                    border-radius: 12px; /* Slightly larger border-radius */
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); /* Softer shadow */
                    overflow: hidden;
                    padding: 45px; /* Increased padding */
                    position: relative;
                    z-index: 1;
                }

                .sample-header {
                    text-align: center;
                    margin-bottom: 35px; /* Increased margin */
                }

                .sample-header h1 {
                    color: var(--primary-dark);
                    font-size: 2.2rem; /* Larger font size */
                    margin-bottom: 12px; /* Adjusted margin */
                    font-weight: 700;
                }

                .sample-header h2 {
                    color: var(--accent);
                    font-size: 2.8rem; /* Larger font size */
                    font-weight: 800; /* Bolder font */
                    text-transform: uppercase;
                }

                .sample-form {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                }

                .form-group {
                    margin-bottom: 0; /* Removed margin, handled by gap */
                    position: relative;
                    overflow: hidden;
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                }

                .full-width {
                    grid-column: span 2;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 14px 18px; /* Increased padding */
                    border: 1px solid #e0e0e0; /* Lighter border */
                    border-radius: 8px; /* Slightly larger border-radius */
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background-color: #f8f8f8; /* Light background for inputs */
                }

                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    border-color: var(--primary-dark); /* Focused border color */
                    outline: none;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 15px rgba(27, 20, 100, 0.1); /* Stronger shadow */
                }

                .submit-btn {
                    background-color: var(--primary-dark);
                    color: white;
                    border: none;
                    padding: 15px 35px; /* Increased padding */
                    font-size: 1.1rem; /* Larger font size */
                    border-radius: 8px; /* Larger border-radius */
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-weight: 700; /* Bolder font */
                    grid-column: span 2; /* Make button span full width in grid */
                    margin-top: 15px; /* Adjusted margin */
                    position: relative;
                    overflow: hidden;
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                }

                .submit-btn:hover {
                    background-color: var(--accent);
                    transform: translateY(-3px); /* More pronounced lift */
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25); /* Stronger shadow */
                }

                .submit-btn:disabled {
                    cursor: not-allowed;
                    opacity: 0.7;
                    transform: none;
                    box-shadow: none;
                }

                .success-message {
                    background-color: rgba(40, 167, 69, 0.1);
                    border: 1px solid var(--success-color); /* Success color border */
                    border-radius: 10px;
                    padding: 30px; /* Increased padding */
                    text-align: center;
                    margin-top: 25px;
                    animation: fadeInUp 0.5s ease-out forwards;
                }

                .success-message h3 {
                    color: var(--primary-dark);
                    margin-bottom: 12px;
                    font-size: 1.6rem;
                    font-weight: 700;
                }

                .success-message p {
                    color: #555;
                    font-size: 1.05rem;
                    line-height: 1.6;
                }

                .success-icon {
                    color: var(--success-color);
                    font-size: 55px; /* Larger icon */
                    margin-bottom: 15px;
                    animation: pulse 1.5s infinite;
                }

                .loading-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(255, 255, 255, 0.9); /* Slightly more opaque */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 100;
                }

                .loading-spinner {
                    width: 50px; /* Larger spinner */
                    height: 50px;
                    border: 5px solid rgba(27, 20, 100, 0.2);
                    border-radius: 50%;
                    border-top-color: var(--primary-dark);
                    animation: spin 1s linear infinite;
                }

                .submit-btn.submitting {
                    background: linear-gradient(90deg, var(--primary-dark), var(--accent), var(--primary-dark));
                    background-size: 200% 100%;
                    animation: shimmer 2s infinite;
                    pointer-events: none;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
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

                @media (max-width: 768px) {
                    .sample-form {
                        grid-template-columns: 1fr;
                    }
                    
                    .submit-btn {
                        grid-column: 1;
                    }
                    
                    .full-width {
                        grid-column: 1;
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
