/* ── PHILROY · checkout.js ── */
const WORKER_URL = 'https://philroy-payments.21c50b65.workers.dev';

const PRODUCTS = {
  'survival-bracelet': { name: 'Survival Bracelet', price: 19.00 },
  'grab-handle':       { name: 'Grab Handle',       price: 29.00 },
};

let cart = JSON.parse(localStorage.getItem('philroy-cart') || '[]');

function saveCart() {
  localStorage.setItem('philroy-cart', JSON.stringify(cart));
  renderCart();
}

function addToCart(id) {
  const product = PRODUCTS[id];
  if (!product) return;
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.quantity += 1; }
  else { cart.push({ id, name: product.name, price: product.price, quantity: 1 }); }
  saveCart();
  openCart();
  showToast(product.name + ' added to cart');
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity = Math.max(1, item.quantity + delta);
  saveCart();
}

function cartTotal() { return cart.reduce((s, i) => s + i.price * i.quantity, 0); }
function cartCount() { return cart.reduce((s, i) => s + i.quantity, 0); }

function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

function renderCart() {
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = cartCount());
  const body = document.getElementById('cart-body');
  if (!body) return;
  if (cart.length === 0) {
    body.innerHTML = '<div class="cart-empty"><p>Your cart is empty.</p><a href="shop.html" class="btn-primary" onclick="closeCart()">Shop Now</a></div>';
    document.getElementById('cart-footer').style.display = 'none';
    return;
  }
  document.getElementById('cart-footer').style.display = '';
  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateQty('${item.id}',-1)">&#8722;</button>
        <span>${item.quantity}</span>
        <button onclick="updateQty('${item.id}',1)">+</button>
        <button class="cart-remove" onclick="removeFromCart('${item.id}')">&#x2715;</button>
      </div>
    </div>`).join('');
  document.getElementById('cart-total-amount').textContent = '$' + cartTotal().toFixed(2);
}

let stripe = null, elements = null;

async function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  const modal = document.getElementById('checkout-modal');
  modal.classList.add('open');
  document.getElementById('checkout-error').textContent = '';
  document.getElementById('checkout-confirm').disabled = false;
  document.getElementById('payment-element').innerHTML = '<div class="payment-loading">Loading payment form...</div>';
  try {
    const { publishableKey } = await (await fetch(WORKER_URL + '/config')).json();
    if (!stripe) stripe = Stripe(publishableKey);
    const { clientSecret, error } = await (await fetch(WORKER_URL + '/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
        customerEmail: (document.getElementById('checkout-email').value || '').trim() || undefined,
        customerName: (document.getElementById('checkout-name').value || '').trim() || undefined,
      }),
    })).json();
    if (error) {
      document.getElementById('checkout-error').textContent = error;
      document.getElementById('payment-element').innerHTML = '';
      return;
    }
    elements = stripe.elements({
      clientSecret,
      appearance: { theme: 'night', variables: { colorPrimary: '#C8A84B', colorBackground: '#1a1a1a', colorText: '#f5f5f0', colorDanger: '#e05c5c', borderRadius: '2px' } },
    });
    elements.create('payment').mount('#payment-element');
  } catch (err) {
    document.getElementById('checkout-error').textContent = 'Could not load payment form. Try again.';
    document.getElementById('payment-element').innerHTML = '';
  }
}

function closeCheckout() { document.getElementById('checkout-modal').classList.remove('open'); }

async function confirmPayment() {
  if (!stripe || !elements) return;
  const btn = document.getElementById('checkout-confirm');
  btn.disabled = true; btn.textContent = 'Processing...';
  document.getElementById('checkout-error').textContent = '';
  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: window.location.origin + '/success.html',
      receipt_email: (document.getElementById('checkout-email').value || '').trim() || undefined,
    },
  });
  if (error) {
    document.getElementById('checkout-error').textContent = error.message;
    btn.disabled = false; btn.textContent = 'Pay Now';
  }
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="cart-overlay" onclick="closeCart()"></div>
    <div id="cart-drawer">
      <div class="cart-header">
        <span class="cart-title">Your Cart</span>
        <button class="cart-close" onclick="closeCart()">&#x2715;</button>
      </div>
      <div id="cart-body" class="cart-body"></div>
      <div id="cart-footer" class="cart-footer" style="display:none">
        <div class="cart-total">Total: <strong id="cart-total-amount">$0.00</strong></div>
        <div class="checkout-fields">
          <input id="checkout-name" type="text" placeholder="Your name" autocomplete="name">
          <input id="checkout-email" type="email" placeholder="Email for receipt" autocomplete="email">
        </div>
        <button class="btn-primary full-width" onclick="openCheckout()">Checkout</button>
      </div>
    </div>
    <div id="checkout-modal">
      <div class="checkout-inner">
        <div class="checkout-modal-header">
          <span>Secure Checkout</span>
          <button onclick="closeCheckout()">&#x2715;</button>
        </div>
        <div id="payment-element"></div>
        <p id="checkout-error" class="checkout-error"></p>
        <button id="checkout-confirm" class="btn-primary full-width" onclick="confirmPayment()">Pay Now</button>
        <p class="checkout-secure">&#x1F512; Secured by Stripe &middot; Cards, Apple Pay, Google Pay, Afterpay</p>
      </div>
    </div>`);
  renderCart();
});
