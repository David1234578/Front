import { appConfig } from '../config';
import { loadSessionToken } from '../utils/authStorage';
import { loadCart, saveCart, saveCartItems } from '../utils/cartStorage';

import { requestJson } from './http';

const normalizeProductStock = (product) => {
  const parsedStock = Number(product?.productStock ?? product?.stockQty ?? product?.stock);
  return Number.isFinite(parsedStock) && parsedStock >= 0 ? parsedStock : 0;
};

const normalizeCartResponse = (payload) =>
  saveCart({
    ...payload,
    updatedAt: payload?.updatedAt ?? new Date().toISOString(),
  });

const buildLocalCart = (items, currentCart = loadCart()) =>
  saveCart({
    ...currentCart,
    updatedAt: new Date().toISOString(),
    items,
  });

function getCartItems() {
  return loadCart().items;
}

function getCart() {
  return loadCart();
}

function persistCartItems(items) {
  return saveCartItems(items).items;
}

function addToCart(product, currentItems = getCartItems()) {
  if (!product || !Number.isFinite(Number(product.id))) {
    return currentItems;
  }

  const normalizedId = Number(product.id);
  const stock = normalizeProductStock(product);
  const existingItem = currentItems.find((item) => item.id === normalizedId);
  const nextItemBase = {
    id: normalizedId,
    productId: normalizedId,
    sku: String(product?.sku ?? ''),
    name: product.name,
    category: product.categoryName ?? product.category,
    categoryName: product.categoryName ?? product.category,
    price: Number(product.price) || 0,
    unitPrice: Number(product.price) || 0,
    stock,
    stockQty: stock,
    productStock: stock,
    productAvailable: Boolean(product?.isAvailable ?? stock > 0),
    image: product.image,
    addedAt: new Date().toISOString(),
  };

  if (!existingItem) {
    return persistCartItems([
      ...currentItems,
      {
        ...nextItemBase,
        quantity: 1,
        lineTotal: Number(product.price) || 0,
      },
    ]);
  }

  return persistCartItems(
    currentItems.map((item) => {
      if (item.id !== normalizedId) {
        return item;
      }

      return {
        ...item,
        ...nextItemBase,
        stock,
        stockQty: stock,
        productStock: stock,
        quantity: Math.min(item.quantity + 1, Math.max(stock, 1)),
        lineTotal:
          (Number(item.unitPrice ?? item.price) || 0) *
          Math.min(item.quantity + 1, Math.max(stock, 1)),
      };
    })
  );
}

function updateCartItemQuantity(productId, nextQuantity, currentItems = getCartItems()) {
  return persistCartItems(
    currentItems.flatMap((item) => {
      if (item.id !== productId) {
        return [item];
      }

      const stock = Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? item.stock : 1;
      const normalizedQuantity = Math.max(
        1,
        Math.min(stock, Math.floor(Number(nextQuantity) || 1))
      );

      return normalizedQuantity > 0
        ? [
            {
              ...item,
              quantity: normalizedQuantity,
              lineTotal: (Number(item.unitPrice ?? item.price) || 0) * normalizedQuantity,
            },
          ]
        : [];
    })
  );
}

function removeCartItem(productId, currentItems = getCartItems()) {
  return persistCartItems(currentItems.filter((item) => item.id !== productId));
}

function clearCart() {
  return persistCartItems([]);
}

function getCartItemCount(currentItems = getCartItems()) {
  return currentItems.reduce((total, item) => total + item.quantity, 0);
}

async function getCartAsync() {
  if (!appConfig.useRemoteApi) {
    return getCart();
  }

  const token = loadSessionToken();
  const response = await requestJson('/cart/me', {
    method: 'GET',
    token,
  });

  return normalizeCartResponse(response);
}

async function addToCartAsync(product, currentItems = getCartItems()) {
  if (!appConfig.useRemoteApi) {
    return buildLocalCart(addToCart(product, currentItems)).items;
  }

  const token = loadSessionToken();
  const response = await requestJson('/cart/items', {
    method: 'POST',
    token,
    body: {
      productId: Number(product?.productId ?? product?.id),
      quantity: 1,
    },
  });

  return normalizeCartResponse(response).items;
}

async function updateCartItemQuantityAsync(productId, nextQuantity, currentItems = getCartItems()) {
  if (!appConfig.useRemoteApi) {
    return buildLocalCart(updateCartItemQuantity(productId, nextQuantity, currentItems)).items;
  }

  const token = loadSessionToken();
  const response = await requestJson(`/cart/items/${productId}`, {
    method: 'PATCH',
    token,
    body: {
      quantity: Math.max(1, Math.floor(Number(nextQuantity) || 1)),
    },
  });

  return normalizeCartResponse(response).items;
}

async function removeCartItemAsync(productId, currentItems = getCartItems()) {
  if (!appConfig.useRemoteApi) {
    return buildLocalCart(removeCartItem(productId, currentItems)).items;
  }

  const token = loadSessionToken();
  const response = await requestJson(`/cart/items/${productId}`, {
    method: 'DELETE',
    token,
  });

  return normalizeCartResponse(response).items;
}

async function clearCartAsync() {
  if (!appConfig.useRemoteApi) {
    return clearCart();
  }

  const token = loadSessionToken();
  await requestJson('/cart/items', {
    method: 'DELETE',
    token,
  });

  return saveCart({ ...loadCart(), items: [], updatedAt: new Date().toISOString() }).items;
}

const cartService = {
  addToCart,
  addToCartAsync,
  clearCart,
  clearCartAsync,
  getCart,
  getCartAsync,
  getCartItemCount,
  getCartItems,
  persistCartItems,
  removeCartItem,
  removeCartItemAsync,
  updateCartItemQuantity,
  updateCartItemQuantityAsync,
};

export { cartService };
export default cartService;
