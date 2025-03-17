/**
 * Home Market Data JavaScript
 * Handles updating market data on the home page when CNF calculations are updated
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize market data table
    initializeMarketDataTable();
    
    // Set up polling for market data updates
    setupMarketDataPolling();
    
    // Set up refresh button
    setupRefreshButton();
    
    // Set up currency toggle
    setupCurrencyToggle();
});

/**
 * Initialize the market data table
 */
function initializeMarketDataTable() {
    // Add hover effects to table rows
    const tableRows = document.querySelectorAll('.market-table tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.classList.add('row-hover');
        });
        row.addEventListener('mouseleave', function() {
            this.classList.remove('row-hover');
        });
    });
    
    // Add sorting functionality
    addTableSorting();
}

/**
 * Add sorting functionality to the market data table
 */
function addTableSorting() {
    const table = document.querySelector('.market-table');
    if (!table) return;
    
    const headers = table.querySelectorAll('th');
    
    headers.forEach((header, index) => {
        // Skip the action column
        if (header.classList.contains('action-column')) {
            return;
        }
        
        header.addEventListener('click', function() {
            sortTable(index);
        });
        
        // Add sort indicator and cursor style
        header.style.cursor = 'pointer';
        header.setAttribute('data-sort-direction', '');
        
        // Add sort icon container
        const sortIcon = document.createElement('span');
        sortIcon.className = 'sort-icon';
        sortIcon.innerHTML = ' ⇅';
        sortIcon.style.opacity = '0.3';
        header.appendChild(sortIcon);
    });
}

/**
 * Sort the table by the specified column index
 */
function sortTable(columnIndex) {
    const table = document.querySelector('.market-table');
    const header = table.querySelectorAll('th')[columnIndex];
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // Get current sort direction
    const currentDirection = header.getAttribute('data-sort-direction');
    const direction = currentDirection === 'asc' ? 'desc' : 'asc';
    
    // Update sort direction for all headers
    table.querySelectorAll('th').forEach(th => {
        th.setAttribute('data-sort-direction', '');
        th.querySelector('.sort-icon').style.opacity = '0.3';
    });
    
    // Set new sort direction for current header
    header.setAttribute('data-sort-direction', direction);
    header.querySelector('.sort-icon').style.opacity = '1';
    header.querySelector('.sort-icon').innerHTML = direction === 'asc' ? ' ↑' : ' ↓';
    
    // Sort rows
    rows.sort((a, b) => {
        let aValue, bValue;
        
        // Handle different column types
        if (columnIndex === 0) {
            // Product name column
            aValue = a.querySelector('.product-name').textContent.trim();
            bValue = b.querySelector('.product-name').textContent.trim();
        } else if (columnIndex >= 1 && columnIndex <= 5) {
            // Price columns
            aValue = parseFloat(a.querySelectorAll('td')[columnIndex].getAttribute('data-usd-value')) || 0;
            bValue = parseFloat(b.querySelectorAll('td')[columnIndex].getAttribute('data-usd-value')) || 0;
        } else if (columnIndex === 6) {
            // Status column
            aValue = a.querySelectorAll('td')[columnIndex].textContent.trim();
            bValue = b.querySelectorAll('td')[columnIndex].textContent.trim();
        } else if (columnIndex === 7) {
            // Forecast column
            const aTrend = a.querySelector('.forecast-trend');
            const bTrend = b.querySelector('.forecast-trend');
            
            aValue = aTrend ? parseFloat(aTrend.textContent.replace(/[^0-9.-]/g, '')) || 0 : 0;
            bValue = bTrend ? parseFloat(bTrend.textContent.replace(/[^0-9.-]/g, '')) || 0 : 0;
        }
        
        // Compare values
        if (typeof aValue === 'string') {
            return direction === 'asc' 
                ? aValue.localeCompare(bValue) 
                : bValue.localeCompare(aValue);
        } else {
            return direction === 'asc' 
                ? aValue - bValue 
                : bValue - aValue;
        }
    });
    
    // Reorder rows in the table
    rows.forEach(row => tbody.appendChild(row));
}

/**
 * Set up currency toggle functionality
 */
function setupCurrencyToggle() {
    const currencyOptions = document.querySelectorAll('.currency-option');
    
    currencyOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            currencyOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Get currency code and rate
            const currencyCode = this.getAttribute('data-currency');
            const exchangeRate = parseFloat(this.getAttribute('data-rate')) || 1;
            
            // Update prices
            updatePricesWithCurrency(currencyCode, exchangeRate);
        });
    });
}

/**
 * Update prices with the selected currency and exchange rate
 */
function updatePricesWithCurrency(currencyCode, exchangeRate) {
    const priceCells = document.querySelectorAll('.price-cell');
    const currencySymbol = getCurrencySymbol(currencyCode);
    
    priceCells.forEach(cell => {
        const usdValue = parseFloat(cell.getAttribute('data-usd-value')) || 0;
        const convertedValue = (usdValue * exchangeRate).toFixed(2);
        
        const symbolElement = cell.querySelector('.currency-symbol');
        const valueElement = cell.querySelector('.price-value');
        
        if (symbolElement && valueElement) {
            symbolElement.textContent = currencySymbol;
            
            if (usdValue === 0) {
                valueElement.textContent = 'N/A';
            } else {
                valueElement.textContent = convertedValue;
            }
        }
    });
    
    // Update base currency display
    const baseCurrencyElements = document.querySelectorAll('.base-currency');
    baseCurrencyElements.forEach(element => {
        element.textContent = currencyCode;
    });
}

/**
 * Get currency symbol for the specified currency code
 */
function getCurrencySymbol(currencyCode) {
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥',
        'SDG': 'SDG',
        'AED': 'AED',
        'TRY': '₺'
    };
    
    return symbols[currencyCode] || currencyCode;
}

/**
 * Set up refresh button
 */
function setupRefreshButton() {
    const refreshButton = document.getElementById('refreshMarketData');
    if (!refreshButton) return;
    
    refreshButton.addEventListener('click', function() {
        // Show loading state
        this.classList.add('loading');
        this.innerHTML = '<i class="fas fa-sync fa-spin"></i> Refreshing...';
        
        // Fetch updates
        fetchMarketDataUpdates().then(() => {
            // Reset button after refresh
            setTimeout(() => {
                this.classList.remove('loading');
                this.innerHTML = '<i class="fas fa-sync"></i> Refresh';
            }, 1000);
        });
    });
}

/**
 * Set up polling for market data updates
 */
function setupMarketDataPolling() {
    // Poll for updates every 30 seconds
    setInterval(fetchMarketDataUpdates, 30000);
    
    // Initial fetch
    fetchMarketDataUpdates();
}

/**
 * Fetch market data updates from the API
 */
function fetchMarketDataUpdates() {
    return fetch('/api/market-data/')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch market data updates');
            }
            return response.json();
        })
        .then(data => {
            updateMarketDataTable(data);
            updateLastUpdateTime();
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
    if (!marketData || !Array.isArray(marketData)) return;
    
    const table = document.querySelector('.market-table');
    if (!table) return;
    
    const tbody = table.querySelector('tbody');
    const rows = tbody.querySelectorAll('tr');
    
    // Update existing rows
    rows.forEach(row => {
        const productId = row.getAttribute('data-product-id');
        if (!productId) return;
        
        const matchingData = marketData.find(item => item.id.toString() === productId);
        if (matchingData) {
            updateRowData(row, matchingData);
        }
    });
    
    // Preserve current currency selection
    const activeCurrency = document.querySelector('.currency-option.active');
    if (activeCurrency) {
        const currencyCode = activeCurrency.getAttribute('data-currency');
        const exchangeRate = parseFloat(activeCurrency.getAttribute('data-rate')) || 1;
        
        if (currencyCode !== 'USD') {
            updatePricesWithCurrency(currencyCode, exchangeRate);
        }
    }
}

/**
 * Update a table row with the new market data
 */
function updateRowData(row, data) {
    // Update price cells
    updatePriceCell(row.querySelectorAll('td')[1], data.port_sudan);
    updatePriceCell(row.querySelectorAll('td')[2], data.dmt_china);
    updatePriceCell(row.querySelectorAll('td')[3], data.dmt_uae);
    updatePriceCell(row.querySelectorAll('td')[4], data.dmt_mersing);
    updatePriceCell(row.querySelectorAll('td')[5], data.dmt_india);
    
    // Update status
    const statusCell = row.querySelectorAll('td')[6];
    const statusBadge = statusCell.querySelector('.status-badge');
    
    if (statusBadge) {
        statusBadge.className = 'status-badge';
        statusBadge.classList.add(data.status.toLowerCase());
        statusBadge.textContent = data.status;
    }
    
    // Update forecast
    const forecastCell = row.querySelectorAll('td')[7];
    const forecastTrend = forecastCell.querySelector('.forecast-trend');
    const forecastText = forecastCell.querySelector('span:last-child');
    
    if (forecastTrend && forecastText) {
        // Clear existing classes
        forecastTrend.className = 'forecast-trend';
        
        // Set trend direction
        if (data.trend > 0) {
            forecastTrend.classList.add('up');
            forecastTrend.innerHTML = `↑ ${Math.abs(data.trend).toFixed(1)}%`;
        } else if (data.trend < 0) {
            forecastTrend.classList.add('down');
            forecastTrend.innerHTML = `↓ ${Math.abs(data.trend).toFixed(1)}%`;
        } else {
            forecastTrend.innerHTML = `→ ${Math.abs(data.trend).toFixed(1)}%`;
        }
        
        // Update forecast text
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
        indicator.style.color = '#28a745';
    } else {
        indicator.classList.add('decrease');
        indicator.innerHTML = '↓';
        indicator.style.color = '#dc3545';
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
    
    // Add animation styles if they don't exist
    if (!document.getElementById('price-change-styles')) {
        const style = document.createElement('style');
        style.id = 'price-change-styles';
        style.textContent = `
            @keyframes fadeOut {
                0% { opacity: 1; }
                70% { opacity: 1; }
                100% { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Highlight a row that was updated
 */
function highlightUpdatedRow(row) {
    // Add highlight class
    row.classList.add('row-updated');
    
    // Add animation styles if they don't exist
    if (!document.getElementById('row-update-styles')) {
        const style = document.createElement('style');
        style.id = 'row-update-styles';
        style.textContent = `
            @keyframes highlightRow {
                0% { background-color: rgba(120, 109, 60, 0.2); }
                70% { background-color: rgba(120, 109, 60, 0.2); }
                100% { background-color: transparent; }
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
function updateLastUpdateTime() {
    const updateTimeElement = document.querySelector('.update-time');
    if (!updateTimeElement) return;
    
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    updateTimeElement.textContent = `Last update: ${months[now.getMonth()]} ${now.getDate()}, ${hours}:${minutes}`;
    updateTimeElement.classList.add('time-updated');
    
    setTimeout(() => {
        updateTimeElement.classList.remove('time-updated');
    }, 2000);
}
