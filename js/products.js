/**
 * products.js — Product rendering logic
 * Handles: card HTML, skeleton cards, star rating, wishlist state
 */

/* ── Wishlist State ─────────────────────────────────────────────── */
const WISHLIST_KEY = 'shopwave_wishlist';
let wishlist = [];

const loadWishlist = () => {
  const stored = localStorage.getItem(WISHLIST_KEY);
  if (stored) wishlist = JSON.parse(stored);
};

const saveWishlist = () => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
};

const isWishlisted = (productId) =>
  wishlist.some((p) => p.id === productId);

const toggleWishlist = (product) => {
  if (isWishlisted(product.id)) {
    wishlist = wishlist.filter((p) => p.id !== product.id);
    showToast(`Removed from wishlist`);
  } else {
    wishlist.push(product);
    showToast(`Added to wishlist ♥`);
  }

  saveWishlist();
  updateWishlistBadge();

  // Update any visible heart button for this product
  document.querySelectorAll(`.product-card__wishlist[data-id="${product.id}"]`).forEach((btn) => {
    btn.classList.toggle('wishlisted', isWishlisted(product.id));
    const icon = btn.querySelector('i');
    if (icon) icon.className = isWishlisted(product.id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  });
};

const updateWishlistBadge = () => {
  const badge    = document.getElementById('wishlistBadge');
  const navBadge = document.getElementById('wishlistNavBadge');
  const count    = wishlist.length;

  if (badge) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.toggle('visible', count > 0);
  }

  if (navBadge) {
    navBadge.textContent = count;
    navBadge.classList.toggle('visible', count > 0);
  }
};

/* ── Load-More Pagination ───────────────────────────────────────── */
const PAGE_SIZE = 8;
let visibleCount = PAGE_SIZE;
let currentProducts = []; // current filtered + sorted list

const resetPagination = () => { visibleCount = PAGE_SIZE; };

const getVisibleProducts = () => currentProducts.slice(0, visibleCount);

const hasMoreProducts = () => visibleCount < currentProducts.length;

/* ── Star Rating ────────────────────────────────────────────────── */

/**
 * Build an HTML string of 5 star icons representing a rating.
 * Supports full, half, and empty stars.
 * @param {number} rating — e.g. 3.7
 */
const buildStarsHTML = (rating) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push('<i class="fa-solid fa-star star filled"></i>');
    } else if (rating >= i - 0.5) {
      stars.push('<i class="fa-solid fa-star-half-stroke star half"></i>');
    } else {
      stars.push('<i class="fa-regular fa-star star"></i>');
    }
  }

  return stars.join('');
};

/* ── Category badge color mapping ───────────────────────────────── */

const categoryColors = {
  "electronics":        '#4F46E5',
  "jewelery":           '#DB2777',
  "men's clothing":     '#0891B2',
  "women's clothing":   '#7C3AED',
};

const getBadgeColor = (category) =>
  categoryColors[category] || '#4F46E5';

/* ── Product Card HTML ──────────────────────────────────────────── */

/**
 * Build HTML for a single product card.
 * Uses template literals throughout (no string concatenation).
 */
const buildProductCardHTML = (product) => {
  const { id, title, price, image, category, rating } = product;
  const wishlisted = isWishlisted(id);
  const badgeColor = getBadgeColor(category);

  return `
    <article class="product-card" data-id="${id}" tabindex="0" role="button" aria-label="View ${title}">
      <div class="product-card__img-wrap">
        <img
          class="product-card__img"
          src="${image}"
          alt="${title}"
          loading="lazy"
          onerror="this.src='https://placehold.co/200x200?text=No+Image'"
        />
        <span class="product-card__badge" style="background:${badgeColor}">${category}</span>
        <button
          class="product-card__wishlist ${wishlisted ? 'wishlisted' : ''}"
          data-id="${id}"
          aria-label="${wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"
          title="Wishlist"
        >
          <i class="${wishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
        </button>
      </div>

      <div class="product-card__body">
        <h3 class="product-card__title">${title}</h3>

        <div class="product-card__meta">
          <div class="stars" aria-label="${rating.rate} out of 5 stars">
            ${buildStarsHTML(rating.rate)}
            <span class="rating-label">${rating.rate}</span>
          </div>
          <span class="product-card__price">$${price.toFixed(2)}</span>
        </div>
      </div>

      <div class="product-card__footer">
        <button class="btn btn--primary add-to-cart-btn" data-id="${id}">
          <i class="fa-solid fa-bag-shopping"></i> Add to Cart
        </button>
      </div>
    </article>
  `;
};

/* ── Skeleton Cards ─────────────────────────────────────────────── */

const buildSkeletonCardHTML = () => `
  <div class="skeleton-card">
    <div class="skeleton-img skeleton-shimmer"></div>
    <div class="skeleton-body">
      <div class="skeleton-line skeleton-line--badge skeleton-shimmer"></div>
      <div class="skeleton-line skeleton-line--title-1 skeleton-shimmer"></div>
      <div class="skeleton-line skeleton-line--title-2 skeleton-shimmer"></div>
      <div class="skeleton-line skeleton-line--rating skeleton-shimmer"></div>
      <div class="skeleton-line skeleton-line--price skeleton-shimmer"></div>
    </div>
    <div class="skeleton-btn skeleton-shimmer"></div>
  </div>
`;

/**
 * Render N skeleton cards into the product grid.
 * @param {number} count — number of placeholders to show
 */
const renderSkeletonCards = (count = 6) => {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = Array.from({ length: count }, buildSkeletonCardHTML).join('');
};

/* ── Render Products ────────────────────────────────────────────── */

/**
 * Render current visible products into the grid.
 * Attaches event listeners for card clicks, wishlist, add-to-cart.
 * @param {Array} allProducts  — full product list (for context)
 */
const renderProducts = (filtered) => {
  const grid       = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyState');
  const loadWrap   = document.getElementById('loadMoreWrap');

  currentProducts = filtered;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyState.classList.remove('hidden');
    loadWrap.classList.add('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  const visible = getVisibleProducts();
  grid.innerHTML = visible.map(buildProductCardHTML).join('');

  // Show/hide Load More
  loadWrap.classList.toggle('hidden', !hasMoreProducts());

  attachProductCardListeners();
};

/** Append next page of products (Load More functionality) */
const loadMoreProducts = () => {
  visibleCount += PAGE_SIZE;

  const visible = getVisibleProducts();
  const grid    = document.getElementById('productGrid');
  const loadWrap = document.getElementById('loadMoreWrap');

  // Append only the new cards (avoid full re-render)
  const newCards = currentProducts
    .slice(visibleCount - PAGE_SIZE, visibleCount)
    .map(buildProductCardHTML)
    .join('');

  grid.insertAdjacentHTML('beforeend', newCards);
  loadWrap.classList.toggle('hidden', !hasMoreProducts());

  attachProductCardListeners();
};

/* ── Event Listeners ────────────────────────────────────────────── */

/**
 * Attach click listeners to product cards, wishlist buttons, add-to-cart.
 * Called after every render.
 */
const attachProductCardListeners = () => {
  // Card click → open modal (but not if clicking add-to-cart or wishlist)
  document.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      // If click was on add-to-cart or wishlist button, skip modal
      if (
        e.target.closest('.add-to-cart-btn') ||
        e.target.closest('.product-card__wishlist')
      ) return;

      const id = parseInt(card.dataset.id, 10);
      openProductModal(id);
    });

    // Keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const id = parseInt(card.dataset.id, 10);
        openProductModal(id);
      }
    });
  });

  // Add to cart buttons
  document.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id      = parseInt(btn.dataset.id, 10);
      const product = currentProducts.find((p) => p.id === id);
      if (!product) return;

      addToCart(product, 1);
      showToast(`"${product.title.slice(0, 30)}…" added to cart`);

      // Visual feedback on button
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
      btn.style.background = 'var(--color-success)';
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-bag-shopping"></i> Add to Cart';
        btn.style.background = '';
      }, 1200);
    });
  });

  // Wishlist toggle buttons
  document.querySelectorAll('.product-card__wishlist').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id      = parseInt(btn.dataset.id, 10);
      const product = currentProducts.find((p) => p.id === id);
      if (!product) return;
      toggleWishlist(product);
    });
  });
};