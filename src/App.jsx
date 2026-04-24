import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import AdminRoute from './components/AdminRoute';
import Footer from './components/Footer';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';
import useCart from './hooks/useCart';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import Cart from './pages/Cart';
import CategoryProducts from './pages/CategoryProducts';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import Login from './pages/Login';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderDetail from './pages/OrderDetail';
import ProductList from './pages/ProductList';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import UserOrders from './pages/UserOrders';
import UserProfile from './pages/UserProfile';
import orderService from './services/orderService';
import { calculateOrderTotals } from './utils/calculateOrderTotals';

import './App.css';

function App() {
  const { currentUser } = useAuth();
  const { cart, cartItemCount, cartItems, clearCart } = useCart();
  const [latestOrder, setLatestOrder] = useState(null);

  const handleCompleteCheckout = async ({
    billingAddress,
    customer,
    shippingAddress,
    billingAddressId,
    shippingAddressId,
  }) => {
    if (cartItems.length === 0) {
      return null;
    }

    const totals = calculateOrderTotals(cartItems);
    const order = await orderService.createOrderAsync({
      cartId: cart.id,
      userId: currentUser?.id ?? '',
      userEmail: currentUser?.email ?? customer.email,
      userFullName: currentUser?.fullName ?? customer.fullName,
      items: cartItems.map((item) => ({ ...item })),
      customer,
      shippingAddress,
      shippingAddressId,
      billingAddress,
      billingAddressId,
      totals,
    });

    setLatestOrder(order);
    await clearCart();
    return order;
  };

  const handleBackHomeAfterOrder = () => {
    setLatestOrder(null);
  };

  return (
    <div className="app">
      <Header user={currentUser} cartItemCount={cartItemCount} />

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/category/:categoryName" element={<CategoryProducts />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout onCompleteCheckout={handleCompleteCheckout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order-confirmation"
            element={
              <OrderConfirmation order={latestOrder} onBackHome={handleBackHomeAfterOrder} />
            }
          />
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
          <Route path="/access-denied" element={<Unauthorized />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
