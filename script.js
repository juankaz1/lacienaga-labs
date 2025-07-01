// Funcionalidad para La Cienaga Labs Website

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger menu
        navToggle.classList.toggle('active');
        const spans = navToggle.querySelectorAll('span');
        spans.forEach(span => span.classList.toggle('active'));
    });

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Logo click functionality
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('#inicio').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    }

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }

        lastScrollTop = scrollTop;
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .impact-card, .section-header');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Hero buttons functionality
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.textContent.includes('servicios')) {
                e.preventDefault();
                document.querySelector('#servicios').scrollIntoView({
                    behavior: 'smooth'
                });
            } else if (this.textContent.includes('proyectos')) {
                e.preventDefault();
                document.querySelector('#impacto').scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Parallax effect for patterns
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const patterns = document.querySelectorAll('.pattern');
        
        patterns.forEach((pattern, index) => {
            const speed = 0.5 + (index * 0.2);
            pattern.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });

    // Gallery hover effects
    const galleryImages = document.querySelectorAll('.gallery-image');
    galleryImages.forEach(image => {
        image.addEventListener('mouseenter', function() {
            this.style.filter = 'brightness(1.1) saturate(1.2)';
        });
        
        image.addEventListener('mouseleave', function() {
            this.style.filter = 'brightness(1) saturate(1)';
        });
    });

    // Service cards hover animation
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.background = '#ffffff';
        });
    });

    // Impact cards animation sequence
    const impactCards = document.querySelectorAll('.impact-card');
    const impactObserver = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, index * 200);
            }
        });
    }, observerOptions);

    impactCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.95)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        impactObserver.observe(card);
    });

    // Team photo hover effect
    const teamPhoto = document.querySelector('.team-photo');
    if (teamPhoto) {
        teamPhoto.addEventListener('mouseenter', function() {
            this.style.filter = 'grayscale(0%) brightness(1.05)';
            this.style.transform = 'scale(1.02)';
        });
        
        teamPhoto.addEventListener('mouseleave', function() {
            this.style.filter = 'grayscale(0%) brightness(1)';
            this.style.transform = 'scale(1)';
        });
    }

    // Leader image hover effect (same as team photo)
    const leaderImage = document.querySelector('.leader-image img');
    if (leaderImage) {
        leaderImage.addEventListener('mouseenter', function() {
            this.style.filter = 'grayscale(0%) brightness(1.05)';
            this.style.transform = 'scale(1.02)';
        });
        
        leaderImage.addEventListener('mouseleave', function() {
            this.style.filter = 'grayscale(0%) brightness(1)';
            this.style.transform = 'scale(1)';
        });
    }

    // Force GIF to loop continuously
    const animationGif = document.querySelector('img[src="animacionmedida.gif"]');
    if (animationGif) {
        animationGif.addEventListener('load', function() {
            // Ensure the GIF loops infinitely
            this.style.animationIterationCount = 'infinite';
        });
    }

    // Partner logos animation with enhanced effects
    const partnerLinks = document.querySelectorAll('.partner-link');
    partnerLinks.forEach(link => {
        const logo = link.querySelector('.partner-logo');
        
        link.addEventListener('mouseenter', function() {
            logo.style.transform = 'scale(1.1)';
            logo.style.filter = 'brightness(1.2)';
            this.style.transform = 'translateY(-5px)';
        });
        
        link.addEventListener('mouseleave', function() {
            logo.style.transform = 'scale(1)';
            logo.style.filter = 'brightness(1)';
            this.style.transform = 'translateY(0)';
        });
    });

    // Loading animation for hero elements
    function animateHeroElements() {
        const heroTitle = document.querySelector('.hero-title');
        const heroDescription = document.querySelector('.hero-description');
        const heroButtons = document.querySelector('.hero-buttons');
        const heroLogo = document.querySelector('.hero-logo');

        if (heroTitle) {
            setTimeout(() => {
                heroTitle.style.opacity = '1';
                heroTitle.style.transform = 'translateY(0)';
            }, 100);
        }

        if (heroDescription) {
            setTimeout(() => {
                heroDescription.style.opacity = '1';
                heroDescription.style.transform = 'translateY(0)';
            }, 300);
        }

        if (heroButtons) {
            setTimeout(() => {
                heroButtons.style.opacity = '1';
                heroButtons.style.transform = 'translateY(0)';
            }, 500);
        }

        if (heroLogo) {
            setTimeout(() => {
                heroLogo.style.opacity = '1';
                heroLogo.style.transform = 'scale(1)';
            }, 700);
        }
    }

    // Initialize hero animations
    animateHeroElements();

    // Add custom cursor effect for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
    });

    // Form validation (if forms are added later)
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ef4444';
            } else {
                input.style.borderColor = '#d1d5db';
            }
        });

        return isValid;
    }

    // Lazy loading for images
    const images = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '1';
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        img.style.transition = 'opacity 0.3s ease';
        imageObserver.observe(img);
    });

    // Performance optimization: Throttle scroll events
    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Apply throttling to scroll events
    const throttledScrollHandler = throttle(() => {
        // Scroll-dependent animations here
        console.log('Scroll event handled');
    }, 16); // ~60fps

    window.addEventListener('scroll', throttledScrollHandler);

    // Console welcome message
    console.log(`
    🧪 La Cienaga Labs - Website Loaded Successfully
    
    Analítica de datos que transforman y evolucionan
    
    Developed with ❤️ using modern web technologies
    `);
});

// Additional utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6b46c1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Export functions for potential use in other scripts
window.LaCienagaLabs = {
    showNotification
}; 