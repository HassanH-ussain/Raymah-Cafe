/* ========================================
   Raymah Café - Main JavaScript
   "From Bean to Brew"
   ======================================== */

// ----------------------------------------
// Preloader - MUST run first and independently
// ----------------------------------------
(function() {
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.classList.add('loaded');
        }
    }
    
    // Hide preloader after 1.2 seconds no matter what
    setTimeout(hidePreloader, 1200);
    
    // Also hide on window load as backup
    window.addEventListener('load', function() {
        setTimeout(hidePreloader, 100);
    });
    
    // Also hide when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(hidePreloader, 1200);
        });
    } else {
        setTimeout(hidePreloader, 1200);
    }
})();

// ----------------------------------------
// Safe JSON Parse - prevents corrupted data from crashing the page
// ----------------------------------------
function safeJSONParse(str, fallback) {
    if (!str || str === 'undefined' || str === 'null' || str === '') {
        return fallback;
    }
    try {
        const parsed = JSON.parse(str);
        // Validate it's an array for cart/reviews
        if (Array.isArray(fallback) && !Array.isArray(parsed)) {
            console.warn('Expected array but got:', typeof parsed);
            return fallback;
        }
        return parsed;
    } catch (e) {
        console.warn('JSON parse error, returning fallback:', e);
        return fallback;
    }
}

// ----------------------------------------
// Cart State Management
// ----------------------------------------
let cart = [];

// Load cart from localStorage on page load
function loadCart() {
    try {
        const savedCart = localStorage.getItem('raymahCart');
        cart = safeJSONParse(savedCart, []);
        
        // Validate cart items have required properties
        if (Array.isArray(cart)) {
            cart = cart.filter(function(item) {
                return item && 
                       typeof item === 'object' &&
                       typeof item.name === 'string' && 
                       typeof item.price === 'number' && 
                       typeof item.quantity === 'number' &&
                       item.quantity > 0;
            });
        } else {
            cart = [];
        }
        
        updateCartUI();
    } catch (e) {
        console.warn('Could not load cart, resetting:', e);
        cart = [];
        // Clear corrupted data
        try { localStorage.removeItem('raymahCart'); } catch (e2) {}
    }
}

// Save cart to localStorage
function saveCart() {
    try {
        if (Array.isArray(cart)) {
            localStorage.setItem('raymahCart', JSON.stringify(cart));
        }
    } catch (e) {
        console.warn('Could not save cart:', e);
    }
}

// ----------------------------------------
// Reviews State Management
// ----------------------------------------
let reviews = [];

// Load reviews from localStorage
function loadReviews() {
    try {
        const savedReviews = localStorage.getItem('raymahReviews');
        reviews = safeJSONParse(savedReviews, []);
        
        // Validate review items
        if (Array.isArray(reviews)) {
            reviews = reviews.filter(function(review) {
                return review && 
                       typeof review === 'object' &&
                       typeof review.name === 'string' && 
                       typeof review.rating === 'number';
            });
        } else {
            reviews = [];
        }
        
        renderSavedReviews();
    } catch (e) {
        console.warn('Could not load reviews, resetting:', e);
        reviews = [];
        // Clear corrupted data
        try { localStorage.removeItem('raymahReviews'); } catch (e2) {}
    }
}

// Save reviews to localStorage
function saveReviews() {
    try {
        localStorage.setItem('raymahReviews', JSON.stringify(reviews));
    } catch (e) {
        console.warn('Could not save reviews:', e);
    }
}

// ----------------------------------------
// Global function declarations (before DOMContentLoaded)
// ----------------------------------------
function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartSidebar) {
        cartSidebar.classList.add('translate-x-full');
    }
    if (cartOverlay) {
        cartOverlay.classList.add('opacity-0', 'pointer-events-none');
        cartOverlay.classList.remove('opacity-100', 'pointer-events-auto');
    }
    document.body.style.overflow = '';
}

function openCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartSidebar) {
        cartSidebar.classList.remove('translate-x-full');
    }
    if (cartOverlay) {
        cartOverlay.classList.remove('opacity-0', 'pointer-events-none');
        cartOverlay.classList.add('opacity-100', 'pointer-events-auto');
    }
    document.body.style.overflow = 'hidden';
}

// Update Cart UI - defined globally
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCart = document.getElementById('emptyCart');
    const cartFooter = document.getElementById('cartFooter');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Update cart count badge
    if (cartCount) {
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.classList.remove('hidden');
        } else {
            cartCount.classList.add('hidden');
        }
    }
    
    // Update cart items list
    if (cartItemsList && emptyCart && cartFooter) {
        if (cart.length === 0) {
            emptyCart.classList.remove('hidden');
            cartItemsList.classList.add('hidden');
            cartFooter.classList.add('hidden');
        } else {
            emptyCart.classList.add('hidden');
            cartItemsList.classList.remove('hidden');
            cartFooter.classList.remove('hidden');
            
            cartItemsList.innerHTML = cart.map(item => `
                <div class="flex gap-4 p-4 bg-dark border border-gold/10 cart-item" data-id="${item.id}">
                    <div class="w-20 h-20 bg-gradient-to-br from-gold/20 to-dark flex items-center justify-center flex-shrink-0">
                        <svg class="w-8 h-8 text-gold/40" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3z"/>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-cream font-medium mb-1">${item.name}</h4>
                        <p class="text-gold text-sm mb-2">$${item.price.toFixed(2)}</p>
                        <div class="flex items-center gap-3">
                            <button class="qty-btn w-7 h-7 border border-gold/30 text-cream hover:bg-gold/20 transition-colors flex items-center justify-center" data-action="decrease" data-id="${item.id}">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
                            </button>
                            <span class="text-cream w-8 text-center">${item.quantity}</span>
                            <button class="qty-btn w-7 h-7 border border-gold/30 text-cream hover:bg-gold/20 transition-colors flex items-center justify-center" data-action="increase" data-id="${item.id}">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                            </button>
                        </div>
                    </div>
                    <button class="remove-btn text-cream/30 hover:text-red-400 transition-colors self-start" data-id="${item.id}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            `).join('');
            
            // Add event listeners to quantity buttons
            cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(btn.dataset.id);
                    const action = btn.dataset.action;
                    updateQuantity(id, action === 'increase' ? 1 : -1);
                });
            });
            
            // Add event listeners to remove buttons
            cartItemsList.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    removeFromCart(id);
                    if (typeof showNotification === 'function') {
                        showNotification('Item removed from cart', 'info');
                    }
                });
            });
        }
    }
    
    // Update totals
    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${subtotal.toFixed(2)}`;
}

// Remove from Cart - defined globally
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
}

// Update Item Quantity - defined globally
function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Render saved reviews - defined globally
function renderSavedReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!container || reviews.length === 0) return;
    
    reviews.forEach(review => {
        addReviewToDOM(review, false);
    });
}

// Add Review to DOM - defined globally
function addReviewToDOM(review, animate = false) {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;
    
    const initial = review.name.charAt(0).toUpperCase();
    const timeAgo = getTimeAgo(new Date(review.date));
    const starsHtml = generateStarsHtml(review.rating);
    
    const reviewHtml = `
        <div class="review-card bg-dark border border-gold/10 p-6 transition-all hover:border-gold/30 ${animate ? 'animate-fade-in' : ''}" data-review-id="${review.id}">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center">
                        <span class="font-serif text-gold">${initial}</span>
                    </div>
                    <div>
                        <p class="text-cream font-medium">${escapeHtml(review.name)}</p>
                        <p class="text-cream/40 text-xs">${timeAgo}</p>
                    </div>
                </div>
                <div class="flex gap-1">
                    ${starsHtml}
                </div>
            </div>
            <p class="text-cream/70 leading-relaxed">"${escapeHtml(review.text)}"</p>
        </div>
    `;
    
    container.insertAdjacentHTML('afterbegin', reviewHtml);
}

// Generate stars HTML
function generateStarsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const colorClass = i <= rating ? 'text-gold' : 'text-cream/20';
        html += `<svg class="w-4 h-4 ${colorClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    }
    return html;
}

// Get time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
        }
    }
    
    return 'Just now';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Notification System - defined globally
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1.25rem 2rem;
        background: linear-gradient(135deg, #141414, #0a0a0a);
        color: #f5f0e8;
        font-family: 'Montserrat', sans-serif;
        font-size: 0.9rem;
        z-index: 9999;
        transform: translateX(120%);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.77, 0, 0.175, 1);
        border-left: 3px solid ${type === 'success' ? '#d4af37' : type === 'error' ? '#dc2626' : '#6b7280'};
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        max-width: 350px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3500);
}

// Make showNotification globally accessible
window.showNotification = showNotification;

document.addEventListener('DOMContentLoaded', function() {
    
    // Load saved data (wrapped in try-catch)
    try {
        loadCart();
        loadReviews();
    } catch (e) {
        console.warn('Error loading saved data:', e);
    }

    // ----------------------------------------
    // Initialize AOS (Animate On Scroll)
    // ----------------------------------------
    if (typeof AOS !== 'undefined') {
        try {
            AOS.init({
                duration: 1000,
                easing: 'ease-out-cubic',
                once: true,
                offset: 80,
                delay: 100
            });
        } catch (e) {
            console.warn('AOS init error:', e);
        }
    }

    // ----------------------------------------
    // Custom Cursor
    // ----------------------------------------
    const cursorDot = document.getElementById('cursorDot');
    const cursorOutline = document.getElementById('cursorOutline');
    
    if (cursorDot && cursorOutline && window.innerWidth > 768) {
        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });
        
        function animateOutline() {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            
            cursorOutline.style.left = outlineX + 'px';
            cursorOutline.style.top = outlineY + 'px';
            
            requestAnimationFrame(animateOutline);
        }
        animateOutline();
        
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, .product-card, .testimonial-card, .review-card');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('hover');
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('hover');
                cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            });
        });
        
        document.addEventListener('mouseleave', () => {
            cursorDot.style.opacity = '0';
            cursorOutline.style.opacity = '0';
        });
        
        document.addEventListener('mouseenter', () => {
            cursorDot.style.opacity = '1';
            cursorOutline.style.opacity = '1';
        });
    }

    // ----------------------------------------
    // Navbar Scroll Effect
    // ----------------------------------------
    const navbar = document.getElementById('navbar');
    
    if (navbar) {
        function handleNavbarScroll() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }
        
        handleNavbarScroll();
        window.addEventListener('scroll', handleNavbarScroll);
    }

    // ----------------------------------------
    // Smooth Scroll for Anchor Links
    // ----------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                closeMobileMenu();
                closeCart();
                
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ----------------------------------------
    // Mobile Menu
    // ----------------------------------------
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    
    function openMobileMenu() {
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
    }
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
            closeCart();
        }
    });

    // ----------------------------------------
    // Cart Functionality
    // ----------------------------------------
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCart');
    const clearCartBtn = document.getElementById('clearCartBtn');
    
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            saveCart();
            updateCartUI();
            showNotification('Cart cleared', 'info');
        });
    }
    
    // Add to Cart
    function addToCart(product) {
        const existingItem = cart.find(item => item.name === product.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                ...product,
                quantity: 1,
                id: Date.now()
            });
        }
        
        saveCart();
        updateCartUI();
        showNotification(`${product.name} added to cart! ☕`, 'success');
    }
    
    // Add to Cart Button Event Listeners
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.dataset.product;
            const productCard = this.closest('.product-card');
            if (!productCard) return;
            
            const priceEl = productCard.querySelector('.text-gold.font-serif');
            if (!priceEl) return;
            
            const priceText = priceEl.textContent;
            const price = parseFloat(priceText.replace('$', ''));
            
            addToCart({
                name: productName,
                price: price
            });
            
            // Button animation
            const originalText = this.textContent;
            this.textContent = '✓ Added';
            this.style.background = 'linear-gradient(135deg, #d4af37, #b8860b)';
            this.style.color = '#0a0a0a';
            this.style.borderColor = '#d4af37';
            this.disabled = true;
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
                this.style.color = '';
                this.style.borderColor = '';
                this.disabled = false;
            }, 1500);
        });
    });

    // ----------------------------------------
    // Review System
    // ----------------------------------------
    const reviewForm = document.getElementById('reviewForm');
    const ratingStars = document.getElementById('ratingStars');
    const reviewRatingInput = document.getElementById('reviewRating');
    let selectedRating = 0;
    
    // Star Rating Selection
    if (ratingStars) {
        const starButtons = ratingStars.querySelectorAll('.star-btn');
        
        starButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedRating = parseInt(btn.dataset.rating);
                if (reviewRatingInput) reviewRatingInput.value = selectedRating;
                updateStarDisplay(selectedRating);
            });
            
            btn.addEventListener('mouseenter', () => {
                updateStarDisplay(parseInt(btn.dataset.rating));
            });
        });
        
        ratingStars.addEventListener('mouseleave', () => {
            updateStarDisplay(selectedRating);
        });
    }
    
    function updateStarDisplay(rating) {
        if (!ratingStars) return;
        const starButtons = ratingStars.querySelectorAll('.star-btn');
        starButtons.forEach((btn, index) => {
            if (index < rating) {
                btn.classList.remove('text-cream/20');
                btn.classList.add('text-gold');
            } else {
                btn.classList.remove('text-gold');
                btn.classList.add('text-cream/20');
            }
        });
    }
    
    // Submit Review
    if (reviewForm) {
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('reviewName');
            const textInput = document.getElementById('reviewText');
            
            const name = nameInput ? nameInput.value.trim() : '';
            const rating = reviewRatingInput ? parseInt(reviewRatingInput.value) : 0;
            const text = textInput ? textInput.value.trim() : '';
            
            if (!name || !text) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (rating === 0) {
                showNotification('Please select a rating', 'error');
                return;
            }
            
            const review = {
                id: Date.now(),
                name: name,
                rating: rating,
                text: text,
                date: new Date().toISOString()
            };
            
            reviews.unshift(review);
            saveReviews();
            addReviewToDOM(review, true);
            
            // Reset form
            reviewForm.reset();
            selectedRating = 0;
            if (reviewRatingInput) reviewRatingInput.value = 0;
            updateStarDisplay(0);
            
            showNotification('Thank you for your review! ☕', 'success');
        });
    }

    // ----------------------------------------
    // Parallax Effect on Hero Logo
    // ----------------------------------------
    const heroLogo = document.querySelector('.hero-logo');
    const heroSection = document.querySelector('.hero-section');
    
    if (heroLogo && heroSection && window.innerWidth > 768) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / 30;
            const y = (e.clientY - rect.top - rect.height / 2) / 30;
            
            heroLogo.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        heroSection.addEventListener('mouseleave', () => {
            heroLogo.style.transform = 'translate(0, 0)';
        });
    }

    // ----------------------------------------
    // Newsletter Form Handling
    // ----------------------------------------
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput ? emailInput.value.trim() : '';
            
            if (email && isValidEmail(email)) {
                showNotification('Welcome to the Raymah family! ☕', 'success');
                emailInput.value = '';
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // ----------------------------------------
    // Intersection Observer for Animations
    // ----------------------------------------
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.reveal-up').forEach(el => {
        observer.observe(el);
    });

    // ----------------------------------------
    // Counter Animation for Stats
    // ----------------------------------------
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (statNumbers.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalValue = parseInt(target.dataset.value) || 0;
                    const suffix = target.dataset.suffix || '';
                    animateCounter(target, finalValue, suffix);
                    counterObserver.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        
        statNumbers.forEach(stat => {
            counterObserver.observe(stat);
        });
    }
    
    function animateCounter(element, target, suffix) {
        let current = 0;
        const increment = target / 50;
        const duration = 2000;
        const stepTime = duration / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + suffix;
        }, stepTime);
    }

    // ----------------------------------------
    // Magnetic Button Effect
    // ----------------------------------------
    const magneticButtons = document.querySelectorAll('.magnetic-btn');
    
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0, 0)';
        });
    });

    // ----------------------------------------
    // Scroll Progress Indicator
    // ----------------------------------------
    const progressBar = document.getElementById('scrollProgress');
    
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            progressBar.style.width = progress + '%';
        });
    }

    // ----------------------------------------
    // Tilt Effect on Product Cards
    // ----------------------------------------
    const productCards = document.querySelectorAll('.product-card');
    
    if (window.innerWidth > 768 && productCards.length > 0) {
        productCards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

});

// ----------------------------------------
// Utility Functions
// ----------------------------------------
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}