/* ========================================
   Raymah Café - Main JavaScript
   "From Bean to Brew"
   ======================================== */

const API_BASE = '/api';

// ----------------------------------------
// Preloader - MUST run first and independently
// ----------------------------------------
(function () {
    function hidePreloader() {
        const preloader = document.getElementById('preloader');
        if (preloader) preloader.classList.add('loaded');
    }
    setTimeout(hidePreloader, 1200);
    window.addEventListener('load', function () { setTimeout(hidePreloader, 100); });
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(hidePreloader, 1200); });
    } else {
        setTimeout(hidePreloader, 1200);
    }
})();

// ----------------------------------------
// Safe JSON Parse
// ----------------------------------------
function safeJSONParse(str, fallback) {
    if (!str || str === 'undefined' || str === 'null' || str === '') return fallback;
    try {
        const parsed = JSON.parse(str);
        if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
        return parsed;
    } catch (e) {
        console.warn('JSON parse error, returning fallback:', e);
        return fallback;
    }
}

// ----------------------------------------
// Cart State (localStorage — intentional: cart is client-side session state)
// ----------------------------------------
let cart = [];

function loadCart() {
    try {
        const savedCart = localStorage.getItem('raymahCart');
        cart = safeJSONParse(savedCart, []);
        if (Array.isArray(cart)) {
            cart = cart.filter(item =>
                item && typeof item === 'object' &&
                typeof item.name === 'string' &&
                typeof item.price === 'number' &&
                typeof item.quantity === 'number' &&
                item.quantity > 0
            );
        } else {
            cart = [];
        }
        updateCartUI();
    } catch (e) {
        console.warn('Could not load cart, resetting:', e);
        cart = [];
        try { localStorage.removeItem('raymahCart'); } catch (_) { }
    }
}

function saveCart() {
    try {
        if (Array.isArray(cart)) localStorage.setItem('raymahCart', JSON.stringify(cart));
    } catch (e) {
        console.warn('Could not save cart:', e);
    }
}

// ----------------------------------------
// Cart UI
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
    if (cartSidebar) cartSidebar.classList.add('translate-x-full');
    if (cartOverlay) {
        cartOverlay.classList.add('opacity-0', 'pointer-events-none');
        cartOverlay.classList.remove('opacity-100', 'pointer-events-auto');
    }
    document.body.style.overflow = '';
}

function openCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartSidebar) cartSidebar.classList.remove('translate-x-full');
    if (cartOverlay) {
        cartOverlay.classList.remove('opacity-0', 'pointer-events-none');
        cartOverlay.classList.add('opacity-100', 'pointer-events-auto');
    }
    document.body.style.overflow = 'hidden';
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItemsList = document.getElementById('cartItemsList');
    const emptyCart = document.getElementById('emptyCart');
    const cartFooter = document.getElementById('cartFooter');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartCount) {
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.classList.remove('hidden');
        } else {
            cartCount.classList.add('hidden');
        }
    }

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

            cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = parseInt(btn.dataset.id);
                    updateQuantity(id, btn.dataset.action === 'increase' ? 1 : -1);
                });
            });

            cartItemsList.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    removeFromCart(parseInt(btn.dataset.id));
                    showNotification('Item removed from cart', 'info');
                });
            });
        }
    }

    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${subtotal.toFixed(2)}`;
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartUI();
}

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

// ----------------------------------------
// Products — load from API and render dynamically
// ----------------------------------------
async function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    try {
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!data.success || !data.data.length) {
            grid.innerHTML = '<div class="md:col-span-2 lg:col-span-3 text-center py-20"><p class="text-cream/30 text-sm uppercase tracking-widest">No products available</p></div>';
            return;
        }

        renderProducts(data.data);
    } catch (err) {
        console.warn('API unavailable, showing error state:', err);
        grid.innerHTML = `
            <div class="md:col-span-2 lg:col-span-3 text-center py-20">
                <p class="text-cream/30 text-sm uppercase tracking-widest mb-2">Could not load products</p>
                <p class="text-cream/20 text-xs">Make sure the server is running: npm run dev</p>
            </div>`;
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = products.map((product, i) => {
        const fontSize = product.origin.length > 8 ? '8' : '10';
        const badge = product.badge
            ? `<span class="absolute top-4 left-4 bg-gold text-black text-xs font-bold px-3 py-1 uppercase tracking-wider">${product.badge}</span>`
            : '';

        return `
        <div class="product-card" data-aos="fade-up" data-aos-delay="${(i + 1) * 100}">
            <div class="product-image bg-gradient-to-br ${product.visual.gradientClass} relative">
                ${badge}
                <div class="w-full h-full flex items-center justify-center p-12">
                    <svg viewBox="0 0 100 120" class="w-full h-full max-w-[180px] drop-shadow-lg">
                        <path d="M25 20 L25 100 C25 110 75 110 75 100 L75 20 C75 10 25 10 25 20" fill="${product.visual.bodyFill}" stroke="#d4af37" stroke-width="0.5"/>
                        <path d="M30 25 L30 95 C30 102 70 102 70 95 L70 25 C70 18 30 18 30 25" fill="#d4af37" opacity="${product.visual.innerOpacity}"/>
                        <ellipse cx="50" cy="20" rx="25" ry="8" fill="${product.visual.bodyFill}" stroke="#d4af37" stroke-width="0.5"/>
                        <text x="50" y="60" text-anchor="middle" fill="#d4af37" font-family="Cormorant Garamond" font-size="${fontSize}" font-weight="600">${product.origin.toUpperCase()}</text>
                        <text x="50" y="75" text-anchor="middle" fill="#f5f0e8" font-family="Montserrat" font-size="5" letter-spacing="2" opacity="0.7">${product.flavor.toUpperCase()}</text>
                    </svg>
                </div>
            </div>
            <div class="p-8">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-serif text-2xl text-cream mb-1">${product.name}</h3>
                        <p class="text-cream/40 text-sm">${product.roast} Roast · ${product.flavor}</p>
                    </div>
                    <p class="font-serif text-xl text-gold">$${product.price}</p>
                </div>
                <p class="text-cream/50 text-sm leading-relaxed mb-6">${product.description}</p>
                <button
                    class="add-to-cart-btn w-full py-3 border border-gold/30 text-gold text-xs uppercase tracking-widest font-medium hover:bg-gold hover:text-black transition-all duration-300"
                    data-product="${product.name}"
                    data-price="${product.price}"
                    data-id="${product._id}">
                    Add to Cart
                </button>
            </div>
        </div>`;
    }).join('');

    // Re-run AOS for newly inserted elements
    if (typeof AOS !== 'undefined') AOS.refresh();

    attachAddToCartListeners();
}

function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function () {
            const name = this.dataset.product;
            const price = parseFloat(this.dataset.price);

            if (!name || isNaN(price)) return;

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ id: Date.now(), name, price, quantity: 1 });
            }
            saveCart();
            updateCartUI();
            showNotification(`${name} added to cart! ☕`, 'success');

            // Button feedback
            const original = this.textContent;
            this.textContent = '✓ Added';
            this.style.background = 'linear-gradient(135deg, #d4af37, #b8860b)';
            this.style.color = '#0a0a0a';
            this.style.borderColor = '#d4af37';
            this.disabled = true;
            setTimeout(() => {
                this.textContent = original;
                this.style.background = '';
                this.style.color = '';
                this.style.borderColor = '';
                this.disabled = false;
            }, 1500);
        });
    });
}

// ----------------------------------------
// Reviews — backed by API with localStorage fallback
// ----------------------------------------
let reviews = [];

async function loadReviews() {
    try {
        const res = await fetch(`${API_BASE}/reviews`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success) {
            reviews = data.data;
            renderSavedReviews();
        }
    } catch (err) {
        console.warn('Could not load reviews from API, falling back to localStorage:', err);
        const savedReviews = localStorage.getItem('raymahReviews');
        reviews = safeJSONParse(savedReviews, []);
        renderSavedReviews();
    }
}

function renderSavedReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!container || reviews.length === 0) return;
    reviews.forEach(review => addReviewToDOM(review, false));
}

function addReviewToDOM(review, animate = false) {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;

    const initial = review.name.charAt(0).toUpperCase();
    const timeAgo = getTimeAgo(new Date(review.createdAt || review.date));
    const starsHtml = generateStarsHtml(review.rating);

    container.insertAdjacentHTML('afterbegin', `
        <div class="review-card bg-dark border border-gold/10 p-6 transition-all hover:border-gold/30 ${animate ? 'animate-fade-in' : ''}" data-review-id="${review._id || review.id}">
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
                <div class="flex gap-1">${starsHtml}</div>
            </div>
            <p class="text-cream/70 leading-relaxed">"${escapeHtml(review.text)}"</p>
        </div>
    `);
}

function generateStarsHtml(rating) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        const colorClass = i <= rating ? 'text-gold' : 'text-cream/20';
        html += `<svg class="w-4 h-4 ${colorClass}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
    }
    return html;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
    for (const [unit, secs] of Object.entries(intervals)) {
        const n = Math.floor(seconds / secs);
        if (n >= 1) return n === 1 ? `1 ${unit} ago` : `${n} ${unit}s ago`;
    }
    return 'Just now';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ----------------------------------------
// Notifications
// ----------------------------------------
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed; bottom: 2rem; right: 2rem;
        padding: 1.25rem 2rem;
        background: linear-gradient(135deg, #141414, #0a0a0a);
        color: #f5f0e8; font-family: 'Montserrat', sans-serif; font-size: 0.9rem;
        z-index: 9999; transform: translateX(120%); opacity: 0;
        transition: all 0.5s cubic-bezier(0.77, 0, 0.175, 1);
        border-left: 3px solid ${type === 'success' ? '#d4af37' : type === 'error' ? '#dc2626' : '#6b7280'};
        box-shadow: 0 10px 40px rgba(0,0,0,0.5); max-width: 350px;`;
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

window.showNotification = showNotification;

// ----------------------------------------
// DOMContentLoaded — wire everything up
// ----------------------------------------
document.addEventListener('DOMContentLoaded', async function () {

    // Products and reviews need API — load them first
    await loadProducts();
    loadCart();
    loadReviews();

    // AOS
    if (typeof AOS !== 'undefined') {
        try { AOS.init({ duration: 1000, easing: 'ease-out-cubic', once: true, offset: 80, delay: 100 }); }
        catch (e) { console.warn('AOS init error:', e); }
    }

    // Custom Cursor
    const cursorDot = document.getElementById('cursorDot');
    const cursorOutline = document.getElementById('cursorOutline');
    if (cursorDot && cursorOutline && window.innerWidth > 768) {
        let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;
        document.addEventListener('mousemove', e => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });
        (function animateOutline() {
            outlineX += (mouseX - outlineX) * 0.15;
            outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.left = outlineX + 'px';
            cursorOutline.style.top = outlineY + 'px';
            requestAnimationFrame(animateOutline);
        })();
        document.querySelectorAll('a, button, input, textarea, .product-card, .testimonial-card, .review-card').forEach(el => {
            el.addEventListener('mouseenter', () => { cursorOutline.classList.add('hover'); cursorDot.style.transform = 'translate(-50%,-50%) scale(1.5)'; });
            el.addEventListener('mouseleave', () => { cursorOutline.classList.remove('hover'); cursorDot.style.transform = 'translate(-50%,-50%) scale(1)'; });
        });
        document.addEventListener('mouseleave', () => { cursorDot.style.opacity = '0'; cursorOutline.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { cursorDot.style.opacity = '1'; cursorOutline.style.opacity = '1'; });
    }

    // Navbar scroll
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const handleNavbarScroll = () => navbar.classList.toggle('navbar-scrolled', window.scrollY > 50);
        handleNavbarScroll();
        window.addEventListener('scroll', handleNavbarScroll);
    }

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                closeMobileMenu(); closeCart();
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });

    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => {
        if (mobileMenu) { mobileMenu.classList.add('active'); document.body.style.overflow = 'hidden'; }
    });
    if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
    if (mobileMenu) mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeMobileMenu(); closeCart(); } });

    // Cart
    const cartBtn = document.getElementById('cartBtn');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartBtn = document.getElementById('closeCart');
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (cartBtn) cartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (clearCartBtn) clearCartBtn.addEventListener('click', () => {
        cart = []; saveCart(); updateCartUI(); showNotification('Cart cleared', 'info');
    });

    // Review form — posts to API
    const reviewForm = document.getElementById('reviewForm');
    const ratingStars = document.getElementById('ratingStars');
    const reviewRatingInput = document.getElementById('reviewRating');
    let selectedRating = 0;

    if (ratingStars) {
        const starButtons = ratingStars.querySelectorAll('.star-btn');
        starButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                selectedRating = parseInt(btn.dataset.rating);
                if (reviewRatingInput) reviewRatingInput.value = selectedRating;
                updateStarDisplay(selectedRating);
            });
            btn.addEventListener('mouseenter', () => updateStarDisplay(parseInt(btn.dataset.rating)));
        });
        ratingStars.addEventListener('mouseleave', () => updateStarDisplay(selectedRating));
    }

    function updateStarDisplay(rating) {
        if (!ratingStars) return;
        ratingStars.querySelectorAll('.star-btn').forEach((btn, i) => {
            btn.classList.toggle('text-gold', i < rating);
            btn.classList.toggle('text-cream/20', i >= rating);
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reviewName')?.value.trim();
            const rating = reviewRatingInput ? parseInt(reviewRatingInput.value) : 0;
            const text = document.getElementById('reviewText')?.value.trim();

            if (!name || !text) { showNotification('Please fill in all fields', 'error'); return; }
            if (!rating) { showNotification('Please select a rating', 'error'); return; }

            const submitBtn = reviewForm.querySelector('button[type="submit"]');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting...'; }

            try {
                const res = await fetch(`${API_BASE}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, rating, text }),
                });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit review');

                reviews.unshift(data.data);
                addReviewToDOM(data.data, true);
                reviewForm.reset();
                selectedRating = 0;
                if (reviewRatingInput) reviewRatingInput.value = 0;
                updateStarDisplay(0);
                showNotification('Thank you for your review! ☕', 'success');
            } catch (err) {
                showNotification(`Error: ${err.message}`, 'error');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit Review'; }
            }
        });
    }

    // Parallax hero logo
    const heroLogo = document.querySelector('.hero-logo');
    const heroSection = document.querySelector('.hero-section');
    if (heroLogo && heroSection && window.innerWidth > 768) {
        heroSection.addEventListener('mousemove', e => {
            const rect = heroSection.getBoundingClientRect();
            heroLogo.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) / 30}px, ${(e.clientY - rect.top - rect.height / 2) / 30}px)`;
        });
        heroSection.addEventListener('mouseleave', () => { heroLogo.style.transform = 'translate(0,0)'; });
    }

    // Newsletter
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput?.value.trim();
            if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showNotification('Welcome to the Raymah family! ☕', 'success');
                emailInput.value = '';
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }

    // Intersection Observer for .reveal-up
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('revealed'); });
    }, { rootMargin: '0px', threshold: 0.1 });
    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

    // Counter animation
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    animateCounter(target, parseInt(target.dataset.value) || 0, target.dataset.suffix || '');
                    counterObserver.unobserve(target);
                }
            });
        }, { threshold: 0.5 });
        statNumbers.forEach(stat => counterObserver.observe(stat));
    }

    function animateCounter(element, target, suffix) {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) { current = target; clearInterval(timer); }
            element.textContent = Math.floor(current) + suffix;
        }, 2000 / 50);
    }

    // Magnetic button effect
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            this.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.3}px, ${(e.clientY - rect.top - rect.height / 2) * 0.3}px)`;
        });
        btn.addEventListener('mouseleave', function () { this.style.transform = 'translate(0,0)'; });
    });

    // Scroll progress
    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
        window.addEventListener('scroll', () => {
            const progress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.style.width = progress + '%';
        });
    }

    // Product card tilt
    if (window.innerWidth > 768) {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mousemove', function (e) {
                const rect = this.getBoundingClientRect();
                const rotateX = (e.clientY - rect.top - rect.height / 2) / 20;
                const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 20;
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            card.addEventListener('mouseleave', function () {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
});

// ----------------------------------------
// Utility
// ----------------------------------------
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = () => { timeout = null; if (!immediate) func.apply(context, args); };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function () {
        if (!inThrottle) {
            func.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
