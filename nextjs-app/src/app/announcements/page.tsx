'use client'

import { useState } from 'react'

// Mock Data
const announcements = [
    {
        id: 1,
        title: "Global Market Update: Q3 2024",
        content: "The global agricultural market has seen significant shifts in Q3 2024, with rising demand for organic oilseeds and fibers. Our latest analysis indicates a bullish trend for sesame and gum arabic exports.",
        date: "Oct 15, 2024",
        category: "market"
    },
    {
        id: 2,
        title: "New Product Line: Organic Cotton",
        content: "We are proud to announce the launch of our new certified organic cotton line. Sourced from sustainable farms in the Gezira Scheme, this premium fiber meets international organic standards.",
        date: "Sep 28, 2024",
        category: "product"
    },
    {
        id: 3,
        title: "SudaStock at Gulfood 2024",
        content: "Join us at Gulfood 2024 in Dubai! Visit our booth to explore our diverse range of Sudanese agricultural products and discuss partnership opportunities. We look forward to meeting you.",
        date: "Sep 10, 2024",
        category: "event"
    },
    {
        id: 4,
        title: "Website Maintenance Scheduled",
        content: "Please be advised that our website will undergo scheduled maintenance on November 1st from 02:00 AM to 04:00 AM UTC. We apologize for any inconvenience this may cause.",
        date: "Oct 25, 2024",
        category: "general"
    },
    {
        id: 5,
        title: "Sesame Harvest Report",
        content: "The 2024 sesame harvest season has concluded with exceptional yields. Quality assessments show high oil content and purity levels exceeding previous years' averages.",
        date: "Nov 05, 2024",
        category: "market"
    },
    {
        id: 6,
        title: "Expansion of Logistics Network",
        content: "To better serve our international clients, we have expanded our logistics network with new warehousing facilities in Port Sudan. This will ensure faster processing and shipping times.",
        date: "Aug 15, 2024",
        category: "general"
    }
]

export default function AnnouncementsPage() {
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<typeof announcements[0] | null>(null)

    const filteredAnnouncements = announcements.filter(announcement => {
        const matchesFilter = filter === 'all' || announcement.category === filter
        const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesFilter && matchesSearch
    })

    return (
        <div className="announcements-page">
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Market Announcements</h1>
                    <p>Stay updated with the latest news and market trends</p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="announcements-filters">
                    <div className="filter-group">
                        <label htmlFor="categoryFilter">Category:</label>
                        <select
                            id="categoryFilter"
                            className="form-select"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            <option value="market">Market Updates</option>
                            <option value="product">Product News</option>
                            <option value="event">Events</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                    <div className="search-group">
                        <input
                            type="text"
                            id="announcementSearch"
                            className="form-control"
                            placeholder="Search announcements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-btn">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </div>

                <div className="announcements-grid">
                    {filteredAnnouncements.map(announcement => (
                        <div key={announcement.id} className="announcement-card">
                            <div className="announcement-header">
                                <span className="announcement-date">{announcement.date}</span>
                                <span className={`announcement-category badge badge-${announcement.category}`}>
                                    {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
                                </span>
                            </div>
                            <h3 className="announcement-title">{announcement.title}</h3>
                            <div className="announcement-content">
                                <p>{announcement.content.substring(0, 100)}...</p>
                            </div>
                            <div className="announcement-footer">
                                <button
                                    className="read-more-btn"
                                    onClick={() => setSelectedAnnouncement(announcement)}
                                >
                                    Read More
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredAnnouncements.length === 0 && (
                        <div className="no-announcements">
                            <p>No announcements available at this time.</p>
                        </div>
                    )}
                </div>

                <div className="pagination-container">
                    <nav aria-label="Announcements pagination">
                        <ul className="pagination">
                            <li className="page-item disabled">
                                <a className="page-link" href="#" tabIndex={-1} aria-disabled="true">Previous</a>
                            </li>
                            <li className="page-item active"><a className="page-link" href="#">1</a></li>
                            <li className="page-item"><a className="page-link" href="#">2</a></li>
                            <li className="page-item"><a className="page-link" href="#">3</a></li>
                            <li className="page-item">
                                <a className="page-link" href="#">Next</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Announcement Modal */}
            {selectedAnnouncement && (
                <div className="announcement-modal active" onClick={(e) => {
                    if (e.target === e.currentTarget) setSelectedAnnouncement(null)
                }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{selectedAnnouncement.title}</h2>
                            <button className="close-modal" onClick={() => setSelectedAnnouncement(null)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-meta">
                                <span>{selectedAnnouncement.date}</span>
                                <span className={`badge badge-${selectedAnnouncement.category}`}>
                                    {selectedAnnouncement.category.charAt(0).toUpperCase() + selectedAnnouncement.category.slice(1)}
                                </span>
                            </div>
                            <div className="modal-text">
                                <p>{selectedAnnouncement.content}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                :root {
                    --accent: #786D3C;
                    --primary-dark: #1B1464;
                    --success-color: #28a745;
                    --error-color: #dc3545;
                    --neutral-color: #6c757d;
                }

                .announcements-page {
                    min-height: 100vh;
                    background-color: #f8f9fa;
                }

                .hero-section {
                    background-color: #1B1464;
                    color: white;
                    padding: 60px 0;
                    text-align: center;
                    margin-bottom: 40px;
                }

                .hero-content h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 15px;
                }

                .hero-content p {
                    font-size: 1.2rem;
                    max-width: 800px;
                    margin: 0 auto;
                    opacity: 0.9;
                }

                .announcements-filters {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-bottom: 30px;
                    background-color: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    align-items: flex-end;
                }

                .filter-group {
                    flex: 1;
                    min-width: 200px;
                }

                .filter-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #1B1464;
                }

                .search-group {
                    flex: 2;
                    min-width: 300px;
                    display: flex;
                }

                .form-select,
                .form-control {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background-color: white;
                }

                .search-btn {
                    background-color: #1B1464;
                    color: white;
                    border: none;
                    border-radius: 0 4px 4px 0;
                    padding: 0 15px;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }

                .search-btn:hover {
                    background-color: #15104f;
                }

                .form-control {
                    border-right: none;
                    border-radius: 4px 0 0 4px;
                }

                .announcements-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 25px;
                    margin-bottom: 40px;
                }

                .announcement-card {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    overflow: hidden;
                    transition: transform 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                }

                .announcement-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }

                .announcement-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .announcement-date {
                    color: #6c757d;
                    font-size: 0.9rem;
                }

                .announcement-category {
                    padding: 5px 10px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .badge {
                    display: inline-block;
                    padding: 0.35em 0.65em;
                    font-size: 0.75em;
                    font-weight: 700;
                    line-height: 1;
                    color: #fff;
                    text-align: center;
                    white-space: nowrap;
                    vertical-align: baseline;
                    border-radius: 0.25rem;
                }

                .badge-market {
                    background-color: rgba(40, 167, 69, 0.15);
                    color: #28a745;
                }

                .badge-product {
                    background-color: rgba(0, 123, 255, 0.15);
                    color: #007bff;
                }

                .badge-event {
                    background-color: rgba(255, 193, 7, 0.15);
                    color: #ffc107;
                }

                .badge-general {
                    background-color: rgba(108, 117, 125, 0.15);
                    color: #6c757d;
                }

                .announcement-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1B1464;
                    margin-bottom: 15px;
                    line-height: 1.4;
                }

                .announcement-content {
                    color: #555;
                    line-height: 1.6;
                    flex-grow: 1;
                    margin-bottom: 20px;
                }

                .announcement-footer {
                    margin-top: auto;
                }

                .read-more-btn {
                    background-color: transparent;
                    color: #786D3C;
                    border: 1px solid #786D3C;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .read-more-btn:hover {
                    background-color: #786D3C;
                    color: white;
                }

                .no-announcements {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 40px;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    color: #6c757d;
                }

                .pagination-container {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 40px;
                }

                .pagination {
                    display: flex;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .page-item {
                    margin: 0 5px;
                }

                .page-link {
                    display: block;
                    padding: 8px 12px;
                    border-radius: 4px;
                    text-decoration: none;
                    color: #1B1464;
                    background-color: white;
                    border: 1px solid #ddd;
                    transition: all 0.3s ease;
                }

                .page-item.active .page-link {
                    background-color: #1B1464;
                    color: white;
                    border-color: #1B1464;
                }

                .page-item.disabled .page-link {
                    color: #6c757d;
                    pointer-events: none;
                    background-color: #f8f9fa;
                    border-color: #ddd;
                }

                .page-link:hover:not(.page-item.active .page-link):not(.page-item.disabled .page-link) {
                    background-color: #f8f9fa;
                    border-color: #1B1464;
                }

                .announcement-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s ease, visibility 0.3s ease;
                }

                .announcement-modal.active {
                    opacity: 1;
                    visibility: visible;
                }

                .modal-content {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
                    width: 100%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: modalFadeIn 0.3s ease;
                }

                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h2 {
                    margin: 0;
                    color: #1B1464;
                    font-size: 1.5rem;
                    font-weight: 600;
                }

                .close-modal {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6c757d;
                    transition: color 0.3s ease;
                }

                .close-modal:hover {
                    color: #dc3545;
                }

                .modal-body {
                    padding: 20px;
                }

                .modal-meta {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                    color: #6c757d;
                    font-size: 0.9rem;
                }

                .modal-meta span:first-child {
                    margin-right: 15px;
                }

                .modal-text {
                    line-height: 1.6;
                    color: #333;
                }

                @media (max-width: 768px) {
                    .hero-section {
                        padding: 40px 0;
                    }
                    
                    .hero-content h1 {
                        font-size: 2rem;
                    }
                    
                    .announcements-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .filter-group,
                    .search-group {
                        min-width: 100%;
                    }
                    
                    .modal-content {
                        max-width: 95%;
                    }
                }
            `}</style>
        </div>
    )
}
