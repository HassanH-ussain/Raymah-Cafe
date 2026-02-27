/* ========================================
   Raymah Café - Checkout Page JavaScript
   "From Bean to Brew"
   ======================================== */

const API_BASE = '/api';

// ----------------------------------------
// State
// ----------------------------------------
let cart = [];
let orderType = 'delivery';
let tipPercent = 18;
let customTipAmount = 0;
let discount = 0;
const TAX_RATE = 0.08875;
const DELIVERY_FEE = 4.99;

const PROMO_CODES = {
    WELCOME10: { type: 'percent', value: 10, message: '10% off applied!' },
    FREESHIP: { type: 'delivery', value: 0, message: 'Free delivery applied!' },
    COFFEE5: { type: 'fixed', value: 5, message: '$5 off applied!' },
};

// ----------------------------------------
// Stripe — initialised after fetching publishable key from /api/config
// ----------------------------------------
let stripe = null;
let cardElement = null;

async function initStripe() {
    try {
        const res = await fetch(`${API_BASE}/config`);
        const { stripePublishableKey } = await res.json();
        if (!stripePublishableKey) throw new Error('Stripe publishable key not configured');

        stripe = Stripe(stripePublishableKey);
        const elements = stripe.elements();

        cardElement = elements.create('card', {
            style: {
                base: {
                    color: '#f5f0e8',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '14px',
                    '::placeholder': { color: 'rgba(245, 240, 232, 0.3)' },
                    iconColor: '#d4af37',
                },
                invalid: {
                    color: '#ef4444',
                    iconColor: '#ef4444',
                },
            },
        });

        cardElement.mount('#card-element');

        cardElement.on('change', e => {
            const errEl = document.getElementById('card-errors');
            if (e.error) {
                errEl.textContent = e.error.message;
                errEl.classList.remove('hidden');
            } else {
                errEl.classList.add('hidden');
            }
        });
    } catch (err) {
        console.error('Stripe init failed:', err.message);
    }
}

// ----------------------------------------
// Safe JSON parse (avoids crashing on corrupted localStorage)
// ----------------------------------------
function safeJSONParse(str, fallback) {
    if (!str || str === 'undefined' || str === 'null' || str === '') return fallback;
    try {
        const parsed = JSON.parse(str);
        if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
        return parsed;
    } catch (e) {
        try { localStorage.removeItem('raymahCart'); } catch (_) { }
        return fallback;
    }
}

// ----------------------------------------
// Load & render cart
// ----------------------------------------
function loadCart() {
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
    renderCheckout();
}

function renderCheckout() {
    const checkoutItems = document.getElementById('checkoutItems');
    const emptyMessage = document.getElementById('emptyCartMessage');
    const formContainer = document.getElementById('checkoutFormContainer');
    const sidebar = document.querySelector('.lg\\:col-span-1');

    if (cart.length === 0) {
        emptyMessage?.classList.remove('hidden');
        formContainer?.classList.add('hidden');
        sidebar?.classList.add('hidden');
        return;
    }

    emptyMessage?.classList.add('hidden');
    formContainer?.classList.remove('hidden');
    sidebar?.classList.remove('hidden');

    if (checkoutItems) {
        checkoutItems.innerHTML = cart.map(item => `
            <div class="order-item">
                <div class="w-14 h-14 bg-gradient-to-br from-gold/20 to-dark flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-gold/50" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3z"/>
                    </svg>
                </div>
                <div class="flex-1">
                    <h4 class="text-cream text-sm font-medium">${item.name}</h4>
                    <p class="text-cream/40 text-xs">Qty: ${item.quantity}</p>
                </div>
                <p class="text-gold text-sm">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        `).join('');
    }

    updateTotals();
}

// ----------------------------------------
// Totals
// ----------------------------------------
function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
    const tip = tipPercent === 'custom' ? customTipAmount : subtotal * (tipPercent / 100);
    const taxableAmount = subtotal + deliveryFee - discount;
    const tax = taxableAmount * TAX_RATE;
    const total = taxableAmount + tax + tip;

    document.getElementById('summarySubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('summaryDelivery').textContent = deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : 'Free';
    document.getElementById('summaryTax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('summaryTip').textContent = `$${tip.toFixed(2)}`;
    document.getElementById('summaryTotal').textContent = `$${total.toFixed(2)}`;

    document.getElementById('deliveryFeeRow').style.display = orderType === 'delivery' ? 'flex' : 'none';

    const discountRow = document.getElementById('discountRow');
    if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('summaryDiscount').textContent = `-$${discount.toFixed(2)}`;
    } else {
        discountRow.style.display = 'none';
    }
}

// ----------------------------------------
// Collect form data for API submission
// ----------------------------------------
function collectOrderData() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
    const tip = tipPercent === 'custom' ? customTipAmount : subtotal * (tipPercent / 100);
    const taxableAmount = subtotal + deliveryFee - discount;
    const tax = taxableAmount * TAX_RATE;
    const total = taxableAmount + tax + tip;

    const activeTab = document.querySelector('.payment-tab.active');
    const paymentMethod = activeTab?.dataset.method || 'card';

    return {
        customer: {
            firstName: document.getElementById('firstName')?.value.trim(),
            lastName: document.getElementById('lastName')?.value.trim(),
            email: document.getElementById('email')?.value.trim(),
            phone: document.getElementById('phone')?.value.trim(),
        },
        items: cart.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        })),
        orderType,
        deliveryAddress: orderType === 'delivery' ? {
            address: document.getElementById('address')?.value.trim(),
            apartment: document.getElementById('apartment')?.value.trim(),
            city: document.getElementById('city')?.value.trim(),
            state: document.getElementById('state')?.value.trim(),
            zip: document.getElementById('zip')?.value.trim(),
            instructions: document.getElementById('deliveryInstructions')?.value.trim(),
        } : undefined,
        pickupTime: orderType === 'pickup' ? document.getElementById('pickupTime')?.value : undefined,
        paymentMethod,
        pricing: {
            subtotal: parseFloat(subtotal.toFixed(2)),
            deliveryFee: parseFloat(deliveryFee.toFixed(2)),
            discount: parseFloat(discount.toFixed(2)),
            tax: parseFloat(tax.toFixed(2)),
            tip: parseFloat(tip.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
        },
        promoCode: document.getElementById('promoCode')?.value.trim() || '',
    };
}

// ----------------------------------------
// Initialise on DOM ready
// ----------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    loadCart();
    initStripe();

    // Order type toggle
    document.querySelectorAll('input[name="orderType"]').forEach(radio => {
        radio.addEventListener('change', e => {
            orderType = e.target.value;
            const deliverySection = document.getElementById('deliverySection');
            const pickupSection = document.getElementById('pickupSection');
            if (orderType === 'delivery') {
                deliverySection?.classList.remove('hidden');
                pickupSection?.classList.add('hidden');
                deliverySection?.querySelectorAll('input[required]').forEach(i => { i.required = true; });
            } else {
                deliverySection?.classList.add('hidden');
                pickupSection?.classList.remove('hidden');
                deliverySection?.querySelectorAll('input').forEach(i => { i.required = false; });
            }
            updateTotals();
        });
    });

    // Payment tabs
    document.querySelectorAll('.payment-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const method = tab.dataset.method;
            document.getElementById('cardPayment')?.classList.toggle('hidden', method !== 'card');
            document.getElementById('paypalPayment')?.classList.toggle('hidden', method !== 'paypal');
            document.getElementById('applepayPayment')?.classList.toggle('hidden', method !== 'applepay');
        });
    });

    // Tip buttons
    document.querySelectorAll('.tip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tipValue = btn.dataset.tip;
            const customInput = document.getElementById('customTipInput');
            if (tipValue === 'custom') {
                customInput?.classList.remove('hidden');
                tipPercent = 'custom';
            } else {
                customInput?.classList.add('hidden');
                tipPercent = parseInt(tipValue);
            }
            document.getElementById('tipAmount').value = tipValue;
            updateTotals();
        });
    });

    document.getElementById('customTip')?.addEventListener('input', e => {
        customTipAmount = parseFloat(e.target.value) || 0;
        updateTotals();
    });

    // Promo code
    document.getElementById('applyPromo')?.addEventListener('click', () => {
        const code = document.getElementById('promoCode').value.trim().toUpperCase();
        const messageEl = document.getElementById('promoMessage');
        if (PROMO_CODES[code]) {
            const promo = PROMO_CODES[code];
            if (promo.type === 'percent') {
                discount = cart.reduce((s, i) => s + i.price * i.quantity, 0) * (promo.value / 100);
            } else if (promo.type === 'fixed') {
                discount = promo.value;
            } else if (promo.type === 'delivery') {
                document.getElementById('summaryDelivery').textContent = 'Free';
            }
            messageEl.textContent = promo.message;
            messageEl.className = 'text-sm mt-2 text-green-400';
            updateTotals();
        } else if (code) {
            messageEl.textContent = 'Invalid promo code';
            messageEl.className = 'text-sm mt-2 text-red-400';
        }
    });

    // Phone formatting
    document.getElementById('phone')?.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length >= 6) v = `(${v.slice(0, 3)}) ${v.slice(3, 6)}-${v.slice(6, 10)}`;
        else if (v.length >= 3) v = `(${v.slice(0, 3)}) ${v.slice(3)}`;
        e.target.value = v;
    });

    // Form submission — Stripe payment flow
    document.getElementById('checkoutForm')?.addEventListener('submit', async e => {
        e.preventDefault();

        const btn = document.getElementById('placeOrderBtn');
        btn.disabled = true;
        btn.textContent = 'Processing...';

        const activeTab = document.querySelector('.payment-tab.active');
        const paymentMethod = activeTab?.dataset.method || 'card';

        try {
            const orderData = collectOrderData();

            if (paymentMethod === 'card') {
                if (!stripe || !cardElement) throw new Error('Payment system not ready. Please refresh and try again.');

                // Step 1: Create a PaymentIntent on the server
                btn.textContent = 'Contacting payment server...';
                const intentRes = await fetch(`${API_BASE}/orders/create-payment-intent`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: orderData.pricing.total }),
                });
                const intentData = await intentRes.json();
                if (!intentRes.ok || !intentData.success) throw new Error(intentData.message || 'Payment initialization failed');

                // Step 2: Confirm the card payment via Stripe.js
                btn.textContent = 'Authorizing card...';
                const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: document.getElementById('cardName')?.value.trim(),
                            email: orderData.customer.email,
                        },
                    },
                });
                if (error) throw new Error(error.message);

                // Attach the payment intent ID so the backend can audit it
                orderData.stripePaymentIntentId = paymentIntent.id;
            }

            // Step 3: Save the order to MongoDB
            btn.textContent = 'Placing order...';
            const res = await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || 'Failed to place order');

            // Show confirmation with real order number from DB
            document.getElementById('orderNumber').textContent = `Order #${data.data.orderNumber}`;
            document.getElementById('confirmationMessage').textContent =
                orderType === 'delivery'
                    ? 'Your order is being prepared and will be delivered in approximately 30-45 minutes.'
                    : 'Your order will be ready for pickup in approximately 15-20 minutes.';

            localStorage.removeItem('raymahCart');
            document.getElementById('confirmationModal').classList.remove('hidden');

        } catch (err) {
            alert(`Order failed: ${err.message}\n\nPlease check your details and try again.`);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Place Order';
        }
    });

    // Confirmation modal close
    document.getElementById('closeModal')?.addEventListener('click', () => {
        document.getElementById('confirmationModal').classList.add('hidden');
        window.location.href = 'index.html';
    });
    document.getElementById('modalOverlay')?.addEventListener('click', () => {
        document.getElementById('confirmationModal').classList.add('hidden');
        window.location.href = 'index.html';
    });
});
