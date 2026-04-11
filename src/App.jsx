import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';
import Cart from './pages/Cart';
import CategoryProducts from './pages/CategoryProducts';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Login from './pages/Login';
import OrderDetail from './pages/OrderDetail';
import ProductList from './pages/ProductList';
import Register from './pages/Register';
import RecoverPassword from './pages/RecoverPassword';
import UserOrders from './pages/UserOrders';
import UserProfile from './pages/UserProfile';

import './App.css';

function App() {
  const { currentUser } = useAuth();
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

  return (
    <div className="app">
      <Header user={currentUser} />

      <main className="main">
        <Routes>
          <Route
            path="/login"
            element={
              currentUser ? <Navigate to="/" replace /> : <Login />
            }
          />
          <Route
            path="/recover-password"
            element={currentUser ? <Navigate to="/" replace /> : <RecoverPassword />}
          />
          <Route
            path="/register"
            element={currentUser ? <Navigate to="/" replace /> : <Register />}
          />

          <Route path="/" element={<Home />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute requiredRole="user">
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute requiredRole="user">
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/category/:categoryName" element={<CategoryProducts user={currentUser} />} />

          <Route
            path="/user/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/orders"
            element={
              <ProtectedRoute>
                <UserOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            }
          />

          <Route path="/my-account" element={<Navigate to="/user/profile" replace />} />
          <Route
            path="/products"
            element={
              <ProtectedRoute requiredRole="admin">
                <ProductList user={currentUser} />
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

export default App;