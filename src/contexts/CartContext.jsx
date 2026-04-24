import { createContext, useMemo, useState } from 'react';

import cartService from '../services/cartService';

const CartContext = createContext(null);

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(cartService.getCartItems);

  const addToCart = (product) => {
    setCartItems((currentItems) => cartService.addToCart(product, currentItems));
  };

  const updateCartItemQuantity = (productId, nextQuantity) => {
    setCartItems((currentItems) =>
      cartService.updateCartItemQuantity(productId, nextQuantity, currentItems)
    );
  };

  const removeCartItem = (productId) => {
    setCartItems((currentItems) => cartService.removeCartItem(productId, currentItems));
  };

  const clearCart = () => {
    setCartItems(cartService.clearCart());
  };

  const cartItemCount = useMemo(() => cartService.getCartItemCount(cartItems), [cartItems]);

  const value = {
    addToCart,
    cartItemCount,
    cartItems,
    clearCart,
    removeCartItem,
    updateCartItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export { CartContext, CartProvider };
