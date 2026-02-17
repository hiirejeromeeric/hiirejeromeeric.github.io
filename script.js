// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const currentYear = document.getElementById('currentYear');
const skillLevels = document.querySelectorAll('.skill-level');
const backToTop = document.querySelector('.back-to-top');
const contactForm = document.getElementById('contactForm');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initPortfolio();
});

function initPortfolio() {
    // Set current year
    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
    
    // Initialize theme
    initTheme();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize animations
    initAnimations();
    
    // Initialize scroll events
    initScrollEvents();
    
    // Initialize form handling
    initFormHandling();
    
    // Initialize touch events for mobile
    initTouchEvents();
}

// Theme Management
function initTheme() {
    if (!themeToggle) return;
    
    const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        updateThemeIcon('dark');
    }
    
    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-theme');
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('portfolio-theme', theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Mobile Menu
function initMobileMenu() {
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
        }
        document.body.style.overflow = isActive ? 'hidden' : '';
    });
    
    // Close menu when clicking on links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
            document.body.style.overflow = '';
        }
    });
}

// Animations
function initAnimations() {
    // Animate skill bars
    if (skillLevels.length > 0) {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains('skill-level')) {
                        const level = entry.target.getAttribute('data-level');
                        entry.target.style.width = `${level}%`;
                    }
                }
            });
        }, observerOptions);
        
        skillLevels.forEach(skill => observer.observe(skill));
    }
    
    // Float elements animation
    const floatElements = document.querySelectorAll('.float-element');
    floatElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 2}s`;
    });
}

// Scroll Events
function initScrollEvents() {
    if (!backToTop) return;
    
    // Back to top button
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
        
        // Update active nav link
        updateActiveNavLink();
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.className = 'fas fa-bars';
                    }
                    document.body.style.overflow = '';
                }
                
                const offset = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Back to top functionality
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Form Handling with Formspree
function initFormHandling() {
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        if (!validateForm(data)) return;
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            // Send to Formspree
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Success
                showNotification('Thank you! Your message has been sent successfully.', 'success');
                contactForm.reset();
                
                // Track successful submission (if you have analytics)
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'contact_form_submit', {
                        'event_category': 'Contact',
                        'event_label': 'Portfolio Contact Form'
                    });
                }
            } else {
                // Formspree error
                const error = result.errors ? result.errors.map(e => e.message).join(', ') : 'Something went wrong.';
                throw new Error(error);
            }
            
        } catch (error) {
            // Show error message
            console.error('Form submission error:', error);
            showNotification('Failed to send message. Please try again or email me directly at hiirecode@gmail.com', 'error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

function validateForm(data) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    // Check all fields
    if (!data.name || !data.email || !data.message) {
        showNotification('Please fill in all required fields.', 'error');
        return false;
    }
    
    return true;
}

// Notification System
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 9999;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        animation: slideIn 0.3s ease;
        max-width: 90vw;
        width: 350px;
    `;
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
    
    document.body.appendChild(notification);
    
    // Add keyframes for animation if they don't exist
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            .notification-close:hover {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }
}

// Touch Events for Mobile
function initTouchEvents() {
    // Prevent zoom on double tap for buttons
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        button.addEventListener('touchend', function(e) {
            // Add ripple effect on touch
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.changedTouches[0].clientX - rect.left - size / 2;
            const y = e.changedTouches[0].clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.7);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                top: ${y}px;
                left: ${x}px;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple animation styles if they don't exist
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// CV Download Tracking
document.querySelectorAll('a[download]').forEach(link => {
    link.addEventListener('click', () => {
        // Track CV downloads
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cv_download', {
                'event_category': 'CV',
                'event_label': 'Download CV'
            });
        }
        
        // Show notification
        showNotification('Downloading CV...', 'success');
    });
});

// Performance optimization
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Close mobile menu on resize to desktop
        if (window.innerWidth >= 768 && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
            document.body.style.overflow = '';
        }
    }, 250);
});

// PWA Support Check (Optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// Offline Support
window.addEventListener('online', () => {
    showNotification('You are back online!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are currently offline. Some features may not work.', 'error');
});

// Add active class to current nav link on page load
window.addEventListener('load', () => {
    updateActiveNavLink();
});

// Handle form reset if needed
if (contactForm) {
    contactForm.addEventListener('reset', () => {
        showNotification('Form has been cleared.', 'info');
    });
}

// Add info notification type
function showInfoNotification(message) {
    showNotification(message, 'info');
}

// Extend showNotification to support info type
const originalShowNotification = showNotification;
showNotification = function(message, type) {
    if (type === 'info') {
        type = 'success'; // Use success styling but we'll add a note
        message = 'ℹ️ ' + message;
    }
    originalShowNotification(message, type);
};

// Smooth scroll to top with animation
function scrollToTop() {
    const scrollDuration = 300;
    const scrollStep = -window.scrollY / (scrollDuration / 15);
    
    const scrollInterval = setInterval(() => {
        if (window.scrollY !== 0) {
            window.scrollBy(0, scrollStep);
        } else {
            clearInterval(scrollInterval);
        }
    }, 15);
}

// Export functions for debugging (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initPortfolio,
        toggleTheme,
        showNotification,
        scrollToTop
    };
}
