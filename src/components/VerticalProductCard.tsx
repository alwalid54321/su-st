import Image from 'next/image'
import './vertical-card.css'

type CardProps = {
    id: number
    name: string
    category: string
    imageUrl?: string | null
    price: number
    status: string
    description?: string | null
    trend?: number
    onViewDetails: () => void
}

export default function VerticalProductCard({
    id,
    name,
    category,
    imageUrl,
    price,
    status,
    description,
    trend,
    onViewDetails
}: CardProps) {
    const getCategoryBadgeColor = (cat: string) => {
        switch (cat.toLowerCase()) {
            case 'sesame': return 'badge-sesame'
            case 'gum': return 'badge-gum'
            case 'cotton': return 'badge-cotton'
            default: return 'badge-other'
        }
    }

    // Sanitize image URL to prevent Next.js runtime errors
    let sanitizedImageUrl = imageUrl || '/images/placeholder.jpg'
    // Replace backslashes with forward slashes first
    sanitizedImageUrl = sanitizedImageUrl.replace(/\\/g, '/')

    if (sanitizedImageUrl && !sanitizedImageUrl.startsWith('http')) {
        // Remove any leading slashes and add exactly one
        sanitizedImageUrl = '/' + sanitizedImageUrl.replace(/^\/+/, '')
    }

    return (
        <div className="vertical-card">
            <div className="card-image-wrapper">
                <Image
                    src={sanitizedImageUrl}
                    alt={name}
                    fill
                    style={{ objectFit: 'cover' }}
                />
                <div className={`category-badge ${getCategoryBadgeColor(category)}`}>
                    {category}
                </div>
                {trend !== undefined && trend !== 0 && (
                    <div className={`trend-indicator ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
                        <i className={`fas fa-arrow-${trend > 0 ? 'up' : 'down'}`}></i>
                        {Math.abs(trend).toFixed(1)}%
                    </div>
                )}
            </div>

            <div className="card-content">
                <h3 className="card-title">{name}</h3>

                <div className="card-price-row">
                    <span className="card-price">${price.toLocaleString()}</span>
                    <span className="price-unit">/ MT</span>
                </div>

                <div className={`card-status ${status === 'In Stock' || status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                    <i className={`fas fa-circle status-dot`}></i>
                    {status}
                </div>

                {description && (
                    <p className="card-description">{description.substring(0, 80)}{description.length > 80 ? '...' : ''}</p>
                )}

                <button className="view-details-btn" onClick={onViewDetails}>
                    <i className="fas fa-eye"></i>
                    View Details
                </button>
            </div>
        </div>
    )
}
