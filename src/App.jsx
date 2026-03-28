import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useInRouterContext } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Cart from './page/Cart';
import CategoryProducts from './page/CategoryProducts';
import Checkout from './page/Checkout';
import Home from './page/Home';
import Login from './page/Login';
import MyAccount from './page/MyAccount';
import ProductList from './page/ProductList';
import Register from './page/Register';
import RecoverPassword from './page/RecoverPassword';
import { clearSession, loadSession } from './utils/authStorage';


import './App.css';

function AppContent() {
  const [user, setUser] = useState(() => loadSession());
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

  const handleSignOut = () => {
    setUser(clearSession());
  };

  const handleLoginSuccess = (session) => {
    setUser(session);
  };

  const handleProfileUpdated = (session) => {
    setUser(session);
  };

  const handleRegisterSuccess = (session) => {
    setUser(session);
  };

  return (
    <div className="app">
      <Header
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="main">
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
            }
          />
          <Route
            path="/recover-password"
            element={user ? <Navigate to="/" replace /> : <RecoverPassword />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register onRegisterSuccess={handleRegisterSuccess} />}
          />

          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute user={user} requiredRole="user">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute user={user} requiredRole="user">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/category/:categoryName"
            element={
              <ProtectedRoute user={user}>
                <CategoryProducts user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-account"
            element={
              <ProtectedRoute user={user}>
                <MyAccount user={user} onProfileUpdated={handleProfileUpdated} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute user={user} requiredRole="admin">
                <ProductList user={user} />
              </ProtectedRoute>
            }
          />
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