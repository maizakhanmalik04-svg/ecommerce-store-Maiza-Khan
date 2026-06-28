/**
 * api.js — All fetch/network logic
 * Responsible for: fetching products from FakeStoreAPI, error handling
 */

const API_URL = 'https://fakestoreapi.com/products';

/**
 * Fetch all products from the API.
 * Returns an array of product objects on success.
 * Throws an Error on failure so callers can handle it.
 */
const fetchProducts = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};

/**
 * Fetch a single product by ID (used if needed).
 */
const fetchProductById = async (id) => {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error(`Product ${id} not found: ${response.status}`);
  }

  return await response.json();
};

/**
 * Extract unique category names from a products array.
 * Uses Set to deduplicate, returns sorted array.
 */
const extractCategories = (products) =>
  [...new Set(products.map((p) => p.category))].sort();