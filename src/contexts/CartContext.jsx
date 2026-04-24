import { createContext, useEffect, useMemo, useState } from 'react';

import cartService from '../services/cartService';
import { CART_STORAGE_KEY, CART_UPDATED_EVENT } from '../utils/cartStorage';

const CartContext = createContext(null);
const EMPTY_CART_ITEMS = [];

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => cartService.getCart());
  const [cartError, setCartError] = useState('');
  const [isSyncingCart, setIsSyncingCart] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const syncCartFromStorage = () => {
      if (!isMounted) {
        return;
      }

      setCart(cartService.getCart());
    };

    const hydrateRemoteCart = async () => {
      setIsSyncingCart(true);

      try {
        const nextCart = await cartService.getCartAsync();

        if (isMounted) {
          setCart(nextCart);
          setCartError('');
        }
      } catch (error) {
        if (isMounted) {
          setCartError(
            error instanceof Error && error.message
              ? error.message
              : 'No fue posible sincronizar el carrito.'
          );
        }
      } finally {
        if (isMounted) {
          setIsSyncingCart(false);
        }
      }
    };

    const handleStorage = (event) => {
      if (!event.key || event.key === CART_STORAGE_KEY) {
        syncCartFromStorage();
      }
    };

    syncCartFromStorage();
    hydrateRemoteCart();
    window.addEventListener('storage', handleStorage);
    window.addEventListener(CART_UPDATED_EVENT, syncCartFromStorage);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(CART_UPDATED_EVENT, syncCartFromStorage);
    };
  }, []);

  const cartItems = cart.items ?? EMPTY_CART_ITEMS;

  const runCartAction = async (action) => {
    setIsSyncingCart(true);
    setCartError('');

    try {
      await action();
      setCart(cartService.getCart());
    } catch (error) {
      setCartError(
        error instanceof Error && error.message
          ? error.message
          : 'No fue posible actualizar el carrito.'
      );
    } finally {
      setIsSyncingCart(false);
    }
  };

  const addToCart = (product) => {
    return runCartAction(() => cartService.addToCartAsync(product, cartItems));
  };

  const updateCartItemQuantity = (productId, nextQuantity) => {
    return runCartAction(() =>
      cartService.updateCartItemQuantityAsync(productId, nextQuantity, cartItems)
    );
  };

  const removeCartItem = (productId) => {
    return runCartAction(() => cartService.removeCartItemAsync(productId, cartItems));
  };

  const clearCart = () => {
    return runCartAction(() => cartService.clearCartAsync());
  };

  const cartItemCount = useMemo(() => cartService.getCartItemCount(cartItems), [cartItems]);

  const refreshCart = () => runCartAction(() => cartService.getCartAsync());

  const value = {
    addToCart,
    cart,
    cartError,
    cartItemCount,
    cartItems,
    clearCart,
    isSyncingCart,
    removeCartItem,
    refreshCart,
    updateCartItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export { CartContext, CartProvider };
