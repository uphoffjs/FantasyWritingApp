/* * Mockup Helper Functions */
/* * Basic interactivity for HTML mockups */

// * Theme management
const THEME_KEY = 'fantasy-app-theme';

// * Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    setupEventListeners();
    setupMobileMenu();
});

// * Initialize theme from localStorage or system preference
function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(theme);
}

// * Toggle between light and dark themes
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// * Set theme and save preference
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeIcon(theme);
}

// * Update theme toggle button icon
function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '🌙' : '🌞';
    }
}

// * Setup event listeners for interactive elements
function setupEventListeners() {
    // * Add click animation to cards
    document.querySelectorAll('.mockup-card, .story-card, .character-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (this.classList.contains('mockup-card')) return; // Let links work normally
            
            // Add pressed animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
    
    // * Form validation mockup
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
    
    // * Button ripple effect
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            createRipple(e, this);
        });
    });
}

// * Basic input validation visual feedback
function validateInput(input) {
    if (input.hasAttribute('required') && !input.value.trim()) {
        input.style.borderColor = 'var(--dragonfire-base)';
        input.style.boxShadow = '0 0 0 3px var(--dragonfire-pale)';
    } else if (input.value.trim()) {
        input.style.borderColor = 'var(--elixir-base)';
        input.style.boxShadow = '0 0 0 3px var(--elixir-pale)';
    } else {
        input.style.borderColor = '';
        input.style.boxShadow = '';
    }
}

// * Create ripple effect on buttons
function createRipple(event, button) {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    // Add ripple styles if not exists
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .btn { position: relative; overflow: hidden; }
            .ripple {
                position: absolute;
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                background-color: rgba(255, 255, 255, 0.7);
            }
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// * Setup mobile menu functionality
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
                mobileNav.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
}

// * Simulate loading states
function showLoading(element) {
    element.classList.add('skeleton');
    element.style.color = 'transparent';
}

function hideLoading(element) {
    element.classList.remove('skeleton');
    element.style.color = '';
}

// * Simulate notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add slide in animation if not exists
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// * Utility function to simulate data loading
function simulateDataLoad(callback, delay = 1000) {
    setTimeout(callback, delay);
}

// * Export for use in individual mockup pages
window.mockupHelpers = {
    toggleTheme,
    showLoading,
    hideLoading,
    showNotification,
    simulateDataLoad,
    validateInput,
    createRipple
};