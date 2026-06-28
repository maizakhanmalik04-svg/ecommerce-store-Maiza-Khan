# ⚡ ShopWave

> **A modern, fully client-side e-commerce storefront** built with vanilla HTML, CSS, and JavaScript. No frameworks. No build tools. Just clean, well-structured code.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [File Reference](#-file-reference)
- [Getting Started](#-getting-started)
- [Architecture](#-architecture)
- [UI Components](#-ui-components)
- [Data Flow](#-data-flow)
- [LocalStorage Keys](#-localstorage-keys)
- [External Dependencies](#-external-dependencies)
- [Browser Support](#-browser-support)

---

## 🌊 Overview

ShopWave is a single-page e-commerce demo that pulls live product data from [FakeStore API](https://fakestoreapi.com) and presents it in a polished, responsive storefront. It includes a working shopping cart, wishlist, product modals, category filters, search, sort, dark mode, and an order confirmation flow all without a single npm install.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛍️ **Product Grid** | Responsive card grid with lazy-loaded images and shimmer skeletons while loading |
| 🔍 **Live Search** | Debounced (300ms) title search — updates as you type |
| 🏷️ **Category Filters** | Dynamic filter buttons built from real API data |
| ↕️ **Sort** | Sort by price (low/high), rating, or name |
| 🛒 **Shopping Cart** | Slide-in drawer with quantity controls, subtotal, and checkout |
| ❤️ **Wishlist** | Save products to a wishlist modal; add to cart from there |
| 🔎 **Product Modal** | Full detail view with description, rating, and quantity selector |
| ✅ **Order Confirmation** | Checkout modal with itemised order summary |
| 🌙 **Dark Mode** | One-click theme toggle with `localStorage` persistence |
| 📱 **Responsive** | Mobile hamburger nav, fluid grid, and touch-friendly controls |
| 💾 **Persistence** | Cart and wishlist survive page refreshes via `localStorage` |
| ♿ **Accessibility** | ARIA labels, keyboard navigation (`Escape` closes modals), focus management |
| 🔄 **Load More** | Pagination — loads 8 products at a time with a "Load More" button |
| 💀 **Skeleton Screens** | Shimmer placeholder cards shown during the initial API fetch |
| 🔔 **Toast Notifications** | Non-blocking feedback messages for cart and wishlist actions |

---

## 📁 Project Structure

```
shopwave/
│
├── index.html              # App shell — all markup, modals, and drawer
│
├── css/
│   ├── style.css           # Main styles, layout, components, variables
│   ├── dark-mode.css       # Dark theme overrides (data-theme="dark")
│   └── skeleton.css        # Shimmer loading card styles
│
└── js/
    ├── api.js              # Fetch logic — FakeStore API calls
    ├── filters.js          # Search, category, sort state + pipeline
    ├── products.js         # Card rendering, wishlist, pagination
    ├── cart.js             # Cart state, persistence, checkout modal
    ├── ui.js               # Modals, dark mode toggle, toast, hamburger
    └── app.js              # Entry point — init, event binding, orchestration
```

> **Script load order matters.** `index.html` loads scripts in this sequence:
> `api.js` → `cart.js` → `filters.js` → `products.js` → `ui.js` → `app.js`

---

## 📄 File Reference

### `index.html`
The single HTML file that contains all structural markup. Key sections:

- **`<header>`** — Logo, desktop nav, theme toggle, wishlist/cart icon buttons, mobile hamburger
- **`.hero-section`** — Full-bleed hero banner with CTA buttons and trust badges
- **`.stats-band`** — Social proof strip (customers, products, rating, support)
- **`<main #products>`** — Search bar, sort dropdown, category filter buttons, product grid
- **`.reviews-section`** — Static customer review cards
- **`<footer>`** — Brand info, quick links, categories, contact, newsletter input
- **`#cartDrawer`** — Slide-in cart sidebar (populated by `cart.js`)
- **`#productModalOverlay`** — Product detail modal (populated by `ui.js`)
- **`#checkoutModalOverlay`** — Order confirmation modal (populated by `cart.js`)
- **`#wishlistModalOverlay`** — Wishlist modal (populated by `ui.js`)
- **`#toast`** — Toast notification element

---

### `css/style.css`
The main stylesheet. Uses **CSS custom properties** (design tokens) defined on `:root` for all colours, shadows, gradients, and typography. Key sections:

- `:root` — Full design token definition (light theme defaults)
- Layout utilities — `.container`, grid helpers
- Header & nav — `.header`, `.mobile-nav`
- Hero banner — `.hero-banner-new`, `.hb-*` utility classes
- Stats band — `.stats-band`
- Controls bar — `.search-wrap`, `.sort-select`, `.filter-btn`
- Product cards — `.product-card`, `.product-card__*`
- Cart drawer — `.cart-drawer`, `.cart-item`
- Modals — `.modal-overlay`, `.modal`, `.product-modal`, `.checkout-modal`, `.wishlist-modal`
- Reviews — `.reviews-section`, `.review-card`
- Footer — `.site-footer`, `.footer__*`
- Toast — `.toast`
- Buttons — `.btn`, `.btn--primary`, `.btn--ghost`, `.icon-btn`

---

### `css/dark-mode.css`
Overrides CSS variables and specific component styles when `<html data-theme="dark">` is set. Covers:

- All colour tokens (background, surface, border, text, primary)
- Gradient and shadow adjustments
- Header glass blur, skeleton shimmer tint, cart/modal backgrounds
- Footer dark gradients, newsletter input styles

---

### `css/skeleton.css`
Shimmer loading placeholder cards shown before the API responds. Uses a `::after` pseudo-element with a sliding `linear-gradient` animation (`@keyframes shimmer`) to create the shimmer effect.

Classes: `.skeleton-card`, `.skeleton-img`, `.skeleton-body`, `.skeleton-line`, `.skeleton-btn`, `.skeleton-shimmer`

---

### `js/api.js`

| Export | Description |
|---|---|
| `fetchProducts()` | `GET /products` — returns full product array or throws |
| `fetchProductById(id)` | `GET /products/:id` — returns single product or throws |
| `extractCategories(products)` | Deduplicates and sorts category strings from a product array |

---

### `js/filters.js`

Manages the three-dimensional filter state (`search`, `category`, `sort`) and exposes a pure pipeline function.

| Export | Description |
|---|---|
| `applyFilters(products, state)` | Runs category → search → sort pipeline; returns new array |
| `sortProducts(products, sortKey)` | Sorts by `price-asc`, `price-desc`, `rating-desc`, `name-asc`, or `default` |
| `setSearch(value)` | Updates search term in filter state |
| `setCategory(cat)` | Updates active category |
| `setSort(key)` | Updates sort key |
| `resetFilters()` | Resets all filter state to defaults |
| `getFilterState()` | Returns a shallow copy of current filter state |
| `buildCategoryButtons(categories, onSelect)` | Dynamically generates `<button>` elements in `#categoryFilters` |
| `updateActiveCategoryBtn(cat)` | Toggles `.active` class on filter buttons |
| `updateProductCount(showing, total)` | Updates the "Showing X of Y products" label |
| `debounce(fn, delay)` | Closure-based debounce utility used for search input |

---

### `js/products.js`

Handles all product rendering and wishlist state.

| Export | Description |
|---|---|
| `renderProducts(filtered)` | Renders visible products into `#productGrid`; shows empty state if none |
| `loadMoreProducts()` | Appends the next page of cards without a full re-render |
| `renderSkeletonCards(count)` | Inserts N shimmer skeleton cards while loading |
| `buildProductCardHTML(product)` | Returns HTML string for a single product card |
| `buildStarsHTML(rating)` | Returns 5-star icon HTML (full / half / empty) |
| `attachProductCardListeners()` | Wires click, keyboard, wishlist toggle, and add-to-cart on cards |
| `loadWishlist()` | Hydrates `wishlist[]` from `localStorage` |
| `saveWishlist()` | Persists `wishlist[]` to `localStorage` |
| `toggleWishlist(product)` | Adds or removes a product from the wishlist; updates badge and heart icon |
| `updateWishlistBadge()` | Syncs badge count on header wishlist buttons |
| `isWishlisted(productId)` | Returns `true` if a product is in the wishlist |
| `resetPagination()` | Resets `visibleCount` to `PAGE_SIZE` (8) |

**Constants:** `PAGE_SIZE = 8`, `WISHLIST_KEY = 'shopwave_wishlist'`

---

### `js/cart.js`

Full cart state management and checkout flow.

| Export | Description |
|---|---|
| `addToCart(product, quantity)` | Adds product or increments existing entry; saves and re-renders |
| `removeFromCart(productId)` | Removes item by ID; saves and re-renders |
| `updateQuantity(productId, delta)` | Increments/decrements qty (floor: 1); saves and re-renders |
| `clearCart()` | Empties cart; saves and re-renders |
| `loadCart()` | Hydrates `cart[]` from `localStorage` |
| `saveCart()` | Persists `cart[]` to `localStorage` |
| `getCartItemCount()` | Returns total item count (sum of quantities) |
| `getCartSubtotal()` | Returns subtotal as a number |
| `renderCart()` | Rebuilds `#cartBody` HTML and updates subtotal |
| `updateCartBadge()` | Syncs badge count on cart button |
| `showCheckoutModal()` | Builds order summary, clears cart, closes drawer, shows modal |
| `openCart()` | Opens `#cartDrawer` and overlay |
| `closeCart()` | Closes `#cartDrawer` and overlay |

**Constants:** `CART_KEY = 'shopwave_cart'`

---

### `js/ui.js`

UI orchestration — modals, theme, and notifications.

| Export | Description |
|---|---|
| `setAllProductsRef(products)` | Stores the master product array for modal lookups |
| `openProductModal(productId)` | Finds product, builds modal HTML, opens overlay |
| `closeProductModal()` | Closes product modal overlay |
| `buildProductModalHTML(product)` | Returns full modal HTML with image, description, qty controls |
| `attachModalListeners(product)` | Wires qty +/- buttons and "Add to Cart" in modal |
| `openWishlistModal()` | Builds and opens wishlist modal |
| `closeWishlistModal()` | Closes wishlist modal |
| `toggleTheme()` | Flips between `light` and `dark`; persists to `localStorage` |
| `applyTheme(theme)` | Sets `data-theme` on `<html>`, updates icon, saves preference |
| `syncThemeIcon()` | Syncs moon/sun icon on page load |
| `showToast(message, icon)` | Shows a brief notification; auto-dismisses after 2.5s |
| `toggleMobileNav()` | Opens/closes `#mobileNav` and swaps hamburger icon |

**Constants:** `THEME_KEY = 'theme'`

---

### `js/app.js`

The entry point. Runs on `DOMContentLoaded`.

**`init()` sequence:**
1. `loadCart()` + `loadWishlist()` — restore persisted state
2. `updateCartBadge()` + `updateWishlistBadge()` + `syncThemeIcon()` — sync UI
3. `renderSkeletonCards(6)` — show placeholders immediately
4. `bindEventListeners()` — wire all static DOM events
5. `fetchProducts()` — call the API
6. `buildCategoryButtons()` — generate filter tabs from live categories
7. `renderProducts()` — render initial unfiltered product grid

**`handleFilterChange()`** — called by search, category, and sort events. Resets pagination and re-runs the full filter pipeline.

---

## 🚀 Getting Started

No build step required. Just serve the files with any static server.

### VS Code Live Server
1. Open the project folder in VS Code
2. Install the **Live Server** extension
3. Right-click `index.html` → **Open with Live Server**


---

## 🧩 UI Components

### Product Card
Each card is an `<article>` with a product image, category badge, wishlist heart button, star rating, price, and "Add to Cart" button. Clicking the card body (excluding buttons) opens the product detail modal.

### Cart Drawer
A slide-in `<aside>` from the right. Contains a scrollable item list with quantity controls, a subtotal row, and a "Secure Checkout" button.

### Product Modal
A centred overlay showing the full product image, description, star rating, review count, price, and a quantity stepper before adding to cart.

### Checkout Modal
Appears after clicking "Secure Checkout". Shows an order summary with item images, quantities, and a grand total. Clears the cart on open.

### Wishlist Modal
Grid of wishlisted products with "Add to Cart" and "Remove" buttons per item.

### Toast
A small bar that slides up from the bottom of the screen for 2.5 seconds. Used for cart adds, wishlist changes, etc.


---

## 💾 LocalStorage Keys

| Key | Module | Value |
|---|---|---|
| `shopwave_cart` | `cart.js` | `JSON` array of `{ product, quantity }` objects |
| `shopwave_wishlist` | `products.js` | `JSON` array of product objects |
| `theme` | `ui.js` | `"light"` or `"dark"` |

---

## 📦 External Dependencies

All loaded via CDN — no `package.json` required.

| Dependency | Version | Purpose |
|---|---|---|
| [Font Awesome](https://fontawesome.com) | 6.5.0 | All icons throughout the UI |
| [Google Fonts — Playfair Display](https://fonts.google.com/specimen/Playfair+Display) | — | Editorial headings |
| [Google Fonts — DM Sans](https://fonts.google.com/specimen/DM+Sans) | — | Body and UI text |
| [Google Fonts — Syne](https://fonts.google.com/specimen/Syne) | — | Logo / accent text |
| [FakeStore API](https://fakestoreapi.com) | — | Product data source |

---

## loom video link

https://drive.google.com/file/d/1CLk2AzwQYNmPdpY6Q7_ZxJN_0L6ndXSQ/view?usp=drive_link

