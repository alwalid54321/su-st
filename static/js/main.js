// SudaStock main JavaScript file

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // API endpoints
    const API_BASE_URL = '/api';
    const ENDPOINTS = {
        HEALTH: `${API_BASE_URL}/health/`,
        LOGIN: `${API_BASE_URL}/auth/login/`,
        REGISTER: `${API_BASE_URL}/auth/register/`,
        LOGOUT: `${API_BASE_URL}/auth/logout/`,
        MARKET_DATA: `${API_BASE_URL}/market-data/`,
        CURRENCIES: `${API_BASE_URL}/currencies/`,
        ANNOUNCEMENTS: `${API_BASE_URL}/announcements/`,
        USERS: `${API_BASE_URL}/users/`
    };

    // Theme colors from the API
    let themeColors = {
        primaryDark: '#1B1464',
        accent: '#786D3C'
    };

    // Fetch theme colors from the API
    function fetchThemeColors() {
        fetch(ENDPOINTS.HEALTH)
            .then(response => response.json())
            .then(data => {
                if (data.theme) {
                    themeColors = data.theme;
                    updateThemeColors();
                }
            })
            .catch(error => console.error('Error fetching theme colors:', error));
    }

    // Update theme colors in CSS variables
    function updateThemeColors() {
        document.documentElement.style.setProperty('--primary-dark', themeColors.primaryDark);
        document.documentElement.style.setProperty('--accent', themeColors.accent);
    }

    // Initialize theme colors
    fetchThemeColors();

    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            fetch(ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Store token in localStorage
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    // Redirect to home page
                    window.location.href = '/';
                } else {
                    // Show error message
                    const errorElement = document.getElementById('loginError');
                    errorElement.textContent = data.message || 'Login failed. Please try again.';
                    errorElement.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
                const errorElement = document.getElementById('loginError');
                errorElement.textContent = 'An error occurred. Please try again.';
                errorElement.style.display = 'block';
            });
        });
    }

    // Register form handling
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Check if passwords match
            if (password !== confirmPassword) {
                const errorElement = document.getElementById('registerError');
                errorElement.textContent = 'Passwords do not match.';
                errorElement.style.display = 'block';
                return;
            }
            
            fetch(ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message and redirect to login
                    const successElement = document.getElementById('registerSuccess');
                    successElement.textContent = data.message || 'Registration successful! Redirecting to login...';
                    successElement.style.display = 'block';
                    
                    setTimeout(() => {
                        window.location.href = '/login/';
                    }, 2000);
                } else {
                    // Show error message
                    const errorElement = document.getElementById('registerError');
                    errorElement.textContent = data.message || 'Registration failed. Please try again.';
                    errorElement.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
                const errorElement = document.getElementById('registerError');
                errorElement.textContent = 'An error occurred. Please try again.';
                errorElement.style.display = 'block';
            });
        });
    }

    // Logout functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const token = localStorage.getItem('token');
            
            fetch(ENDPOINTS.LOGOUT, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                // Clear localStorage and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login/';
            })
            .catch(error => {
                console.error('Error during logout:', error);
                // Still clear localStorage and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login/';
            });
        });
    }

    // Format trend indicators
    function formatTrend(trend) {
        if (trend > 0) {
            return '<span class="trend-up">↑</span>';
        } else if (trend < 0) {
            return '<span class="trend-down">↓</span>';
        } else {
            return '<span class="trend-stable">→</span>';
        }
    }

    // Market data page
    const marketDataContainer = document.getElementById('marketDataContainer');
    if (marketDataContainer) {
        const token = localStorage.getItem('token');
        
        // Use the correct URL for the market data endpoint
        fetch('/market-data/', {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                let html = '';
                
                data.forEach(item => {
                    html += `
                    <div class="col-md-4">
                        <div class="card market-data-card">
                            <div class="card-header card-header-primary">
                                ${item.name} ${formatTrend(item.trend)}
                            </div>
                            <div class="card-body">
                                <p><strong>Value:</strong> $${item.value}</p>
                                <p><strong>Status:</strong> ${item.status}</p>
                                <p><strong>Forecast:</strong> ${item.forecast}</p>
                                <p><strong>Port Sudan:</strong> $${item.port_sudan}</p>
                                <p><strong>DMT China:</strong> $${item.dmt_china}</p>
                                <p><strong>DMT UAE:</strong> $${item.dmt_uae}</p>
                                <p><strong>DMT India:</strong> $${item.dmt_india}</p>
                            </div>
                        </div>
                    </div>
                    `;
                });
                
                marketDataContainer.innerHTML = html;
            } else {
                marketDataContainer.innerHTML = '<div class="alert alert-warning">No market data available.</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching market data:', error);
            marketDataContainer.innerHTML = '<div class="alert alert-danger">Error loading market data. Please try again later.</div>';
        });
    }

    // Currencies page
    const currenciesContainer = document.getElementById('currenciesContainer');
    if (currenciesContainer) {
        const token = localStorage.getItem('token');
        
        fetch(ENDPOINTS.CURRENCIES, {
            headers: {
                'Authorization': `Token ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                let html = '';
                
                data.data.forEach(currency => {
                    html += `
                    <div class="col-md-4">
                        <div class="card currency-card">
                            <div class="card-body">
                                <div class="currency-code">${currency.code} ${formatTrend(currency.trend)}</div>
                                <div class="currency-name">${currency.name}</div>
                                <div class="currency-rate">${currency.rate}</div>
                                <div class="text-muted">Last updated: ${new Date(currency.last_update).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    `;
                });
                
                currenciesContainer.innerHTML = html;
            } else {
                currenciesContainer.innerHTML = '<div class="alert alert-warning">No currency data available.</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching currencies:', error);
            currenciesContainer.innerHTML = '<div class="alert alert-danger">Error loading currency data. Please try again later.</div>';
        });
    }

    // Announcements page
    const announcementsContainer = document.getElementById('announcementsContainer');
    if (announcementsContainer) {
        const token = localStorage.getItem('token');
        
        fetch(ENDPOINTS.ANNOUNCEMENTS, {
            headers: {
                'Authorization': `Token ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                let html = '';
                
                data.data.forEach(announcement => {
                    let priorityClass = '';
                    if (announcement.priority === 'high') {
                        priorityClass = 'priority-high';
                    } else if (announcement.priority === 'medium') {
                        priorityClass = 'priority-medium';
                    } else {
                        priorityClass = 'priority-low';
                    }
                    
                    html += `
                    <div class="card mb-3 ${priorityClass}">
                        <div class="card-header card-header-accent">
                            ${announcement.title}
                        </div>
                        <div class="card-body">
                            <p>${announcement.content}</p>
                            <div class="text-muted">Posted: ${new Date(announcement.created_at).toLocaleString()}</div>
                        </div>
                    </div>
                    `;
                });
                
                announcementsContainer.innerHTML = html;
            } else {
                announcementsContainer.innerHTML = '<div class="alert alert-warning">No announcements available.</div>';
            }
        })
        .catch(error => {
            console.error('Error fetching announcements:', error);
            announcementsContainer.innerHTML = '<div class="alert alert-danger">Error loading announcements. Please try again later.</div>';
        });
    }

    // Admin Dashboard
    const adminDashboard = document.getElementById('adminDashboard');
    if (adminDashboard) {
        // Dashboard specific JavaScript can be added here
        console.log('Admin Dashboard loaded');
    }

    // Admin Market Data
    const adminMarketDataTable = document.getElementById('marketDataTableBody');
    if (adminMarketDataTable) {
        // Add event listeners for edit buttons
        const editButtons = document.querySelectorAll('.edit-market-data');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                fetch(`${ENDPOINTS.MARKET_DATA}${id}/`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('marketDataId').value = data.id;
                        document.getElementById('name').value = data.name;
                        document.getElementById('value').value = data.value;
                        document.getElementById('port_sudan').value = data.port_sudan;
                        document.getElementById('dmt_china').value = data.dmt_china;
                        document.getElementById('dmt_uae').value = data.dmt_uae;
                        document.getElementById('dmt_india').value = data.dmt_india;
                        document.getElementById('status').value = data.status;
                        document.getElementById('forecast').value = data.forecast;
                        document.getElementById('trend').value = data.trend;
                    })
                    .catch(error => console.error('Error fetching market data:', error));
            });
        });

        // Add event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-market-data');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this market data?')) {
                    const id = this.getAttribute('data-id');
                    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                    
                    fetch(`${ENDPOINTS.MARKET_DATA}${id}/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': csrfToken
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            throw new Error('Failed to delete market data');
                        }
                    })
                    .catch(error => console.error('Error deleting market data:', error));
                }
            });
        });
    }

    // Admin Currencies
    const adminCurrenciesTable = document.getElementById('currenciesTableBody');
    if (adminCurrenciesTable) {
        // Add event listeners for edit buttons
        const editButtons = document.querySelectorAll('.edit-currency');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                fetch(`${ENDPOINTS.CURRENCIES}${id}/`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('currencyId').value = data.id;
                        document.getElementById('code').value = data.code;
                        document.getElementById('name').value = data.name;
                        document.getElementById('rate').value = data.rate;
                    })
                    .catch(error => console.error('Error fetching currency:', error));
            });
        });

        // Add event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-currency');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this currency?')) {
                    const id = this.getAttribute('data-id');
                    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                    
                    fetch(`${ENDPOINTS.CURRENCIES}${id}/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': csrfToken
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            throw new Error('Failed to delete currency');
                        }
                    })
                    .catch(error => console.error('Error deleting currency:', error));
                }
            });
        });
    }

    // Admin Announcements
    const adminAnnouncementsTable = document.getElementById('announcementsTableBody');
    if (adminAnnouncementsTable) {
        // Add event listeners for edit buttons
        const editButtons = document.querySelectorAll('.edit-announcement');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                fetch(`${ENDPOINTS.ANNOUNCEMENTS}${id}/`)
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('announcementId').value = data.id;
                        document.getElementById('title').value = data.title;
                        document.getElementById('content').value = data.content;
                        document.getElementById('priority').value = data.priority;
                        document.getElementById('status').value = data.status;
                    })
                    .catch(error => console.error('Error fetching announcement:', error));
            });
        });

        // Add event listeners for delete buttons
        const deleteButtons = document.querySelectorAll('.delete-announcement');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this announcement?')) {
                    const id = this.getAttribute('data-id');
                    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
                    
                    fetch(`${ENDPOINTS.ANNOUNCEMENTS}${id}/`, {
                        method: 'DELETE',
                        headers: {
                            'X-CSRFToken': csrfToken
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            window.location.reload();
                        } else {
                            throw new Error('Failed to delete announcement');
                        }
                    })
                    .catch(error => console.error('Error deleting announcement:', error));
                }
            });
        });
    }

    // Gallery slider
    const slider = document.querySelector(".gallery-slides");
    const slides = document.querySelectorAll(".gallery-slide");
    const totalSlides = slides.length;
    let currentIndex = 0;
    let interval;
    const navDots = document.getElementById("galleryNav");
    const prevBtn = document.getElementById("galleryPrev");
    const nextBtn = document.getElementById("galleryNext");

    // Create navigation dots
    function createNavDots() {
        if (!navDots) return;
        
        navDots.innerHTML = '';
        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement("div");
            dot.classList.add("gallery-nav-dot");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => {
                currentIndex = i;
                updateSlider();
            });
            navDots.appendChild(dot);
        }
    }

    function startSlider() {
        interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        }, 5000); // 5 seconds per slide
    }

    function stopSlider() {
        clearInterval(interval);
    }

    function updateSlider() {
        if (!slider) return;
        
        // Update slider position
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update active dot
        if (navDots) {
            const dots = navDots.querySelectorAll(".gallery-nav-dot");
            dots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        }
    }

    // Initialize navigation
    createNavDots();

    // Add event listeners for navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
            stopSlider();
            startSlider();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
            stopSlider();
            startSlider();
        });
    }

    // Start auto-sliding
    if (slider && slides.length > 0) {
        startSlider();

        // Pause on hover
        slider.addEventListener("mouseenter", stopSlider);
        slider.addEventListener("mouseleave", startSlider);
        
        // Handle touch events for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener("touchstart", (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopSlider();
        }, {passive: true});
        
        slider.addEventListener("touchend", (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startSlider();
        }, {passive: true});
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - go to next slide
                currentIndex = (currentIndex + 1) % totalSlides;
                updateSlider();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - go to previous slide
                currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
                updateSlider();
            }
        }
    }
});
