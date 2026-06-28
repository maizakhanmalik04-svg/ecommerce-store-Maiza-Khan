/**
 * filters.js — Search, category filter, and sort logic
 * All three work simultaneously via applyFilters()
 */

/* ── Filter State ───────────────────────────────────────────────── */
let filterState = {
  search:   '',
  category: 'all',
  sort:     'default',
};

/* ── Debounced search using closure ─────────────────────────────── */
/**
 * Returns a debounced version of fn that waits `delay` ms
 * after the last call before executing. Written as a closure.
 * @param {Function} fn
 * @param {number} delay
 */
const debounce = (fn, delay) => {
  let timerId;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
};

/* ── Core filter + sort pipeline ────────────────────────────────── */

/**
 * Apply search, category, and sort to the full products array.
 * Returns a new filtered + sorted array — does not mutate original.
 * @param {Array} products  — full product list from API
 * @param {Object} state    — { search, category, sort }
 */
const applyFilters = (products, state = filterState) => {
  const searchTerm = state.search.toLowerCase().trim();

  const filtered = products
    .filter((p) => {
      // 1. Category filter
      if (state.category !== 'all' && p.category !== state.category) return false;
      // 2. Search filter (title match, case-insensitive)
      if (searchTerm && !p.title.toLowerCase().includes(searchTerm)) return false;
      return true;
    });

  // 3. Sort
  return sortProducts(filtered, state.sort);
};

/**
 * Sort a products array by the given sort key.
 * Uses .sort() with array destructuring for clean comparison.
 */
const sortProducts = (products, sortKey) => {
  const sorters = {
    'price-asc':   (a, b) => a.price - b.price,
    'price-desc':  (a, b) => b.price - a.price,
    'rating-desc': (a, b) => b.rating.rate - a.rating.rate,
    'name-asc':    (a, b) => a.title.localeCompare(b.title),
    'default':     () => 0,
  };

  const compareFn = sorters[sortKey] || sorters['default'];
  // .slice() so we don't mutate the original array
  return products.slice().sort(compareFn);
};

/* ── Filter state updaters ──────────────────────────────────────── */

const setSearch = (value) => { filterState.search = value; };
const setCategory = (cat)  => { filterState.category = cat; };
const setSort = (key)      => { filterState.sort = key; };

const resetFilters = () => {
  filterState = { search: '', category: 'all', sort: 'default' };
};

const getFilterState = () => ({ ...filterState });

/* ── Category buttons builder ───────────────────────────────────── */

/**
 * Dynamically generate category filter buttons from product data.
 * Category names come from the API — nothing is hardcoded.
 * @param {Array}    categories  — array of category strings
 * @param {Function} onSelect    — callback(categoryName)
 */
const buildCategoryButtons = (categories, onSelect) => {
  const container = document.getElementById('categoryFilters');
  if (!container) return;

  const allCategories = ['all', ...categories];

  container.innerHTML = allCategories
    .map((cat) => `
      <button
        class="filter-btn ${cat === filterState.category ? 'active' : ''}"
        data-category="${cat}"
      >${cat === 'all' ? 'All' : cat}</button>
    `)
    .join('');

  container.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setCategory(btn.dataset.category);
      updateActiveCategoryBtn(btn.dataset.category);
      onSelect();
    });
  });
};

/** Highlight the active category button */
const updateActiveCategoryBtn = (activeCategory) => {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.category === activeCategory);
  });
};

/* ── Product count display ──────────────────────────────────────── */

/**
 * Update the "Showing X of Y products" counter.
 * @param {number} showing  — count after filters
 * @param {number} total    — total product count from API
 */
const updateProductCount = (showing, total) => {
  const el = document.getElementById('productCount');
  if (!el) return;

  if (showing === total) {
    el.innerHTML = `Showing <strong>${total}</strong> products`;
  } else {
    el.innerHTML = `Showing <strong>${showing}</strong> of <strong>${total}</strong> products`;
  }
};