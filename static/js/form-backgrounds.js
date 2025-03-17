/**
 * Form Backgrounds JS
 * Adds subtle animations to the form backgrounds
 * Uses the brand colors: dark blue (#1B1464) and gold accent (#786D3C)
 */

document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if we have a background container
  const bgContainers = document.querySelectorAll('.bg-pattern-container');
  
  if (bgContainers.length === 0) return;
  
  // Create floating particles in the background
  bgContainers.forEach(container => {
    // Create a canvas element for the particles
    const canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas';
    canvas.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;';
    
    // Insert canvas as the first child of the container
    container.insertBefore(canvas, container.firstChild);
    
    // Initialize the particles
    initParticles(canvas, container);
    
    // Log for debugging
    console.log('Background animation initialized for', container.className);
  });
  
  function initParticles(canvas, container) {
    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 25; // Increased for better visibility
    
    // Brand colors with transparency
    const colors = [
      'rgba(27, 20, 100, 0.08)',  // Dark blue with increased opacity
      'rgba(120, 109, 60, 0.08)'  // Gold accent with increased opacity
    ];
    
    // Set canvas size
    function resizeCanvas() {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
      console.log('Canvas resized to', canvas.width, 'x', canvas.height);
    }
    
    // Initial resize
    resizeCanvas();
    
    // Resize on window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 8 + 3, // Larger particles for better visibility
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 0.3 - 0.15, // Slightly faster movement
        speedY: Math.random() * 0.3 - 0.15, // Slightly faster movement
        opacity: Math.random() * 0.7 + 0.3  // Higher opacity for better visibility
      });
    }
    
    // Animation function
    function animate() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(particle => {
        // Move particle
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.speedX *= -1;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.speedY *= -1;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });
      
      // Request next frame
      requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    console.log('Animation started with', particleCount, 'particles');
  }
});
