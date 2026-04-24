import { useEffect, useMemo, useState } from 'react';

import Footer from './components/Footer';
import Header from './components/Header';
import Cart from './pages/Cart';
import CategoryProducts from './pages/CategoryProducts';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import { CART_STORAGE_KEY, loadCartItems } from './utils/cartStorage';

import './App.css';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItems, setCartItems] = useState(loadCartItems);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const handleNavigate = (page) => {
    setActivePage(page);

    if (page !== 'category') {
      setSelectedCategory(null);
    }
  };

  const handleOpenCategory = (category) => {
    setSelectedCategory(category);
    setActivePage('category');
  };

  const handleBackFromCategory = () => {
    setSelectedCategory(null);
    setActivePage('home');
  };

  const handleAddToCart = (product) => {
    if (!product || !Number.isFinite(Number(product.id))) {
      return;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);
      const stock =
        Number.isFinite(Number(product.stock)) && Number(product.stock) > 0
          ? Number(product.stock)
          : 1;

      if (!existingItem) {
        return [
          ...currentItems,
          {
            id: Number(product.id),
            name: product.name,
            category: product.category,
            price: Number(product.price) || 0,
            stock,
            image: product.image,
            quantity: 1,
          },
        ];
      }

      return currentItems.map((item) => {
        if (item.id !== product.id) {
          return item;
        }

        return {
          ...item,
          stock,
          quantity: Math.min(item.quantity + 1, stock),
        };
      });
    });
  };

  const handleUpdateCartItemQuantity = (productId, nextQuantity) => {
    setCartItems((currentItems) =>
      currentItems.flatMap((item) => {
        if (item.id !== productId) {
          return [item];
        }

        const stock =
          Number.isFinite(Number(item.stock)) && Number(item.stock) > 0 ? Number(item.stock) : 1;
        const normalizedQuantity = Math.max(
          1,
          Math.min(stock, Math.floor(Number(nextQuantity) || 1))
        );

        return normalizedQuantity > 0 ? [{ ...item, quantity: normalizedQuantity }] : [];
      })
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const page = useMemo(() => {
    if (activePage === 'category') {
      return (
        <CategoryProducts
          category={selectedCategory}
          onBack={handleBackFromCategory}
          cartItems={cartItems}
          onAddToCart={handleAddToCart}
        />
      );
    }
    if (activePage === 'products') return <ProductList />;
    if (activePage === 'cart') {
      return (
        <Cart
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateCartItemQuantity}
          onRemoveItem={handleRemoveCartItem}
          onClearCart={handleClearCart}
          onContinueShopping={() => setActivePage('home')}
        />
      );
    }

    return <Home onOpenCategory={handleOpenCategory} />;
  }, [activePage, cartItems, selectedCategory]);

  const handleSignIn = () => {
    setUser({ name: 'Usuario' });
  };

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <div className="app">
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        cartItemCount={cartItemCount}
      />

      <main className="main">{page}</main>

      <Footer />
    </div>
  );
}

export default App;
