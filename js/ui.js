/**
 * ui.js — Modal, drawer, dark mode, toast, wishlist UI
 * Handles: product modal, checkout modal, wishlist modal, theme toggle
 */

/* ── Product Modal ──────────────────────────────────────────────── */

// Reference to allProducts (set by app.js after fetch)
let _allProducts = [];

const setAllProductsRef = (products) => { _allProducts = products; };

/**
 * Open the product detail modal for a given product ID.
 * @param {number} productId
 */
const openProductModal = (productId) => {
  const product = _allProducts.find((p) => p.id === productId);
  if (!product) return;

  const overlay = document.getElementById('productModalOverlay');
  const content = document.getElementById('productModalContent');

  content.innerHTML = buildProductModalHTML(product);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Attach quantity + add-to-cart listeners inside modal
  attachModalListeners(product);
};

const closeProductModal = () => {
  document.getElementById('productModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
};

const buildProductModalHTML = (product) => {
  const { title, image, description, category, price, rating } = product;

  return `
    <div class="modal-img-wrap">
      <img
        class="modal-img"
        src="${image}"
        alt="${title}"
        onerror="this.src='https://placehold.co/300x300?text=No+Image'"
      />
    </div>
    <div class="modal-info">
      <span class="modal-badge">${category}</span>
      <h2 class="modal-title" id="modalTitle">${title}</h2>
      <p class="modal-description">${description}</p>

      <div class="modal-rating-row">
        <div class="stars">${buildStarsHTML(rating.rate)}</div>
        <span class="rating-label">${rating.rate}</span>
        <span class="modal-reviews">· ${rating.count} reviews</span>
      </div>

      <p class="modal-price">$${price.toFixed(2)}</p>

      <div class="modal-qty">
        <span class="modal-qty-label">Quantity:</span>
        <div class="modal-qty-controls">
          <button class="modal-qty-btn" id="modalQtyDec" aria-label="Decrease">−</button>
          <input
            class="modal-qty-input"
            id="modalQtyInput"
            type="number"
            value="1"
            min="1"
            max="99"
            readonly
          />
          <button class="modal-qty-btn" id="modalQtyInc" aria-label="Increase">+</button>
        </div>
      </div>

      <button class="btn btn--primary" id="modalAddToCartBtn">
        <i class="fa-solid fa-bag-shopping"></i> Add to Cart
      </button>
    </div>
  `;
};

const attachModalListeners = (product) => {
  const qtyInput = document.getElementById('modalQtyInput');
  const decBtn   = document.getElementById('modalQtyDec');
  const incBtn   = document.getElementById('modalQtyInc');
  const addBtn   = document.getElementById('modalAddToCartBtn');

  decBtn.addEventListener('click', () => {
    const current = parseInt(qtyInput.value, 10);
    if (current > 1) qtyInput.value = current - 1;
  });

  incBtn.addEventListener('click', () => {
    const current = parseInt(qtyInput.value, 10);
    if (current < 99) qtyInput.value = current + 1;
  });

  addBtn.addEventListener('click', () => {
    const qty = parseInt(qtyInput.value, 10);
    addToCart(product, qty);
    showToast(`${qty}× "${product.title.slice(0, 28)}…" added to cart`);
    closeProductModal();
  });
};

/* ── Wishlist Modal ─────────────────────────────────────────────── */

const openWishlistModal = () => {
  const overlay = document.getElementById('wishlistModalOverlay');
  const content = document.getElementById('wishlistModalContent');

  content.innerHTML = buildWishlistModalHTML();
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  attachWishlistModalListeners();
};

const closeWishlistModal = () => {
  document.getElementById('wishlistModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
};

const buildWishlistModalHTML = () => {
  if (wishlist.length === 0) {
    return `
      <h2 class="wishlist-title"><i class="fa-solid fa-heart"></i> Your Wishlist</h2>
      <div class="wishlist-empty">
        <i class="fa-regular fa-heart"></i>
        <p>Your wishlist is empty</p>
        <span>Click the heart icon on any product to save it here.</span>
      </div>
    `;
  }

  const itemsHTML = wishlist.map((product) => `
    <div class="wishlist-item" data-id="${product.id}">
      <div class="wishlist-item__img-wrap">
        <img
          class="wishlist-item__img"
          src="${product.image}"
          alt="${product.title}"
          onerror="this.src='https://placehold.co/120x120?text=?'"
        />
      </div>
      <div class="wishlist-item__info">
        <p class="wishlist-item__title">${product.title}</p>
        <div class="wishlist-item__footer">
          <span class="wishlist-item__price">$${product.price.toFixed(2)}</span>
          <div style="display:flex;gap:6px;">
            <button class="btn btn--primary btn--sm wishlist-add-btn" data-id="${product.id}">
              <i class="fa-solid fa-bag-shopping"></i> Add
            </button>
            <button class="btn btn--ghost btn--sm wishlist-remove-btn" data-id="${product.id}">
              <i class="fa-solid fa-heart-crack"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <h2 class="wishlist-title" id="wishlistTitle">
      <i class="fa-solid fa-heart"></i> Your Wishlist
      <span style="font-size:14px;font-weight:500;color:var(--color-text-muted)">(${wishlist.length} item${wishlist.length > 1 ? 's' : ''})</span>
    </h2>
    <div class="wishlist-grid">${itemsHTML}</div>
  `;
};

const attachWishlistModalListeners = () => {
  // Add to cart from wishlist
  document.querySelectorAll('.wishlist-add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id      = parseInt(btn.dataset.id, 10);
      const product = wishlist.find((p) => p.id === id);
      if (!product) return;
      addToCart(product, 1);
      showToast(`Added to cart!`);
    });
  });

  // Remove from wishlist
  document.querySelectorAll('.wishlist-remove-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id      = parseInt(btn.dataset.id, 10);
      const product = wishlist.find((p) => p.id === id);
      if (!product) return;
      toggleWishlist(product);
      // Re-render modal content in place
      openWishlistModal();
    });
  });
};

/* ── Dark / Light Mode ──────────────────────────────────────────── */

const THEME_KEY = 'theme';

const getCurrentTheme = () =>
  document.documentElement.getAttribute('data-theme') || 'light';

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);

  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
};

const toggleTheme = () => {
  const next = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
};

/** Sync icon with current theme on page load */
const syncThemeIcon = () => {
  const current = getCurrentTheme();
  const icon    = document.getElementById('themeIcon');
  if (icon) {
    icon.className = current === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
};

/* ── Toast Notification ─────────────────────────────────────────── */

let toastTimer = null;

/**
 * Show a brief toast message at the bottom of the screen.
 * Auto-dismisses after 2.5s.
 * @param {string} message
 * @param {string} [icon] — Font Awesome class e.g. 'fa-solid fa-check'
 */
const showToast = (message, icon = 'fa-solid fa-bag-shopping') => {
  const toast = document.getElementById('toast');
  toast.innerHTML = `<i class="${icon}"></i> ${message}`;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
};

/* ── Hamburger Menu ─────────────────────────────────────────────── */

const toggleMobileNav = () => {
  const nav  = document.getElementById('mobileNav');
  const icon = document.getElementById('hamburgerIcon');
  const open = nav.classList.toggle('open');

  icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
};