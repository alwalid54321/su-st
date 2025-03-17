/**
 * Home JavaScript
 * Handles dashboard functionality and market data display
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set Chart.js defaults to match our theme
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = 'rgba(224, 224, 224, 0.8)';
        Chart.defaults.font.family = "'Poppins', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
    }
    
    // Initialize the dashboard
    initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check if we have historical data from the template
    if (window.historicalData && window.historicalData.length > 0) {
        // Use the data passed from the template
        renderChart(window.historicalData);
        updateMarketOverview(window.historicalData);
    } else {
        // Otherwise fetch from API
        fetchMarketData();
    }
});

/**
 * Initialize the dashboard with animations and effects
 */
function initializeDashboard() {
    // Add fade-in animations to dashboard elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((element, index) => {
        const delay = parseFloat(element.style.animationDelay || '0s');
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease-in-out';
            element.style.opacity = '1';
        }, delay * 1000 + 100);
    });
    
    // Initialize any tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    if (typeof bootstrap !== 'undefined') {
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

/**
 * Set up event listeners for dashboard interactions
 */
function setupEventListeners() {
    // Product selector change event
    const productSelector = document.getElementById('productSelector');
    if (productSelector) {
        productSelector.addEventListener('change', function() {
            window.location.href = `/dashboard/?product_id=${this.value}`;
        });
    }
    
    // Refresh button
    const refreshBtn = document.querySelector('.quick-action-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            fetchMarketData();
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.add('fa-spin');
                setTimeout(() => {
                    icon.classList.remove('fa-spin');
                }, 1000);
            }
        });
    }
}

/**
 * Fetch market data from the API
 */
function fetchMarketData() {
    // Get the selected product ID from the URL or default to the first product
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product_id');
    
    // Show loading state
    const chartContainer = document.getElementById('chartContainer');
    if (chartContainer) {
        chartContainer.innerHTML = '<div class="text-center py-5"><div class="spinner-border" style="color: var(--accent);" role="status"></div><p class="mt-3">Loading market data...</p></div>';
    }
    
    if (productId) {
        // Fetch history data for the selected product
        fetch(`/api/market-data/${productId}/history/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch market data history');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.history) {
                    updateDashboardWithData(data);
                } else {
                    throw new Error('Invalid data format received');
                }
            })
            .catch(error => {
                console.error('Error fetching market data history:', error);
                showErrorMessage(chartContainer, error.message);
                
                // If API fails, try to use the data from the template as fallback
                if (window.historicalData && window.historicalData.length > 0) {
                    renderChart(window.historicalData);
                    updateMarketOverview(window.historicalData);
                }
            });
    } else {
        // If no product ID is specified, fetch all market data
        fetch('/api/market-data/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch market data');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length > 0) {
                    // If we have data, fetch history for the first product
                    const firstProductId = data[0].id;
                    return fetch(`/api/market-data/${firstProductId}/history/`);
                } else {
                    throw new Error('No market data available');
                }
            })
            .then(response => {
                if (!response || !response.ok) {
                    throw new Error('Failed to fetch market data history');
                }
                return response.json();
            })
            .then(data => {
                updateDashboardWithData(data);
            })
            .catch(error => {
                console.error('Error fetching market data:', error);
                showErrorMessage(chartContainer, error.message);
                
                // If API fails, try to use the data from the template as fallback
                if (window.historicalData && window.historicalData.length > 0) {
                    renderChart(window.historicalData);
                    updateMarketOverview(window.historicalData);
                }
            });
    }
}

/**
 * Show error message in the chart container
 */
function showErrorMessage(container, message) {
    if (container) {
        container.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Unable to load market data: ${message}. Please try again later.
            </div>
        `;
    }
}

/**
 * Update the dashboard with the fetched data
 */
function updateDashboardWithData(data) {
    // If we have historical data from the template, use that instead
    if (window.historicalData && window.historicalData.length > 0) {
        renderChart(window.historicalData);
        updateMarketOverview(window.historicalData);
        return;
    }
    
    // Otherwise use the API data
    if (data && data.history) {
        renderChart(data.history);
        updateMarketOverview(data.history);
    } else if (data && Array.isArray(data)) {
        renderChart(data);
        updateMarketOverview(data);
    }
}

/**
 * Render the chart with the provided data
 */
function renderChart(historicalData) {
    if (!historicalData || historicalData.length === 0) return;
    
    const chartContainer = document.getElementById('chartContainer');
    if (!chartContainer) return;
    
    // Clear previous content
    chartContainer.innerHTML = '';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'productChart';
    canvas.style.width = '100%';
    canvas.style.height = '350px';
    chartContainer.appendChild(canvas);
    
    // Prepare data for chart
    const dates = historicalData.map(item => item.date);
    const values = historicalData.map(item => item.value);
    const portSudan = historicalData.map(item => item.port_sudan);
    const china = historicalData.map(item => item.dmt_china);
    const uae = historicalData.map(item => item.dmt_uae);
    const india = historicalData.map(item => item.dmt_india);
    
    // Create chart
    const ctx = canvas.getContext('2d');
    if (typeof Chart !== 'undefined') {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Base Price',
                        data: values,
                        borderColor: 'var(--primary-dark)',
                        backgroundColor: 'rgba(27, 20, 100, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Port Sudan',
                        data: portSudan,
                        borderColor: 'var(--accent)',
                        backgroundColor: 'rgba(120, 109, 60, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'China',
                        data: china,
                        borderColor: 'rgba(52, 152, 219, 1)',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'UAE',
                        data: uae,
                        borderColor: 'rgba(46, 204, 113, 1)',
                        backgroundColor: 'rgba(46, 204, 113, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'India',
                        data: india,
                        borderColor: 'rgba(243, 156, 18, 1)',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(120, 109, 60, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(224, 224, 224, 0.8)'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(120, 109, 60, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(224, 224, 224, 0.8)',
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(224, 224, 224, 0.8)',
                            font: {
                                family: "'Poppins', sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 15, 35, 0.9)',
                        titleColor: '#fff',
                        bodyColor: 'rgba(224, 224, 224, 0.9)',
                        borderColor: 'var(--accent)',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        titleFont: {
                            size: 14,
                            weight: 'bold',
                            family: "'Poppins', sans-serif"
                        },
                        bodyFont: {
                            size: 13,
                            family: "'Poppins', sans-serif"
                        },
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += '$' + context.parsed.y.toLocaleString();
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    } else {
        chartContainer.innerHTML = '<div class="alert alert-warning">Chart.js library not loaded. Please refresh the page.</div>';
    }
}

/**
 * Update the market overview section with the latest data
 */
function updateMarketOverview(historicalData) {
    if (!historicalData || historicalData.length === 0) return;
    
    // Get the latest data point
    const latestData = historicalData[historicalData.length - 1];
    
    // Update market overview cards
    updateOverviewCard('basePrice', latestData.value, calculateTrend(historicalData, 'value'));
    updateOverviewCard('portSudanPrice', latestData.port_sudan, calculateTrend(historicalData, 'port_sudan'));
    updateOverviewCard('chinaPrice', latestData.dmt_china, calculateTrend(historicalData, 'dmt_china'));
    updateOverviewCard('uaePrice', latestData.dmt_uae, calculateTrend(historicalData, 'dmt_uae'));
    updateOverviewCard('indiaPrice', latestData.dmt_india, calculateTrend(historicalData, 'dmt_india'));
    
    // Update last updated time
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement && latestData.date) {
        const date = new Date(latestData.date);
        lastUpdatedElement.textContent = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

/**
 * Update an overview card with price and trend information
 */
function updateOverviewCard(elementId, price, trend) {
    const priceElement = document.getElementById(elementId);
    const trendElement = document.getElementById(`${elementId}Trend`);
    
    if (priceElement) {
        priceElement.textContent = '$' + parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    if (trendElement) {
        const trendValue = trend.toFixed(2);
        const absValue = Math.abs(trend).toFixed(2);
        
        if (trend > 0) {
            trendElement.className = 'trend-up';
            trendElement.innerHTML = `<i class="fas fa-arrow-up me-1"></i>${trendValue}%`;
        } else if (trend < 0) {
            trendElement.className = 'trend-down';
            trendElement.innerHTML = `<i class="fas fa-arrow-down me-1"></i>${absValue}%`;
        } else {
            trendElement.className = 'trend-neutral';
            trendElement.innerHTML = `<i class="fas fa-minus me-1"></i>${trendValue}%`;
        }
    }
}

/**
 * Calculate the trend percentage based on historical data
 */
function calculateTrend(historicalData, field) {
    if (!historicalData || historicalData.length < 2) return 0;
    
    const oldestValue = parseFloat(historicalData[0][field]);
    const latestValue = parseFloat(historicalData[historicalData.length - 1][field]);
    
    if (oldestValue === 0) return 0;
    
    return ((latestValue - oldestValue) / oldestValue) * 100;
}
