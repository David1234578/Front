import { products as seedProducts } from '../data/products';

const STORAGE_KEY = 'products';
const DEFAULT_RATING = 3;

const seedById = new Map(seedProducts.map((product) => [product.id, product]));

const clampRating = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_RATING;
  return Math.min(5, Math.max(1, parsed));
};

const normalizeProduct = (product) => {
  const seedProduct = seedById.get(product?.id);

  return {
    ...seedProduct,
    ...product,
    rating: clampRating(product?.rating ?? seedProduct?.rating ?? DEFAULT_RATING),
  };
};

const normalizeProducts = (products) => {
  if (!Array.isArray(products)) {
    return seedProducts;
  }

  return products.map(normalizeProduct);
};

export function loadProducts() {
  if (typeof window === 'undefined') {
    return seedProducts;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return seedProducts;
  }

  try {
    const parsed = JSON.parse(stored);
    return normalizeProducts(parsed);
  } catch {
    return seedProducts;
  }
}

export function saveProducts(products) {
  const normalizedProducts = normalizeProducts(products);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedProducts));
  }

  return normalizedProducts;
}

export const PRODUCTS_STORAGE_KEY = STORAGE_KEY;
export const PRODUCTS_DEFAULT_RATING = DEFAULT_RATING;
