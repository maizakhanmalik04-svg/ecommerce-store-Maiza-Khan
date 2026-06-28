/**
 * cart.js — All shopping cart logic
 * Handles: add, remove, quantity updates, subtotal, persistence, checkout
 */

/* ── State ──────────────────────────────────────────────────────── */
// Cart is an array of { product, quantity } objects
let cart = [];

const CART_KEY = 'shopwave_cart';

/* ── LocalStorage persistence ───────────────────────────────────── */

/** Save cart to localStorage */
const saveCart = () => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

/** Load cart from localStorage on startup */
const loadCart = () => {
  const stored = localStorage.getItem(CART_KEY);
  if (stored) {
    cart = JSON.parse(stored);
  }
};

/* ── Getters ────────────────────────────────────────────────────── */

/** Total number of items (summing quantities) */
const getCartItemCount = () =>
  cart.reduce((sum, item) => sum + item.quantity, 0);

/** Cart subtotal as a number */
const getCartSubtotal = () =>
  cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

/** Find cart entry by product id */
const findCartEntry = (productId) =>
  cart.find((item) => item.product.id === productId);

/* ── Mutations ──────────────────────────────────────────────────── */

/**
 * Add product to cart or increment quantity.
 * @param {Object} product  — FakeStore product object
 * @param {number} quantity — how many to add (default 1)
 */
const addToCart = (product, quantity = 1) => {
  const existing = findCartEntry(product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }

  saveCart();
  renderCart();
  updateCartBadge();
};

/**
 * Remove item from cart entirely.
 * @param {number} productId
 */
const removeFromCart = (productId) => {
  cart = cart.filter((item) => item.product.id !== productId);
  saveCart();
  renderCart();
  updateCartBadge();
};

/**
 * Update quantity of a cart item.
 * Quantity floor is 1 — never goes below.
 * @param {number} productId
 * @param {number} delta — +1 or -1
 */
const updateQuantity = (productId, delta) => {
  const entry = findCartEntry(productId);
  if (!entry) return;

  const newQty = entry.quantity + delta;
  if (newQty < 1) return; // floor at 1

  entry.quantity = newQty;
  saveCart();
  renderCart();
  updateCartBadge();
};

/** Clear all items from cart */
const clearCart = () => {
  cart = [];
  saveCart();
  renderCart();
  updateCartBadge();
};

/* ── Badge ──────────────────────────────────────────────────────── */

const updateCartBadge = () => {
  const badge = document.getElementById('cartBadge');
  const count = getCartItemCount();

  badge.textContent = count > 99 ? '99+' : count;

  if (count > 0) {
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
};

/* ── Render ─────────────────────────────────────────────────────── */

const renderCart = () => {
  const body     = document.getElementById('cartBody');
  const footer   = document.getElementById('cartFooter');
  const countEl  = document.getElementById('cartItemCount');
  const subtotal = document.getElementById('cartSubtotal');

  const itemCount = getCartItemCount();
  countEl.textContent = itemCount === 1 ? '1 item' : `${itemCount} items`;

  if (cart.length === 0) {
    body.innerHTML = buildEmptyCartHTML();
    footer.classList.add('hidden');
    return;
  }

  footer.classList.remove('hidden');
  body.innerHTML = cart.map(buildCartItemHTML).join('');
  subtotal.textContent = `$${getCartSubtotal().toFixed(2)}`;

  attachCartItemListeners();
};

/** Build HTML for a single cart item */
const buildCartItemHTML = ({ product, quantity }) => `
  <div class="cart-item" data-id="${product.id}">
    <img
      class="cart-item__img"
      src="${product.image}"
      alt="${product.title}"
      onerror="this.src='https://placehold.co/60x60?text=?'"
    />
    <div class="cart-item__info">
      <p class="cart-item__title">${product.title}</p>
      <p class="cart-item__price">$${(product.price * quantity).toFixed(2)}</p>
      <div class="cart-item__controls">
        <button class="qty-btn" data-action="dec" data-id="${product.id}" aria-label="Decrease quantity">−</button>
        <span class="qty-value">${quantity}</span>
        <button class="qty-btn" data-action="inc" data-id="${product.id}" aria-label="Increase quantity">+</button>
      </div>
    </div>
    <button class="cart-item__remove" data-id="${product.id}" aria-label="Remove item">
      <i class="fa-solid fa-xmark"></i>
    </button>
  </div>
`;

const buildEmptyCartHTML = () => `
  <div class="cart-empty">
    <div class="cart-empty__icon"><i class="fa-solid fa-bag-shopping"></i></div>
    <p class="cart-empty__title">Your cart is empty</p>
    <p class="cart-empty__msg">Add some products to get started!</p>
    <button class="btn btn--primary" id="continueShoppingBtn" style="margin-top:8px;">
      <i class="fa-solid fa-arrow-left"></i> Continue Shopping
    </button>
  </div>
`;

/** Attach event listeners to dynamically rendered cart items */
const attachCartItemListeners = () => {
  document.querySelectorAll('.qty-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id    = parseInt(e.currentTarget.dataset.id, 10);
      const delta = e.currentTarget.dataset.action === 'inc' ? 1 : -1;
      updateQuantity(id, delta);
    });
  });

  document.querySelectorAll('.cart-item__remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.dataset.id, 10);
      removeFromCart(id);
    });
  });

  // Continue shopping button inside empty state
  const continueBtn = document.getElementById('continueShoppingBtn');
  if (continueBtn) {
    continueBtn.addEventListener('click', closeCart);
  }
};

/* ── Checkout ───────────────────────────────────────────────────── */

/** Build and show the order confirmation modal */
const showCheckoutModal = () => {
  if (cart.length === 0) return;

  const overlay = document.getElementById('checkoutModalOverlay');
  const content = document.getElementById('checkoutModalContent');

  const itemsHTML = cart.map((item) => `
    <div class="checkout-item">
      <img
        class="checkout-item__img"
        src="${item.product.image}"
        alt="${item.product.title}"
        onerror="this.src='https://placehold.co/44x44?text=?'"
      />
      <div class="checkout-item__info">
        <p class="checkout-item__title">${item.product.title}</p>
        <p class="checkout-item__qty">Qty: ${item.quantity}</p>
      </div>
      <span class="checkout-item__price">$${(item.product.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  content.innerHTML = `
    <div class="checkout-header">
      <div class="checkout-icon"><i class="fa-solid fa-circle-check"></i></div>
      <h2 class="checkout-title" id="checkoutTitle">Order Confirmed!</h2>
      <p class="checkout-subtitle">Thank you for shopping with ShopWave</p>
    </div>
    <div class="checkout-items">${itemsHTML}</div>
    <div class="checkout-total">
      <span>Total Paid</span>
      <span class="checkout-total__amount">$${getCartSubtotal().toFixed(2)}</span>
    </div>
    <button class="btn btn--primary btn--full" id="checkoutDoneBtn">
      <i class="fa-solid fa-check"></i> Done
    </button>
  `;

  overlay.classList.add('open');

  // Clear cart after confirming checkout
  clearCart();
  closeCart();

  document.getElementById('checkoutDoneBtn').addEventListener('click', () => {
    overlay.classList.remove('open');
  });
};

/* ── Cart Drawer open/close (referenced by ui.js) ──────────────── */
const openCart = () => {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
};

const closeCart = () => {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
};