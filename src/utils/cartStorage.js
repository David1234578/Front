const STORAGE_KEY = 'cart';
const ITEM_ADDED_EVENT = 'cart:item-added';

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toSafeQuantity = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
};

const normalizeCartItem = (item) => {
  const id = toFiniteNumber(item?.id, 0);
  const stock = Math.max(0, Math.floor(toFiniteNumber(item?.stock, 0)));
  const baseQuantity = toSafeQuantity(item?.quantity);
  const quantity = stock > 0 ? Math.min(stock, baseQuantity) : 1;

  return {
    id,
    name: String(item?.name ?? 'Producto'),
    category: String(item?.category ?? 'General'),
    image: String(item?.image ?? ''),
    price: Math.max(0, toFiniteNumber(item?.price, 0)),
    stock,
    quantity,
  };
};

const emitCartChange = () => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('cart:changed'));
};

const emitItemAdded = (detail) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ITEM_ADDED_EVENT, { detail }));
};

export function loadCart() {
  if (typeof window === 'undefined') return [];

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(normalizeCartItem)
      .filter((item) => Number.isFinite(item.id) && item.id > 0);
  } catch {
    return [];
  }
}

export function saveCart(items) {
  if (typeof window === 'undefined') return [];

  const normalized = Array.isArray(items)
    ? items
        .map(normalizeCartItem)
        .filter((item) => Number.isFinite(item.id) && item.id > 0)
    : [];

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  emitCartChange();

  return normalized;
}

export function addToCart(product, quantity = 1) {
  const productId = toFiniteNumber(product?.id, 0);
  if (productId <= 0) return loadCart();

  const requestedQuantity = toSafeQuantity(quantity);
  const safeProduct = normalizeCartItem({ ...product, quantity });
  const current = loadCart();
  const index = current.findIndex((item) => item.id === productId);

  if (index === -1) {
    const nextCart = saveCart([...current, safeProduct]);
    emitItemAdded({
      name: safeProduct.name,
      quantity: safeProduct.quantity,
      added: true,
    });
    return nextCart;
  }

  const existing = current[index];
  const stockLimit = safeProduct.stock > 0 ? safeProduct.stock : existing.stock;
  const nextQuantityRaw = existing.quantity + toSafeQuantity(quantity);
  const nextQuantity = stockLimit > 0 ? Math.min(stockLimit, nextQuantityRaw) : nextQuantityRaw;

  const updated = [...current];
  updated[index] = {
    ...existing,
    ...safeProduct,
    quantity: nextQuantity,
  };

  const addedQuantity = Math.max(0, nextQuantity - existing.quantity);
  const nextCart = saveCart(updated);
  emitItemAdded({
    name: safeProduct.name,
    quantity: addedQuantity > 0 ? addedQuantity : requestedQuantity,
    added: addedQuantity > 0,
  });

  return nextCart;
}

export function updateCartItemQuantity(productId, quantity) {
  const id = toFiniteNumber(productId, 0);
  if (id <= 0) return loadCart();

  const current = loadCart();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return current;

  if (quantity <= 0) {
    return removeFromCart(id);
  }

  const item = current[index];
  const stockLimit = item.stock > 0 ? item.stock : Number.POSITIVE_INFINITY;
  const nextQuantity = Math.min(stockLimit, toSafeQuantity(quantity));

  const updated = [...current];
  updated[index] = {
    ...item,
    quantity: nextQuantity,
  };

  return saveCart(updated);
}

export function removeFromCart(productId) {
  const id = toFiniteNumber(productId, 0);
  if (id <= 0) return loadCart();

  const current = loadCart();
  const updated = current.filter((item) => item.id !== id);
  return saveCart(updated);
}

export function clearCart() {
  return saveCart([]);
}

export const CART_STORAGE_KEY = STORAGE_KEY;
