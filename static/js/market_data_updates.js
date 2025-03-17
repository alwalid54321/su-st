/**
 * Market Data Updates JavaScript
 * Handles real-time updates to market data when CNF calculations are updated
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the market data update system
    initializeMarketDataUpdates();
});

/**
 * Initialize the market data update system
 */
function initializeMarketDataUpdates() {
    // Set up polling for market data updates
    setupPolling();
    
    // Add event listeners for manual refresh
    setupManualRefresh();
}

/**
 * Set up polling for market data updates
 */
function setupPolling() {
    // Poll for updates every 30 seconds
    setInterval(checkForMarketDataUpdates, 30000);
    
    // Initial check
    checkForMarketDataUpdates();
}

/**
 * Set up manual refresh button
 */
function setupManualRefresh() {
    const refreshButton = document.getElementById('refreshMarketData');
    if (refreshButton) {
        refreshButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Show loading indicator
            refreshButton.classList.add('loading');
            refreshButton.innerHTML = '<i class="fas fa-sync fa-spin"></i> Refreshing...';
            
            // Check for updates
            checkForMarketDataUpdates().then(() => {
                // Reset button after refresh
                setTimeout(() => {
                    refreshButton.classList.remove('loading');
                    refreshButton.innerHTML = '<i class="fas fa-sync"></i> Refresh';
                }, 1000);
            });
        });
    }
}

/**
 * Check for market data updates
 */
function checkForMarketDataUpdates() {
    return fetch('/api/market-data/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch market data updates');
            }
            return response.json();
        })
        .then(data => {
            updateMarketDataTable(data);
            updateLastUpdateTime(data);
            return data;
        })
        .catch(error => {
            console.error('Error fetching market data updates:', error);
        });
}

/**
 * Update the market data table with the fetched data
 */
function updateMarketDataTable(marketData) {
    const table = document.querySelector('.market-table');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    // Update existing rows
    rows.forEach(row => {
        const productNameElement = row.querySelector('.product-name');
        if (!productNameElement) return;
        
        const productName = productNameElement.textContent.trim();
        const matchingData = marketData.find(item => item.name === productName);
        
        if (matchingData) {
            updateRowData(row, matchingData);
        }
    });
}

/**
 * Update a table row with the new market data
 */
function updateRowData(row, data) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 8) return;
    
    // Update price cells
    updatePriceCell(cells[1], data.port_sudan);
    updatePriceCell(cells[2], data.dmt_china);
    updatePriceCell(cells[3], data.dmt_uae);
    updatePriceCell(cells[4], data.dmt_mersing);
    updatePriceCell(cells[5], data.dmt_india);
    
    // Update status
    const statusCell = cells[6];
    const statusBadge = statusCell.querySelector('.status-badge');
    
    if (statusBadge) {
        statusBadge.className = 'status-badge';
        statusBadge.classList.add(data.status.toLowerCase());
        statusBadge.textContent = data.status;
    }
    
    // Update forecast
    const forecastCell = cells[7];
    const forecastTrend = forecastCell.querySelector('.forecast-trend');
    const forecastText = forecastCell.querySelector('span:last-child');
    
    if (forecastTrend && forecastText) {
        forecastTrend.className = 'forecast-trend';
        
        if (data.trend > 0) {
            forecastTrend.classList.add('up');
            forecastTrend.textContent = `↑ ${Math.abs(data.trend)}%`;
        } else if (data.trend < 0) {
            forecastTrend.classList.add('down');
            forecastTrend.textContent = `↓ ${Math.abs(data.trend)}%`;
        } else {
            forecastTrend.textContent = `→ ${Math.abs(data.trend)}%`;
        }
        
        forecastText.textContent = data.forecast;
    }
    
    // Highlight the row to indicate it was updated
    highlightUpdatedRow(row);
}

/**
 * Update a price cell with the new value
 */
function updatePriceCell(cell, value) {
    if (!cell) return;
    
    const valueElement = cell.querySelector('.price-value');
    if (!valueElement) return;
    
    // Get current value for comparison
    const currentValue = parseFloat(cell.getAttribute('data-usd-value')) || 0;
    const newValue = parseFloat(value) || 0;
    
    // Update the cell
    cell.setAttribute('data-usd-value', newValue);
    
    if (newValue === 0) {
        valueElement.textContent = 'N/A';
    } else {
        valueElement.textContent = newValue.toFixed(2);
    }
    
    // Add visual indicator for price change
    if (newValue > currentValue) {
        addPriceChangeIndicator(cell, 'increase');
    } else if (newValue < currentValue) {
        addPriceChangeIndicator(cell, 'decrease');
    }
}

/**
 * Add a visual indicator for price changes
 */
function addPriceChangeIndicator(cell, changeType) {
    // Remove any existing indicators
    const existingIndicator = cell.querySelector('.price-change-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Create new indicator
    const indicator = document.createElement('span');
    indicator.className = 'price-change-indicator';
    
    if (changeType === 'increase') {
        indicator.classList.add('increase');
        indicator.innerHTML = '↑';
        indicator.style.color = 'var(--success-color)';
    } else {
        indicator.classList.add('decrease');
        indicator.innerHTML = '↓';
        indicator.style.color = 'var(--error-color)';
    }
    
    // Style the indicator
    indicator.style.position = 'absolute';
    indicator.style.top = '5px';
    indicator.style.right = '5px';
    indicator.style.fontWeight = 'bold';
    indicator.style.fontSize = '14px';
    indicator.style.animation = 'fadeOut 3s forwards';
    
    // Add indicator to cell
    cell.style.position = 'relative';
    cell.appendChild(indicator);
    
    // Remove indicator after animation
    setTimeout(() => {
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 3000);
}

/**
 * Highlight a row that was updated
 */
function highlightUpdatedRow(row) {
    // Add highlight class
    row.classList.add('row-updated');
    
    // Add animation styles if they don't exist
    if (!document.getElementById('market-data-update-styles')) {
        const style = document.createElement('style');
        style.id = 'market-data-update-styles';
        style.textContent = `
            @keyframes highlightRow {
                0% { background-color: rgba(120, 109, 60, 0.2); }
                70% { background-color: rgba(120, 109, 60, 0.2); }
                100% { background-color: transparent; }
            }
            
            @keyframes fadeOut {
                0% { opacity: 1; }
                70% { opacity: 1; }
                100% { opacity: 0; }
            }
            
            .row-updated {
                animation: highlightRow 3s;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove highlight after animation
    setTimeout(() => {
        row.classList.remove('row-updated');
    }, 3000);
}

/**
 * Update the last update time display
 */
function updateLastUpdateTime(data) {
    const updateTimeElement = document.querySelector('.update-time');
    if (!updateTimeElement || !data || data.length === 0) return;
    
    // Get the most recent update time
    const latestUpdate = data.reduce((latest, item) => {
        const itemDate = new Date(item.last_update);
        return itemDate > latest ? itemDate : latest;
    }, new Date(0));
    
    // Format the date
    const formattedDate = formatDate(latestUpdate);
    
    // Update the element
    updateTimeElement.textContent = `Last update: ${formattedDate}`;
    
    // Add a brief highlight effect
    updateTimeElement.classList.add('time-updated');
    setTimeout(() => {
        updateTimeElement.classList.remove('time-updated');
    }, 2000);
}

/**
 * Format a date for display
 */
function formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month} ${day}, ${hours}:${minutes}`;
}
