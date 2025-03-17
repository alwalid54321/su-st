/**
 * CNF Unified Admin Interface
 * JavaScript for managing CNF products and calculations in a unified interface
 * Uses brand colors: Gold accent (#786D3C) and Dark blue (#1B1464)
 */

document.addEventListener('DOMContentLoaded', function() {
    // Add animation to cards
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
    
    // Handle view calculations button click
    const viewCalculationsButtons = document.querySelectorAll('.view-calculations');
    viewCalculationsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            document.getElementById('product-select').value = productId;
            
            // Switch to calculations tab
            const calculationsTab = document.getElementById('calculations-tab');
            bootstrap.Tab.getOrCreateInstance(calculationsTab).show();
            
            // Load calculations for the selected product
            loadCalculations(productId);
        });
    });
    
    // Handle product selection change
    document.getElementById('product-select').addEventListener('change', function() {
        const productId = this.value;
        if (productId) {
            loadCalculations(productId);
        } else {
            document.getElementById('calculation-container').style.display = 'none';
        }
    });
    
    // Handle override checkboxes
    const overrideCheckboxes = document.querySelectorAll('.override-checkbox');
    overrideCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const inputId = this.id.replace('override-', 'new-');
            const input = document.getElementById(inputId);
            
            if (this.checked) {
                input.disabled = false;
                input.focus();
                input.parentElement.classList.add('border-accent');
            } else {
                input.disabled = true;
                input.parentElement.classList.remove('border-accent');
            }
        });
    });
    
    // Handle form submission
    document.getElementById('update-calculation-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const calculationId = document.getElementById('calculation-id').value;
        const productId = document.getElementById('product-id').value;
        const destination = document.getElementById('destination').value;
        
        // Check if any override is selected
        let hasOverride = false;
        const overrides = {};
        
        if (document.getElementById('override-cnf-price').checked) {
            hasOverride = true;
            overrides.cnf_price = document.getElementById('new-cnf-price').value;
        }
        
        if (document.getElementById('override-fob-price').checked) {
            hasOverride = true;
            overrides.fob_price = document.getElementById('new-fob-price').value;
        }
        
        if (document.getElementById('override-total-sdg').checked) {
            hasOverride = true;
            overrides.total_cost_sdg = document.getElementById('new-total-sdg').value;
        }
        
        if (document.getElementById('override-total-usd').checked) {
            hasOverride = true;
            overrides.total_cost_usd = document.getElementById('new-total-usd').value;
        }
        
        if (!hasOverride) {
            alert('Please select at least one value to override.');
            return;
        }
        
        // Send update request
        updateCalculation(calculationId, productId, destination, overrides);
    });
    
    // Function to load calculations for a product
    function loadCalculations(productId) {
        document.getElementById('calculation-container').style.display = 'block';
        document.getElementById('history-loading').style.display = 'block';
        document.getElementById('history-empty').style.display = 'none';
        document.getElementById('calculation-history').innerHTML = '';
        
        // Reset form
        document.getElementById('update-calculation-form').reset();
        document.getElementById('product-id').value = productId;
        
        // Fetch product details
        fetch(`/api/cnf/product/${productId}/`)
            .then(response => response.json())
            .then(product => {
                // Populate base information
                document.getElementById('base-cost').textContent = product.cost_per_unit_sdg;
                document.getElementById('waste-percentage').textContent = product.waste_percentage;
                
                // Fetch calculation history
                return fetch(`/api/cnf/calculations/?product_id=${productId}`);
            })
            .then(response => response.json())
            .then(calculations => {
                document.getElementById('history-loading').style.display = 'none';
                
                if (calculations.length === 0) {
                    document.getElementById('history-empty').style.display = 'block';
                    return;
                }
                
                // Display calculations
                const historyContainer = document.getElementById('calculation-history');
                historyContainer.innerHTML = '';
                
                calculations.forEach(calc => {
                    const item = document.createElement('div');
                    item.className = `calculation-item ${calc.is_current ? 'current' : ''}`;
                    item.setAttribute('data-calculation-id', calc.id);
                    
                    const date = new Date(calc.calculation_date).toLocaleString();
                    const status = calc.is_current ? '<span class="badge bg-primary-dark">Current</span>' : '';
                    const override = calc.is_manual_override ? '<span class="badge bg-accent">Manual Override</span>' : '';
                    
                    item.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">${calc.destination} - ${date}</h6>
                            <div>
                                ${status} ${override}
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-6">
                                <small><strong>CNF Price:</strong> $${calc.cnf_price}</small>
                            </div>
                            <div class="col-6">
                                <small><strong>FOB Price:</strong> $${calc.fob_price}</small>
                            </div>
                        </div>
                        <div class="text-end mt-2">
                            <button class="btn btn-sm btn-accent view-calculation" data-calculation-id="${calc.id}">
                                <i class="fas fa-eye me-1"></i> View
                            </button>
                            <button class="btn btn-sm btn-accent view-calculation-history" data-product-id="${productId}" data-destination="${calc.destination}">
                                <i class="fas fa-chart-line me-1"></i> View History
                            </button>
                        </div>
                    `;
                    
                    historyContainer.appendChild(item);
                    
                    // If this is the current calculation, load it by default
                    if (calc.is_current) {
                        loadCalculationDetails(calc.id);
                    }
                });
                
                // Add event listeners to view buttons
                document.querySelectorAll('.view-calculation').forEach(button => {
                    button.addEventListener('click', function() {
                        const calculationId = this.getAttribute('data-calculation-id');
                        loadCalculationDetails(calculationId);
                    });
                });
                
                // Add event listeners to view history buttons
                document.querySelectorAll('.view-calculation-history').forEach(button => {
                    button.addEventListener('click', function() {
                        const productId = this.getAttribute('data-product-id');
                        const destination = this.getAttribute('data-destination');
                        viewCalculationHistory(productId, destination);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading calculations:', error);
                document.getElementById('history-loading').style.display = 'none';
                document.getElementById('history-empty').style.display = 'block';
                document.getElementById('history-empty').innerHTML = `
                    <i class="fas fa-exclamation-triangle fa-3x mb-3" style="color: #dc3545;"></i>
                    <p>Error loading calculation history</p>
                `;
            });
    }
    
    // Function to load calculation details
    function loadCalculationDetails(calculationId) {
        fetch(`/api/cnf/calculation/${calculationId}/`)
            .then(response => response.json())
            .then(calc => {
                // Highlight the selected calculation
                document.querySelectorAll('.calculation-item').forEach(item => {
                    item.classList.remove('selected');
                });
                document.querySelector(`.calculation-item[data-calculation-id="${calculationId}"]`).classList.add('selected');
                
                // Set form values
                document.getElementById('calculation-id').value = calc.id;
                document.getElementById('product-id').value = calc.product_id;
                document.getElementById('destination').value = calc.destination;
                
                // Set current values
                document.getElementById('current-product').textContent = calc.product_name;
                document.getElementById('current-destination').textContent = calc.destination;
                document.getElementById('current-date').textContent = new Date(calc.calculation_date).toLocaleString();
                document.getElementById('current-total-sdg').textContent = calc.total_cost_sdg + ' SDG';
                document.getElementById('current-total-usd').textContent = '$' + calc.total_cost_usd;
                document.getElementById('current-cnf-price').textContent = '$' + calc.cnf_price;
                
                // Set cost components
                document.getElementById('cleaning-cost').textContent = calc.cleaning_cost || '-';
                document.getElementById('empty-bags-cost').textContent = calc.empty_bags_cost || '-';
                document.getElementById('printing-cost').textContent = calc.printing_cost || '-';
                document.getElementById('handling-cost').textContent = calc.handling_cost || '-';
                document.getElementById('paperwork-cost').textContent = calc.paperwork_cost || '-';
                document.getElementById('customs-duty-cost').textContent = calc.customs_duty_cost || '-';
                document.getElementById('clearance-cost').textContent = calc.clearance_cost || '-';
                document.getElementById('local-transport-cost').textContent = calc.local_transport_cost || '-';
                document.getElementById('international-transport-cost').textContent = calc.international_transport_cost || '-';
                document.getElementById('exchange-rate').textContent = calc.exchange_rate || '-';
                
                // Reset override checkboxes
                document.querySelectorAll('.override-checkbox').forEach(checkbox => {
                    checkbox.checked = false;
                    const inputId = checkbox.id.replace('override-', 'new-');
                    const input = document.getElementById(inputId);
                    input.disabled = true;
                    input.parentElement.classList.remove('border-accent');
                });
                
                // Set default values for override fields
                document.getElementById('new-cnf-price').value = calc.cnf_price;
                document.getElementById('new-fob-price').value = calc.fob_price;
                document.getElementById('new-total-sdg').value = calc.total_cost_sdg;
                document.getElementById('new-total-usd').value = calc.total_cost_usd;
                
                // Disable form if not current calculation
                const updateButton = document.getElementById('update-calculation-btn');
                if (!calc.is_current) {
                    updateButton.disabled = true;
                    updateButton.innerHTML = '<i class="fas fa-lock me-2"></i>Historical Record (Cannot Update)';
                    document.querySelectorAll('.override-checkbox').forEach(checkbox => {
                        checkbox.disabled = true;
                    });
                } else {
                    updateButton.disabled = false;
                    updateButton.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
                    document.querySelectorAll('.override-checkbox').forEach(checkbox => {
                        checkbox.disabled = false;
                    });
                }
            })
            .catch(error => {
                console.error('Error loading calculation details:', error);
                alert('Error loading calculation details. Please try again.');
            });
    }
    
    // Function to update calculation
    function updateCalculation(calculationId, productId, destination, overrides) {
        const csrftoken = getCookie('csrftoken');
        
        fetch('/api/cnf/calculation/update/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                calculation_id: calculationId,
                overrides: overrides
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                const successAlert = document.createElement('div');
                successAlert.className = 'alert alert-success alert-dismissible fade show';
                successAlert.innerHTML = `
                    <strong>Success!</strong> Calculation updated successfully.
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                document.getElementById('alerts-container').appendChild(successAlert);
                
                // Reload calculations
                loadCalculations(productId);
                
                // Update market data if available
                updateMarketData(productId, destination);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        })
        .catch(error => {
            console.error('Error updating calculation:', error);
            
            // Show error message
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger alert-dismissible fade show';
            errorAlert.innerHTML = `
                <strong>Error!</strong> ${error.message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            document.getElementById('alerts-container').appendChild(errorAlert);
        });
    }
    
    // Function to update market data from calculation
    function updateMarketData(productId, destination) {
        const csrftoken = getCookie('csrftoken');
        
        fetch('/api/update-market-data-prices/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                product_id: productId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Market data updated successfully:', data.market_data);
            } else {
                console.warn('Market data update warning:', data.error);
            }
        })
        .catch(error => {
            console.error('Error updating market data:', error);
        });
    }
    
    // Function to view calculation history with market data integration
    function viewCalculationHistory(productId, destination) {
        // Show history modal
        const historyModal = new bootstrap.Modal(document.getElementById('history-modal'));
        historyModal.show();
        
        // Show loading spinner
        document.getElementById('history-modal-body').innerHTML = `
            <div class="text-center p-4">
                <div class="spinner-border" style="color: var(--primary-dark);" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading history data...</p>
            </div>
        `;
        
        // Fetch calculation history with market data
        fetch(`/api/cnf/calculation/history/?product_id=${productId}&destination=${destination}`)
            .then(response => response.json())
            .then(data => {
                // Prepare data for chart
                const calculationDates = data.calculation_history.map(calc => new Date(calc.calculation_date));
                const calculationPrices = data.calculation_history.map(calc => calc.cnf_price);
                
                let marketDataDates = [];
                let marketDataValues = [];
                
                if (data.market_data_history && data.market_data_history.length > 0) {
                    marketDataDates = data.market_data_history.map(item => new Date(item.date));
                    marketDataValues = data.market_data_history.map(item => item.value);
                }
                
                // Create HTML content
                let content = `
                    <h5 class="mb-3">${data.product.name} - ${destination}</h5>
                    <div class="history-chart-container">
                        <canvas id="historyChart"></canvas>
                    </div>
                    <div class="row mt-4">
                        <div class="col-md-6">
                            <h6 class="border-bottom pb-2 mb-3" style="color: var(--primary-dark);">
                                <i class="fas fa-calculator me-2"></i>Calculation History
                            </h6>
                            <div class="history-list">
                `;
                
                // Add calculation history items
                data.calculation_history.forEach(calc => {
                    const date = new Date(calc.calculation_date).toLocaleString();
                    const override = calc.is_manual_override ? 
                        '<span class="badge bg-accent ms-2">Manual Override</span>' : '';
                    
                    content += `
                        <div class="history-item mb-2 p-2 border-start ${calc.is_current ? 'border-primary-dark' : 'border-light'}">
                            <div class="d-flex justify-content-between">
                                <small class="text-muted">${date}</small>
                                ${calc.is_current ? '<span class="badge bg-primary-dark">Current</span>' : ''}
                                ${override}
                            </div>
                            <div class="mt-1">
                                <strong>CNF Price:</strong> $${calc.cnf_price.toFixed(2)} | 
                                <strong>FOB:</strong> $${calc.fob_price.toFixed(2)}
                            </div>
                        </div>
                    `;
                });
                
                content += `
                            </div>
                        </div>
                `;
                
                // Add market data history if available
                if (data.product.has_market_data) {
                    content += `
                        <div class="col-md-6">
                            <h6 class="border-bottom pb-2 mb-3" style="color: var(--accent);">
                                <i class="fas fa-chart-line me-2"></i>Market Data History
                            </h6>
                            <div class="history-list">
                    `;
                    
                    if (data.market_data_history && data.market_data_history.length > 0) {
                        data.market_data_history.forEach(item => {
                            const date = new Date(item.date).toLocaleString();
                            const trend = item.trend ? 
                                (item.trend === 'up' ? 
                                    '<i class="fas fa-arrow-up text-success"></i>' : 
                                    '<i class="fas fa-arrow-down text-danger"></i>') : '';
                            
                            content += `
                                <div class="history-item mb-2 p-2 border-start border-light">
                                    <div class="d-flex justify-content-between">
                                        <small class="text-muted">${date}</small>
                                        ${item.status ? `<span class="badge bg-secondary">${item.status}</span>` : ''}
                                    </div>
                                    <div class="mt-1">
                                        <strong>Value:</strong> $${item.value.toFixed(2)} ${trend}
                                    </div>
                                </div>
                            `;
                        });
                    } else {
                        content += `
                            <div class="alert alert-info">
                                No market data history available
                            </div>
                        `;
                    }
                    
                    content += `
                            </div>
                        </div>
                    `;
                } else {
                    content += `
                        <div class="col-md-6">
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                This product is not linked to any market data
                            </div>
                        </div>
                    `;
                }
                
                content += `
                    </div>
                `;
                
                // Update modal content
                document.getElementById('history-modal-body').innerHTML = content;
                
                // Initialize chart if we have data
                if (calculationDates.length > 0) {
                    const ctx = document.getElementById('historyChart').getContext('2d');
                    
                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: calculationDates,
                            datasets: [
                                {
                                    label: 'CNF Calculations',
                                    data: calculationPrices,
                                    borderColor: '#1B1464',
                                    backgroundColor: 'rgba(27, 20, 100, 0.1)',
                                    borderWidth: 2,
                                    tension: 0.1
                                },
                                ...(marketDataDates.length > 0 ? [{
                                    label: 'Market Data',
                                    data: marketDataValues,
                                    borderColor: '#786D3C',
                                    backgroundColor: 'rgba(120, 109, 60, 0.1)',
                                    borderWidth: 2,
                                    borderDash: [5, 5],
                                    tension: 0.1
                                }] : [])
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    type: 'time',
                                    time: {
                                        unit: 'day'
                                    }
                                },
                                y: {
                                    beginAtZero: false
                                }
                            }
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error loading history:', error);
                document.getElementById('history-modal-body').innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error loading history data: ${error.message || 'Unknown error'}
                    </div>
                `;
            });
    }
    
    // Helper function to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
