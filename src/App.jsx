import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useInRouterContext } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import Cart from './page/Cart';
import CategoryProducts from './page/CategoryProducts';
import Checkout from './page/Checkout';
import Home from './page/Home';
import ProductList from './page/ProductList';


import './App.css';

function AppContent() {
  const [user, setUser] = useState(null);
  const [cartNotice, setCartNotice] = useState('');
  const cartToastTimeoutRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleItemAdded = (event) => {
      const name = String(event?.detail?.name ?? 'Producto');
      const quantity = Number(event?.detail?.quantity);
      const hasQuantity = Number.isFinite(quantity) && quantity > 1;
      const notice = hasQuantity
        ? `${name} agregado al carrito (${quantity})`
        : `${name} agregado al carrito`;

      setCartNotice(notice);

      if (cartToastTimeoutRef.current) {
        window.clearTimeout(cartToastTimeoutRef.current);
      }

      cartToastTimeoutRef.current = window.setTimeout(() => {
        setCartNotice('');
      }, 2200);
    };

    window.addEventListener('cart:item-added', handleItemAdded);

    return () => {
      window.removeEventListener('cart:item-added', handleItemAdded);

      if (cartToastTimeoutRef.current) {
        window.clearTimeout(cartToastTimeoutRef.current);
      }
    };
  }, []);

  const handleSignIn = () => {
    setUser({ name: 'Usuario' });
  };

  const handleSignOut = () => {
    setUser(null);
  };

  return (
    <div className="app">
      <Header
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/category/:categoryName" element={<CategoryProducts />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {cartNotice ? (
        <div className="cartToast" role="status" aria-live="polite">
          {cartNotice}
        </div>
      ) : null}

      <Footer />
    </div>
  );
}

function App() {
  const hasRouterContext = useInRouterContext();

  if (hasRouterContext) {
    return <AppContent />;
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;