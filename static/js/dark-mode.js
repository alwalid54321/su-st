// Dark Mode Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Get the toggle button
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // Check for saved theme preference or use device preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Function to set the theme
    const setTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update toggle button state
        if (darkModeToggle) {
            if (theme === 'dark') {
                darkModeToggle.classList.add('active');
            } else {
                darkModeToggle.classList.remove('active');
            }
        }
    };
    
    // Apply saved theme or device preference
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDarkScheme.matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    
    // Toggle theme when button is clicked
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Apply glowing animation to body when switching to dark mode
            if (newTheme === 'dark') {
                document.body.classList.add('theme-transition');
                setTimeout(() => {
                    document.body.classList.remove('theme-transition');
                }, 1000);
            }
            
            setTheme(newTheme);
        });
    }
    
    // Add glowing effect to cards in dark mode
    function applyGlowEffects() {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            // Add glow class to important cards
            document.querySelectorAll('.card, .section-card').forEach(card => {
                if (!card.classList.contains('no-glow')) {
                    card.classList.add('glow-card');
                }
            });
            
            // Add accent glow to headings
            document.querySelectorAll('h1, h2, h3').forEach(heading => {
                if (heading.classList.contains('accent-text')) {
                    heading.classList.add('accent-glow');
                }
            });
        } else {
            // Remove glow effects in light mode
            document.querySelectorAll('.glow-card').forEach(element => {
                element.classList.remove('glow-card');
            });
            
            document.querySelectorAll('.accent-glow, .primary-glow').forEach(element => {
                element.classList.remove('accent-glow', 'primary-glow');
            });
        }
    }
    
    // Apply glow effects on load and when theme changes
    applyGlowEffects();
    darkModeToggle.addEventListener('click', applyGlowEffects);
    
    // Listen for system preference changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            setTheme(newTheme);
            applyGlowEffects();
        }
    });
});
