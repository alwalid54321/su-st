/**
 * Market Data JavaScript
 * Handles fetching and displaying market data with integration to CNF calculations
 */

// Initialize the page when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializeMarketDataPage();
    
    // Set up event listeners
    document.getElementById('submitBtn').addEventListener('click', handleSubmit);
    document.getElementById('refreshMarketData').addEventListener('click', refreshData);
    
    // Set default dates if not already set
    setDefaultDates();
    
    // Populate product dropdown
    populateProductDropdown();
    
    // Initialize charts
    initializeCharts();
    
    // Load dummy data to show charts on initial load
    updateChartsWithDummyData();
});

/**
 * Initialize the market data page
 */
function initializeMarketDataPage() {
    // Animate counters
    animateCounters();
    
    // Add floating data elements animation
    addFloatingDataElements();
}

/**
 * Set default dates for the date range picker
 */
function setDefaultDates() {
    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10);
    
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    if (!startDateInput.value) {
        startDateInput.value = formatDate(tenDaysAgo);
    }
    
    if (!endDateInput.value) {
        endDateInput.value = formatDate(today);
    }
}

/**
 * Add floating data elements for visual effect
 */
function addFloatingDataElements() {
    const container = document.querySelector('.floating-data-elements');
    if (!container) return;
    
    const dataElements = [
        '$ 1,245.67',
        '↑ 3.2%',
        '$ 987.30',
        '↓ 1.5%',
        '$ 2,134.89'
    ];
    
    dataElements.forEach((text, index) => {
        const element = document.createElement('div');
        element.className = 'data-element';
        element.textContent = text;
        element.style.left = `${Math.random() * 90}%`;
        element.style.top = `${Math.random() * 90}%`;
        container.appendChild(element);
    });
}

/**
 * Animate the counter elements
 */
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16); // 60fps
        
        let current = 0;
        const timer = setInterval(() => {
            current += step;
            counter.textContent = Math.round(current).toLocaleString();
            
            if (current >= target) {
                counter.textContent = target.toLocaleString();
                clearInterval(timer);
            }
        }, 16);
    });
}

/**
 * Populate the product dropdown with available market data items
 */
function populateProductDropdown() {
    const productSelect = document.getElementById('productSelect');
    if (!productSelect) return;
    
    // Clear existing options
    productSelect.innerHTML = '<option value="">Select a product</option>';
    
    // Fetch products from API
    fetch('/api/market-data/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch market data');
            }
            return response.json();
        })
        .then(data => {
            // Add options for each product
            data.forEach(product => {
                const option = document.createElement('option');
                option.value = product.id;
                option.textContent = product.name;
                productSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching market data:', error);
            // Add dummy products as fallback
            addDummyProducts();
        });
}

/**
 * Add dummy products if API fails
 */
function addDummyProducts() {
    const productSelect = document.getElementById('productSelect');
    const dummyProducts = [
        { id: 1, name: 'Sesame Gadadref' },
        { id: 2, name: 'Hibiscus' },
        { id: 3, name: 'Gum Arabic' },
        { id: 4, name: 'Peanuts' }
    ];
    
    dummyProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        productSelect.appendChild(option);
    });
}

// Chart objects
let priceChart;

/**
 * Initialize the charts
 */
function initializeCharts() {
    const ctx = document.getElementById('priceChart');
    if (!ctx) return;
    
    // Define brand colors
    const primaryDark = '#1B1464';  // Dark blue from logo
    const accentColor = '#786D3C';  // Gold accent from logo
    const thirdColor = '#f39c12';   // Third color for contrast
    
    // Sample data for demonstration
    const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const chartData = {
        portSudan: [65, 59, 80, 81, 56, 55, 40],
        china: [28, 48, 40, 19, 86, 27, 90],
        uae: [45, 30, 50, 60, 70, 40, 50]
    };
    
    // Create the chart
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Port Sudan',
                    data: chartData.portSudan,
                    borderColor: primaryDark,
                    backgroundColor: 'rgba(27, 20, 100, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: primaryDark,
                    fill: true
                },
                {
                    label: 'China',
                    data: chartData.china,
                    borderColor: accentColor,
                    backgroundColor: 'rgba(120, 109, 60, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: accentColor,
                    fill: true
                },
                {
                    label: 'UAE',
                    data: chartData.uae,
                    borderColor: thirdColor,
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 3,
                    pointBackgroundColor: thirdColor,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#666666',
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333333',
                    bodyColor: '#666666',
                    borderColor: 'rgba(120, 109, 60, 0.3)',
                    borderWidth: 1,
                    titleFont: {
                        family: "'Poppins', sans-serif",
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: "'Poppins', sans-serif",
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666666',
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 11
                        },
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Fetch product data from the API
 */
function fetchProductData() {
    // Get selected product ID
    const productId = document.getElementById('productSelect').value;
    
    // If no product is selected, return
    if (!productId) {
        showError('Please select a product');
        return;
    }
    
    // Get date range
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Show loading state
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').textContent = 'Loading...';
    
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'block';
    
    // Fetch product history from API
    fetch(`/api/market-data/${productId}/history/?start_date=${startDate}&end_date=${endDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch product history');
            }
            return response.json();
        })
        .then(data => {
            // Hide loading indicator
            document.getElementById('loadingIndicator').style.display = 'none';
            
            // Update charts with the fetched data
            updateCharts(data);
            
            // Update product details
            updateProductDetails(data.product);
            
            // Reset button state
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').textContent = 'Submit';
            
            // Show the results section
            document.getElementById('resultsSection').style.display = 'block';
            
            // Scroll to results
            document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error fetching product history:', error);
            
            // Hide loading indicator
            document.getElementById('loadingIndicator').style.display = 'none';
            
            // Show error message
            showError('Failed to fetch product data. Using sample data for demonstration.');
            
            // Use dummy data for demonstration
            updateChartsWithDummyData();
            
            // Reset button state
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').textContent = 'Submit';
            
            // Show the results section
            document.getElementById('resultsSection').style.display = 'block';
        });
}

/**
 * Update product details in the UI
 */
function updateProductDetails(product) {
    // Update product title
    document.getElementById('productTitle').textContent = product.name;
    
    // Update product status
    const statusElement = document.getElementById('productStatus');
    statusElement.textContent = product.status;
    statusElement.className = 'status-badge ' + product.status.toLowerCase();
    
    // Update product forecast
    document.getElementById('productForecast').textContent = product.forecast;
    
    // Update product trend
    const trendElement = document.getElementById('productTrend');
    const trendValue = product.trend;
    
    if (trendValue > 0) {
        trendElement.className = 'trend-value up';
        trendElement.textContent = `↑ ${Math.abs(trendValue)}%`;
    } else if (trendValue < 0) {
        trendElement.className = 'trend-value down';
        trendElement.textContent = `↓ ${Math.abs(trendValue)}%`;
    } else {
        trendElement.className = 'trend-value stable';
        trendElement.textContent = `→ ${Math.abs(trendValue)}%`;
    }
    
    // Update current prices
    updatePriceCard('currentPortSudan', 'trendPortSudan', product.current_port_sudan, calculateTrend(product, 'port_sudan'));
    updatePriceCard('currentChina', 'trendChina', product.current_dmt_china, calculateTrend(product, 'dmt_china'));
    updatePriceCard('currentUAE', 'trendUAE', product.current_dmt_uae, calculateTrend(product, 'dmt_uae'));
    updatePriceCard('currentMersing', 'trendMersing', product.current_dmt_mersing, calculateTrend(product, 'dmt_mersing'));
    updatePriceCard('currentIndia', 'trendIndia', product.current_dmt_india, calculateTrend(product, 'dmt_india'));
}

/**
 * Show error message
 */
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    } else {
        console.error(message);
    }
}

/**
 * Update charts with dummy data if API fails
 */
function updateChartsWithDummyData() {
    if (!priceChart) {
        console.error('Price chart not initialized');
        return;
    }
    
    // Sample data for demonstration
    const chartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const chartData = {
        portSudan: [65, 59, 80, 81, 56, 55, 40],
        china: [28, 48, 40, 19, 86, 27, 90],
        uae: [45, 30, 50, 60, 70, 40, 50]
    };
    
    // Update chart data
    priceChart.data.labels = chartLabels;
    priceChart.data.datasets[0].data = chartData.portSudan;
    priceChart.data.datasets[1].data = chartData.china;
    priceChart.data.datasets[2].data = chartData.uae;
    
    // Force redraw of the chart
    priceChart.update('active');
    
    // Update current prices with sample data
    updatePriceCard('currentPortSudan', 'trendPortSudan', 40, 'down');
    updatePriceCard('currentChina', 'trendChina', 90, 'up');
    updatePriceCard('currentUAE', 'trendUAE', 50, 'stable');
    updatePriceCard('currentMersing', 'trendMersing', 65, 'down');
    updatePriceCard('currentIndia', 'trendIndia', 75, 'up');
}

/**
 * Update charts with data
 */
function updateCharts(data) {
    if (!priceChart) {
        console.error('Price chart not initialized');
        return;
    }
    
    // Extract data for each destination
    const labels = data.dates || [];
    const portSudanPrices = data.portSudanPrices || [];
    const chinaPrices = data.chinaPrices || [];
    const uaePrices = data.uaePrices || [];
    
    // Update chart data
    priceChart.data.labels = labels;
    priceChart.data.datasets[0].data = portSudanPrices;
    priceChart.data.datasets[1].data = chinaPrices;
    priceChart.data.datasets[2].data = uaePrices;
    
    // Force redraw of the chart
    priceChart.update('active');
    
    // Update current prices and trends
    updatePriceCard('currentPortSudan', 'trendPortSudan', data.product.port_sudan, calculateTrend(data.history, 'port_sudan'));
    updatePriceCard('currentChina', 'trendChina', data.product.dmt_china, calculateTrend(data.history, 'dmt_china'));
    updatePriceCard('currentUAE', 'trendUAE', data.product.dmt_uae, calculateTrend(data.history, 'dmt_uae'));
    updatePriceCard('currentMersing', 'trendMersing', data.product.dmt_mersing, calculateTrend(data.history, 'dmt_mersing'));
    updatePriceCard('currentIndia', 'trendIndia', data.product.dmt_india, calculateTrend(data.history, 'dmt_india'));
}

/**
 * Update a price card with current price and trend
 */
function updatePriceCard(priceElementId, trendElementId, currentPrice, trend) {
    // Update price
    const priceElement = document.getElementById(priceElementId);
    if (priceElement) {
        priceElement.textContent = currentPrice ? `$${parseFloat(currentPrice).toFixed(2)}` : 'N/A';
    }
    
    // Update trend
    const trendElement = document.getElementById(trendElementId);
    if (trendElement) {
        if (trend === 0) {
            trendElement.innerHTML = '<span class="stable">→ Stable</span>';
        } else if (trend > 0) {
            trendElement.innerHTML = `<span class="up">↑ ${trend.toFixed(1)}%</span>`;
        } else {
            trendElement.innerHTML = `<span class="down">↓ ${Math.abs(trend).toFixed(1)}%</span>`;
        }
    }
}

/**
 * Calculate trend percentage based on historical data
 */
function calculateTrend(history, field) {
    if (!history || history.length < 2) {
        return 0;
    }
    
    // Get the oldest and newest values
    const oldest = parseFloat(history[0][field]) || 0;
    const newest = parseFloat(history[history.length - 1][field]) || 0;
    
    // Calculate percentage change
    if (oldest === 0) {
        return 0;
    }
    
    return ((newest - oldest) / oldest) * 100;
}

/**
 * Refresh data
 */
function refreshData() {
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'flex';
    
    // Hide any previous error
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    // Show results section if it's hidden
    document.getElementById('resultsSection').style.display = 'block';
    
    // Update with dummy data for immediate feedback
    updateChartsWithDummyData();
    
    // Hide loading indicator after a short delay
    setTimeout(() => {
        document.getElementById('loadingIndicator').style.display = 'none';
    }, 800);
}

/**
 * Handle form submission
 */
function handleSubmit() {
    const productId = document.getElementById('productSelect').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (!productId) {
        showError('Please select a product');
        return;
    }
    
    if (!startDate || !endDate) {
        showError('Please select start and end dates');
        return;
    }
    
    // Show loading indicator
    document.getElementById('loadingIndicator').style.display = 'flex';
    
    // Hide any previous error
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    // Fetch data from API
    fetch(`/api/market-data/${productId}/?start_date=${startDate}&end_date=${endDate}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch market data');
            }
            return response.json();
        })
        .then(data => {
            // Hide loading indicator
            document.getElementById('loadingIndicator').style.display = 'none';
            
            // Show results section
            document.getElementById('resultsSection').style.display = 'block';
            
            // Update charts with data
            updateCharts(data);
        })
        .catch(error => {
            // Hide loading indicator
            document.getElementById('loadingIndicator').style.display = 'none';
            
            console.error('Error fetching market data:', error);
            showError('Failed to fetch market data. Using sample data instead.');
            
            // Use dummy data as fallback
            updateChartsWithDummyData();
            
            // Show results with dummy data
            document.getElementById('resultsSection').style.display = 'block';
        });
}
