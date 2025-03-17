// Cookie Consent Management System for SudaStock
document.addEventListener('DOMContentLoaded', function() {
    // Cookie consent configuration
    const cookieConfig = {
        // Cookie expiration in days
        expireDays: 365,
        // Cookie name
        cookieName: 'sudastock_cookie_consent',
        // Default cookie preferences
        defaultPreferences: {
            necessary: true, // Always true, cannot be disabled
            preferences: true,
            analytics: true,
            marketing: false
        },
        // Secure cookie settings
        cookieSecure: true,  // Only transmit cookies over HTTPS
        cookieSameSite: 'Lax'  // Restrict cookie sending to same-site contexts
    };

    // Initialize cookie consent system
    initCookieConsent();

    /**
     * Initialize the cookie consent system
     */
    function initCookieConsent() {
        // Check if user has already made a choice
        const savedPreferences = getCookiePreferences();
        
        if (!savedPreferences) {
            // If no preferences are saved, show the cookie consent popup
            showCookieConsent();
        } else {
            // Apply saved preferences
            applyPreferences(savedPreferences);
        }

        // Force HTTPS if on HTTP
        enforceHttps();
    }

    /**
     * Force redirect to HTTPS if currently on HTTP
     */
    function enforceHttps() {
        if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && !window.location.hostname.startsWith('127.0.0.1')) {
            window.location.href = window.location.href.replace('http:', 'https:');
        }
    }

    /**
     * Show the cookie consent popup
     */
    function showCookieConsent() {
        const cookieConsent = document.getElementById('cookieConsent');
        if (cookieConsent) {
            cookieConsent.style.display = 'block';
        }
    }

    /**
     * Get cookie preferences from browser storage
     * @returns {Object|null} Cookie preferences or null if not set
     */
    function getCookiePreferences() {
        const cookieValue = getCookie(cookieConfig.cookieName);
        if (cookieValue) {
            try {
                return JSON.parse(cookieValue);
            } catch (e) {
                console.error('Error parsing cookie preferences:', e);
                return null;
            }
        }
        return null;
    }

    /**
     * Apply cookie preferences
     * @param {Object} preferences Cookie preferences object
     */
    function applyPreferences(preferences) {
        // Apply necessary cookies (always enabled)
        // These are cookies that are essential for the website to function properly
        
        // Apply preference cookies
        if (preferences.preferences) {
            // Enable preference cookies
            // These cookies allow the website to remember choices you have made
        }
        
        // Apply analytics cookies
        if (preferences.analytics) {
            // Enable analytics cookies
            // These cookies help us understand how visitors interact with our website
        }
        
        // Apply marketing cookies
        if (preferences.marketing) {
            // Enable marketing cookies
            // These cookies are used to track visitors across websites
        }
    }

    /**
     * Save cookie preferences
     * @param {Object} preferences Cookie preferences object
     */
    function savePreferences(preferences) {
        // Ensure necessary cookies are always enabled
        preferences.necessary = true;
        
        // Save preferences to cookie with secure settings
        setCookie(cookieConfig.cookieName, JSON.stringify(preferences), cookieConfig.expireDays);
        
        // Apply the preferences
        applyPreferences(preferences);
    }

    /**
     * Accept all cookies
     */
    function acceptAllCookies() {
        const allPreferences = {
            necessary: true,
            preferences: true,
            analytics: true,
            marketing: true
        };
        
        savePreferences(allPreferences);
        hideCookieConsent();
    }

    /**
     * Accept only necessary cookies
     */
    function acceptNecessaryCookies() {
        const necessaryPreferences = {
            necessary: true,
            preferences: false,
            analytics: false,
            marketing: false
        };
        
        savePreferences(necessaryPreferences);
        hideCookieConsent();
    }

    /**
     * Hide the cookie consent popup
     */
    function hideCookieConsent() {
        const cookieConsent = document.getElementById('cookieConsent');
        if (cookieConsent) {
            cookieConsent.style.display = 'none';
        }
    }

    /**
     * Show the cookie settings modal
     */
    function showCookieSettings() {
        const cookieSettings = document.getElementById('cookieSettingsModal');
        if (cookieSettings) {
            // Update toggle switches based on current preferences
            updateSettingsUI();
            cookieSettings.style.display = 'flex';
        }
    }

    /**
     * Hide the cookie settings modal
     */
    function hideCookieSettings() {
        const cookieSettings = document.getElementById('cookieSettingsModal');
        if (cookieSettings) {
            cookieSettings.style.display = 'none';
        }
    }

    /**
     * Update cookie settings UI based on current preferences
     */
    function updateSettingsUI() {
        const preferences = getCookiePreferences() || cookieConfig.defaultPreferences;
        
        // Update toggle switches
        document.getElementById('necessarySwitch').checked = true; // Always checked
        document.getElementById('preferencesSwitch').checked = preferences.preferences;
        document.getElementById('analyticsSwitch').checked = preferences.analytics;
        document.getElementById('marketingSwitch').checked = preferences.marketing;
    }

    /**
     * Save preferences from settings modal
     */
    function saveSettingsPreferences() {
        const preferences = {
            necessary: true, // Always true
            preferences: document.getElementById('preferencesSwitch').checked,
            analytics: document.getElementById('analyticsSwitch').checked,
            marketing: document.getElementById('marketingSwitch').checked
        };
        
        savePreferences(preferences);
        hideCookieSettings();
    }

    /**
     * Set a cookie with secure settings
     * @param {string} name Cookie name
     * @param {string} value Cookie value
     * @param {number} days Days until cookie expires
     */
    function setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        
        // Get secure flag based on protocol and hostname
        const isSecure = cookieConfig.cookieSecure && 
                        (window.location.protocol === 'https:' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname.startsWith('127.0.0.1'));
        
        const secureFlag = isSecure ? '; Secure' : '';
        const sameSiteFlag = '; SameSite=' + cookieConfig.cookieSameSite;
        
        document.cookie = name + '=' + encodeURIComponent(value) + 
                          expires + 
                          '; path=/' + 
                          secureFlag + 
                          sameSiteFlag;
    }

    /**
     * Get a cookie by name
     * @param {string} name Cookie name
     * @returns {string|null} Cookie value or null if not found
     */
    function getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
        }
        return null;
    }

    /**
     * Delete a cookie
     * @param {string} name Cookie name
     */
    function deleteCookie(name) {
        setCookie(name, '', -1);
    }

    // Event listeners
    document.addEventListener('click', function(e) {
        // Accept all cookies button
        if (e.target.matches('#acceptAllCookies') || e.target.matches('.btn-accept-all')) {
            acceptAllCookies();
        }
        
        // Accept necessary cookies button
        if (e.target.matches('#acceptNecessaryCookies')) {
            acceptNecessaryCookies();
        }
        
        // Cookie settings button
        if (e.target.matches('#cookieSettingsBtn')) {
            showCookieSettings();
        }
        
        // Close cookie settings button
        if (e.target.matches('#closeSettings')) {
            hideCookieSettings();
        }
        
        // Save preferences button
        if (e.target.matches('#savePreferences')) {
            saveSettingsPreferences();
        }
    });

    // Add method to global scope to allow manual triggering
    window.openCookieSettings = showCookieSettings;
});
