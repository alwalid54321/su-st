/**
 * Hero Video Handler
 * Ensures proper loading and display of the hero video with fallback mechanisms
 * Using theme colors: 
 * --primary-dark: #1B1464 (Dark blue from logo)
 * --accent: #786D3C (Gold accent from logo)
 */
document.addEventListener('DOMContentLoaded', function() {
    const heroVideo = document.querySelector('.hero-video');
    const heroPlaceholder = document.querySelector('.hero-video-placeholder');
    
    // Function to handle video loading
    function handleVideoLoading() {
        if (heroVideo && heroPlaceholder) {
            // Hide placeholder and show video immediately
            heroPlaceholder.style.display = 'none';
            heroVideo.style.display = 'block';
            heroVideo.style.opacity = '1';
            
            // Ensure video is visible and playing immediately
            heroVideo.play().catch(function(error) {
                console.log('Auto-play was prevented:', error);
                // If video can't autoplay, at least show it
                heroVideo.style.display = 'block';
                heroVideo.style.opacity = '1';
            });
            
            // If video fails to load, show placeholder as fallback
            heroVideo.addEventListener('error', function() {
                console.log('Video failed to load');
                heroPlaceholder.style.display = 'block';
                heroVideo.style.display = 'none';
            });
        }
    }
    
    // Initialize video handling
    handleVideoLoading();
    
    // Ensure video is responsive on window resize
    window.addEventListener('resize', function() {
        if (heroVideo) {
            // Refresh video display on resize
            heroVideo.style.width = '100%';
            heroVideo.style.height = '100%';
        }
    });
});
