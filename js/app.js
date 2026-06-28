/**
 * app.js — Main entry point
 * Orchestrates: data fetch, initial render, event binding
 * Modules: api.js → products.js → filters.js → cart.js → ui.js
 */

/* ── App State ──────────────────────────────────────────────────── */
let allProducts = []; // Master list from API

/* ── Bootstrap ──────────────────────────────────────────────────── */

/**
 * Entry point — runs on DOMContentLoaded.
 * Order: restore persisted data → show skeletons → fetch → render → bind events
 */
const init = async () => {
  // 1. Restore persisted data immediately
  loadCart();
  loadWishlist();
  updateCartBadge();
  updateWishlistBadge();
  syncThemeIcon();

  // 2. Show skeleton cards while loading
  renderSkeletonCards(6);

  // 3. Bind static UI event listeners
  bindEventListeners();

  // 4. Fetch products
  try {
    allProducts = await fetchProducts();
    setAllProductsRef(allProducts);

    // 5. Build category filters from real API data
    const categories = extractCategories(allProducts);
    buildCategoryButtons(categories, handleFilterChange);

    // 6. Initial product render (unfiltered)
    resetPagination();
    const filtered = applyFilters(allProducts, getFilterState());
    renderProducts(filtered);
    updateProductCount(filtered.length, allProducts.length);

  } catch (err) {
    console.error('Failed to fetch products:', err);
    showErrorState();
  }
};

/* ── Filter / Search change handler ────────────────────────────── */

/**
 * Called whenever search, category, or sort changes.
 * Re-applies all filters and re-renders from page 1.
 */
const handleFilterChange = () => {
  resetPagination();
  const filtered = applyFilters(allProducts, getFilterState());
  renderProducts(filtered);
  updateProductCount(filtered.length, allProducts.length);
};

/* ── Error State ────────────────────────────────────────────────── */

const showErrorState = () => {
  document.getElementById('productGrid').innerHTML = '';
  document.getElementById('errorState').classList.remove('hidden');
};

const hideErrorState = () => {
  document.getElementById('errorState').classList.add('hidden');
};

/* ── Event Listeners ────────────────────────────────────────────── */

const bindEventListeners = () => {
  // ── Search (debounced 300ms) ──
  const debouncedSearch = debounce((value) => {
    setSearch(value);
    handleFilterChange();
  }, 300);

  document.getElementById('searchInput').addEventListener('input', (e) => {
    const value = e.target.value;
    // Show/hide clear button
    document.getElementById('searchClear')
      .classList.toggle('visible', value.length > 0);
    debouncedSearch(value);
  });

  // Clear search button
  document.getElementById('searchClear').addEventListener('click', () => {
    const input = document.getElementById('searchInput');
    input.value = '';
    document.getElementById('searchClear').classList.remove('visible');
    setSearch('');
    handleFilterChange();
    input.focus();
  });

  // ── Sort ──
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    setSort(e.target.value);
    handleFilterChange();
  });

  // ── Clear All Filters ──
  document.getElementById('clearFiltersBtn').addEventListener('click', clearAllFilters);
  document.getElementById('emptyStateClearBtn').addEventListener('click', clearAllFilters);

  // ── Load More ──
  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    loadMoreProducts();
  });

  // ── Cart ──
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('closeCartBtn').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('checkoutBtn').addEventListener('click', showCheckoutModal);

  // Checkout modal close
  document.getElementById('closeCheckoutModal').addEventListener('click', () => {
    document.getElementById('checkoutModalOverlay').classList.remove('open');
  });
  document.getElementById('checkoutModalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      document.getElementById('checkoutModalOverlay').classList.remove('open');
    }
  });

  // ── Product Modal ──
  document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
  document.getElementById('productModalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeProductModal();
  });

  // ── Wishlist ──
  document.getElementById('wishlistBtn').addEventListener('click', openWishlistModal);
  document.getElementById('wishlistNavBtn').addEventListener('click', (e) => {
    e.preventDefault();
    openWishlistModal();
  });
  document.getElementById('mobileWishlistLink').addEventListener('click', (e) => {
    e.preventDefault();
    openWishlistModal();
    toggleMobileNav();
  });
  document.getElementById('closeWishlistModal').addEventListener('click', closeWishlistModal);
  document.getElementById('wishlistModalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeWishlistModal();
  });

  // ── Dark Mode Toggle ──
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // ── Hamburger ──
  document.getElementById('hamburger').addEventListener('click', toggleMobileNav);

  // Close mobile nav when links are clicked
  document.getElementById('mobileProductsLink').addEventListener('click', () => {
    toggleMobileNav();
  });
  document.getElementById('mobileReviewsLink').addEventListener('click', () => {
    toggleMobileNav();
  });
  document.getElementById('mobileContactLink').addEventListener('click', () => {
    toggleMobileNav();
  });

  // ── Retry button (error state) ──
  document.getElementById('retryBtn').addEventListener('click', async () => {
    hideErrorState();
    renderSkeletonCards(6);
    try {
      allProducts = await fetchProducts();
      setAllProductsRef(allProducts);
      const categories = extractCategories(allProducts);
      buildCategoryButtons(categories, handleFilterChange);
      resetPagination();
      const filtered = applyFilters(allProducts, getFilterState());
      renderProducts(filtered);
      updateProductCount(filtered.length, allProducts.length);
    } catch (err) {
      showErrorState();
    }
  });

  // ── Keyboard: Escape closes open modals/drawers ──
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeProductModal();
    closeWishlistModal();
    closeCart();
    document.getElementById('checkoutModalOverlay').classList.remove('open');
  });
};

/* ── Helpers ────────────────────────────────────────────────────── */

/** Reset all filters to defaults and re-render */
const clearAllFilters = () => {
  // Reset filter state
  resetFilters();
  updateActiveCategoryBtn('all');

  // Reset DOM controls
  document.getElementById('searchInput').value = '';
  document.getElementById('sortSelect').value = 'default';
  document.getElementById('searchClear').classList.remove('visible');

  handleFilterChange();
};

/* ── Start ──────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);