// Navbar functionality with animations
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            // Toggle active class on the button
            this.classList.toggle('active');
            
            // Toggle menu visibility with animation
            if (navLinks.classList.contains('active')) {
                // Close menu animation
                navLinks.style.animation = 'slideOut 0.3s forwards';
                setTimeout(() => {
                    navLinks.classList.remove('active');
                    navLinks.style.animation = '';
                }, 300);
            } else {
                // Open menu animation
                navLinks.classList.add('active');
                navLinks.style.animation = 'slideIn 0.3s forwards';
            }
        });
    }
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(event.target) && 
            !mobileMenuToggle.contains(event.target)) {
            
            // Close menu animation
            navLinks.style.animation = 'slideOut 0.3s forwards';
            setTimeout(() => {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                navLinks.style.animation = '';
            }, 300);
        }
    });
    
    // Handle dropdown menus on mobile
    const megaDropdown = document.querySelector('.mega-dropdown');
    if (megaDropdown && window.innerWidth <= 768) {
        const dropdownLink = megaDropdown.querySelector('.nav-link');
        const megaContent = megaDropdown.querySelector('.mega-content');
        
        dropdownLink.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                megaContent.style.maxHeight = megaContent.style.maxHeight ? null : megaContent.scrollHeight + 'px';
                this.classList.toggle('dropdown-active');
            }
        });
    }
});
