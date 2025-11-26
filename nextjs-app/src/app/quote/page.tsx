'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function QuoteContent() {
    const searchParams = useSearchParams()
    const productParam = searchParams.get('product')

    const [formData, setFormData] = useState({
        name: '',
        contactNumber: '',
        email: '',
        companyName: '',
        country: '',
        product: '',
        quantity: '',
        purpose: '',
        specifications: '',
        note: ''
    })

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (productParam) {
            // Map product names to values if needed, or just use the param if it matches
            // The template uses specific values like 'sesame-gad', 'sesame-com'
            // We'll assume the param matches or we might need a mapping function
            // For now, we'll try to match loosely or exact
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
        <div className="quote-container bg-pattern-container">
            <div className="quote-content">
                <div className="quote-form-section">
                    {!success ? (
                        <>
                            <p className="subtitle">Reach out and request for your personalized</p>
                            <h1>QUOTATIONS</h1>

                            <form onSubmit={handleSubmit} className="quote-form">
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
                                    <input
                                        type="text"
                                        name="quantity"
                                        placeholder="Quantity (e.g., 20 tons)"
                                        required
                                        value={formData.quantity}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group" style={{ animationDelay: '0.8s' }}>
                                    <input
                                        type="text"
                                        name="purpose"
                                        placeholder="Purpose/Port"
                                        required
                                        value={formData.purpose}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group" style={{ animationDelay: '0.9s' }}>
                                    <textarea
                                        name="specifications"
                                        placeholder="Product Specifications"
                                        rows={3}
                                        value={formData.specifications}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>

                                <div className="form-group" style={{ animationDelay: '1.0s' }}>
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
                            <button onClick={() => setSuccess(false)} className="submit-btn" style={{ marginTop: '20px', opacity: 1 }}>Submit Another Request</button>
                        </div>
                    )}

                    {loading && (
                        <div className="loading-overlay">
                            <div className="loading-spinner"></div>
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

                .quote-content {
                    display: flex;
                    max-width: 1200px;
                    margin: 0 auto;
                    background-color: white;
                    border-radius: 12px; /* Slightly larger border-radius */
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1); /* Softer shadow */
                    overflow: hidden;
                    position: relative;
                    z-index: 1;
                    font-family: 'Arial', sans-serif;
                }

                .quote-form-section {
                    flex: 2;
                    padding: 45px; /* Increased padding */
                    position: relative;
                }

                .quote-form-section h1 {
                    color: var(--primary-dark);
                    font-size: 2.8rem; /* Larger font size */
                    margin-bottom: 25px; /* Increased margin */
                    font-weight: 800; /* Bolder font */
                    animation: fadeInDown 0.8s ease-out forwards;
                }

                .subtitle {
                    color: var(--accent);
                    font-size: 1.2rem; /* Larger font size */
                    margin-bottom: 8px; /* Adjusted margin */
                    animation: fadeInDown 0.6s ease-out forwards;
                }

                .quote-form {
                    margin-top: 35px; /* Increased margin */
                    display: grid; /* Use grid for better form layout */
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                }

                .form-group {
                    margin-bottom: 0; /* Removed margin, handled by gap */
                    position: relative;
                    overflow: hidden;
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
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

                .form-group textarea {
                    min-height: 120px; /* Adjusted min-height */
                    resize: vertical;
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
                    margin-top: 15px; /* Adjusted margin */
                    position: relative;
                    overflow: hidden;
                    animation: fadeInUp 0.5s ease-out forwards;
                    animation-delay: 1.1s; /* Adjusted delay */
                    opacity: 0;
                    grid-column: 1 / -1; /* Make button span full width in grid */
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

                .info-section {
                    flex: 1;
                    background: linear-gradient(180deg, var(--primary-dark) 0%, #2a1f8a 100%); /* Gradient background */
                    color: white;
                    padding: 45px; /* Increased padding */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-left: 1px solid rgba(255, 255, 255, 0.1); /* Subtle border */
                }

                .info-box {
                    text-align: center;
                    animation: fadeIn 1s ease-out forwards;
                }

                .info-box h3 {
                    font-size: 2rem; /* Larger font size */
                    margin-bottom: 15px; /* Increased margin */
                    font-weight: 700;
                    color: white;
                }

                .info-box p {
                    font-size: 1.1rem;
                    margin-bottom: 35px; /* Increased margin */
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.7;
                }

                .contact-btn {
                    background-color: var(--accent);
                    color: white;
                    border: none;
                    padding: 14px 35px; /* Increased padding */
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
                    transform: translateY(-3px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
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

                @media (max-width: 768px) {
                    .quote-content {
                        flex-direction: column;
                    }
                    .quote-form-section, .info-section {
                        padding: 30px;
                    }
                    .quote-form-section h1 {
                        font-size: 2.2rem;
                    }
                    .info-box h3 {
                        font-size: 1.6rem;
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