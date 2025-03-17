/**
 * Loader animation script
 * Creates a stock-like loading animation and handles page transitions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Force light mode by setting data-theme attribute to light
    document.documentElement.setAttribute('data-theme', 'light');
    
    // Get the loader element
    const pageLoader = document.getElementById('pageLoader');
    
    // Create grid lines
    const logoContainer = document.querySelector('.logo-container');
    const barsContainer = document.getElementById('bars-container');
    
    if (logoContainer && barsContainer) {
        // Add horizontal grid lines
        for (let i = 0; i < 5; i++) {
            const gridLine = document.createElement('div');
            gridLine.className = 'grid-line';
            gridLine.style.bottom = `${25 + (i * 15)}%`;
            gridLine.style.opacity = i === 2 ? 0.4 : 0.2; // Make middle line more visible
            logoContainer.appendChild(gridLine);
        }
        
        // Create bars (more of them, but thinner)
        const numBars = 35; // Many more bars for stock-like appearance
        
        for (let i = 0; i < numBars; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            
            // Random height between 40px and 200px
            const randomHeight = 40 + Math.random() * 160;
            bar.style.setProperty('--randomHeight', `${randomHeight}px`);
            
            // Staggered animations
            const duration = 3 + Math.random() * 2; // Between 3-5s
            const delay = i * (8 / numBars); // Staggered delay
            
            bar.style.animation = `barWave ${duration}s ease-in-out ${delay}s infinite`;
            bar.style.left = `${(i * 100) / numBars}%`;
            
            // Very thin bars like stock chart
            const width = 2 + Math.random() * 3; // Between 2-5px
            bar.style.width = `${width}px`;
            
            // Add some randomized shadow intensity for depth
            const shadowIntensity = 0.4 + Math.random() * 0.6;
            bar.style.boxShadow = `0 0 ${8 + Math.random() * 8}px rgba(27, 20, 100, ${shadowIntensity})`;
            
            barsContainer.appendChild(bar);
        }
    }
    
    // Hide loader after page is fully loaded
    window.addEventListener('load', function() {
        setTimeout(function() {
            if (pageLoader) {
                pageLoader.style.opacity = '0';
                setTimeout(function() {
                    pageLoader.style.display = 'none';
                }, 500);
            }
        }, 1000); // Show loader for at least 1 second
    });
});
