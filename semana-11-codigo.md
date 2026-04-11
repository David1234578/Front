# Semana 11 - Codigo

Referencia git:

1. base: `semana-10`
2. objetivo: `semana-11`

Este archivo asume lectura previa de la guia principal de la semana correspondiente.
Muestra solo archivos nuevos o actualizados con codigo o configuracion util para implementar la semana.

## Alcance

Autenticacion local con contexto, login, register y rutas protegidas.

## Archivos nuevos

1. `src/components/ProtectedRoute.jsx`
2. `src/contexts/AuthContext.jsx`
3. `src/hooks/useAuth.js`
4. `src/pages/Login.jsx`
5. `src/pages/Register.jsx`
6. `src/styles/AuthPage.module.css`
7. `src/utils/authStorage.js`

## Archivos actualizados

1. `src/App.jsx`
2. `src/components/Header.jsx`
3. `src/components/Navbar.jsx`
4. `src/main.jsx`
5. `src/pages/Checkout.jsx`
6. `src/pages/OrderDetail.jsx`
7. `src/pages/UserOrders.jsx`
8. `src/pages/UserProfile.jsx`
9. `src/styles/Navbar.module.css`
10. `src/utils/ordersStorage.js`

## Archivos nuevos

### src/components/ProtectedRoute.jsx

Archivo nuevo de esta semana:

```jsx
import { Navigate, useLocation } from 'react-router-dom';

import useAuth from '../hooks/useAuth';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;

```

### src/contexts/AuthContext.jsx

Archivo nuevo de esta semana:

```jsx
import { createContext, useMemo, useState } from 'react';

import {
  clearSessionUser,
  createUser,
  findUserByEmail,
  loadSessionUser,
  saveSessionUser,
} from '../utils/authStorage';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSessionUser);

  const register = ({ name, email, password }) => {
    const normalizedEmail = String(email ?? '')
      .trim()
      .toLowerCase();

    if (!name?.trim()) {
      return { ok: false, error: 'Ingresa un nombre para crear la cuenta.' };
    }

    if (!normalizedEmail) {
      return { ok: false, error: 'Ingresa un correo electrónico válido.' };
    }

    if (!password || password.length < 6) {
      return { ok: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    if (findUserByEmail(normalizedEmail)) {
      return { ok: false, error: 'Ya existe una cuenta registrada con ese correo.' };
    }

    const user = createUser({ name: name.trim(), email: normalizedEmail, password });
    saveSessionUser(user);
    setCurrentUser(user);

    return { ok: true, user };
  };

  const login = ({ email, password }) => {
    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
      return { ok: false, error: 'Credenciales inválidas. Verifica correo y contraseña.' };
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
    };

    saveSessionUser(sessionUser);
    setCurrentUser(sessionUser);

    return { ok: true, user: sessionUser };
  };

  const logout = () => {
    clearSessionUser();
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      logout,
      register,
    }),
    [currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };

```

### src/hooks/useAuth.js

Archivo nuevo de esta semana:

```javascript
import { useContext } from 'react';

import { AuthContext } from '../contexts/AuthContext';

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}

export default useAuth;

```

### src/pages/Login.jsx

Archivo nuevo de esta semana:

```jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/AuthPage.module.css';

function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = login({
      email: values.email.trim(),
      password: values.password,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    const nextPath = location.state?.from || '/user/profile';
    navigate(nextPath, { replace: true });
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Semana 11</p>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>
          Accede a tu cuenta para proteger el checkout y consultar un historial propio de órdenes.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Correo electrónico</span>
            <input
              className={styles.input}
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="correo@dominio.com"
              type="email"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <input
              className={styles.input}
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              type="password"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.primaryButton}>
            Ingresar
          </button>
        </form>

        <p className={styles.helperText}>
          ¿Todavía no tienes cuenta? <Link to="/register">Regístrate aquí</Link>.
        </p>
      </div>
    </section>
  );
}

export default Login;

```

### src/pages/Register.jsx

Archivo nuevo de esta semana:

```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/AuthPage.module.css';

function Register() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (values.password !== values.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const result = register({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate('/user/profile', { replace: true });
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Semana 11</p>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>
          Registra un usuario local para mantener sesión, proteger rutas y asociar compras a tu
          perfil.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Nombre</span>
            <input
              className={styles.input}
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Ejemplo: Ana Gómez"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Correo electrónico</span>
            <input
              className={styles.input}
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="correo@dominio.com"
              type="email"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <input
              className={styles.input}
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              type="password"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Confirmar contraseña</span>
            <input
              className={styles.input}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              type="password"
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button type="submit" className={styles.primaryButton}>
            Crear cuenta
          </button>
        </form>

        <p className={styles.helperText}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>.
        </p>
      </div>
    </section>
  );
}

export default Register;

```

### src/styles/AuthPage.module.css

Archivo nuevo de esta semana:

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.card {
  width: min(100%, 520px);
  margin: 0 auto;
  padding: 2rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 18px 50px rgba(22, 30, 84, 0.16);
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: var(--primary-dark);
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.title {
  margin: 0;
  color: var(--gray-900);
  font-size: 2rem;
  font-weight: 900;
}

.subtitle {
  margin: 0.65rem 0 0;
  color: var(--gray-500);
  font-weight: 700;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.label {
  color: var(--gray-900);
  font-weight: 800;
}

.input {
  border: 1px solid var(--gray-200);
  border-radius: 10px;
  padding: 0.8rem 0.9rem;
  outline: none;
  color: var(--gray-900);
}

.input:focus {
  border-color: var(--primary);
}

.error {
  margin: 0;
  color: var(--danger);
  font-size: 0.9rem;
  font-weight: 700;
}

.primaryButton {
  border: none;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  background: var(--primary);
  color: white;
  font-weight: 900;
  cursor: pointer;
}

.primaryButton:hover {
  background: var(--primary-dark);
}

.helperText {
  margin: 1rem 0 0;
  color: var(--gray-500);
  font-weight: 700;
}

.helperText a {
  color: var(--primary-dark);
  text-decoration: none;
}

.helperText a:hover {
  text-decoration: underline;
}

@media (max-width: 720px) {
  .card {
    padding: 1.5rem;
  }
}
```

### src/utils/authStorage.js

Archivo nuevo de esta semana:

```javascript
const USERS_STORAGE_KEY = 'authUsers';
const SESSION_STORAGE_KEY = 'authSession';

const normalizeUser = (user) => ({
  id: String(user?.id ?? ''),
  name: String(user?.name ?? '').trim(),
  email: String(user?.email ?? '')
    .trim()
    .toLowerCase(),
  password: String(user?.password ?? ''),
  phone: String(user?.phone ?? '').trim(),
  address: String(user?.address ?? '').trim(),
  city: String(user?.city ?? '').trim(),
  postalCode: String(user?.postalCode ?? '').trim(),
});

const sanitizeSessionUser = (user) => {
  const normalizedUser = normalizeUser(user);

  if (!normalizedUser.id || !normalizedUser.email) {
    return null;
  }

  return {
    id: normalizedUser.id,
    name: normalizedUser.name,
    email: normalizedUser.email,
    phone: normalizedUser.phone,
    address: normalizedUser.address,
    city: normalizedUser.city,
    postalCode: normalizedUser.postalCode,
  };
};

const readStorageArray = (storageKey) => {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function loadUsers() {
  return readStorageArray(USERS_STORAGE_KEY)
    .map(normalizeUser)
    .filter((user) => user.id && user.name && user.email && user.password);
}

export function saveUsers(users) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedUsers = Array.isArray(users) ? users.map(normalizeUser) : [];
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(normalizedUsers));
}

export function findUserByEmail(email) {
  const normalizedEmail = String(email ?? '')
    .trim()
    .toLowerCase();
  return loadUsers().find((user) => user.email === normalizedEmail) ?? null;
}

export function createUser(userData) {
  const nextUser = normalizeUser({
    ...userData,
    id: `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  });
  const currentUsers = loadUsers();

  saveUsers([...currentUsers, nextUser]);

  return sanitizeSessionUser(nextUser);
}

export function updateUser(userId, updates) {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    return null;
  }

  let updatedSessionUser = null;
  const nextUsers = loadUsers().map((user) => {
    if (user.id !== normalizedUserId) {
      return user;
    }

    const updatedUser = normalizeUser({ ...user, ...updates, id: user.id });
    updatedSessionUser = sanitizeSessionUser(updatedUser);
    return updatedUser;
  });

  saveUsers(nextUsers);

  if (updatedSessionUser) {
    saveSessionUser(updatedSessionUser);
  }

  return updatedSessionUser;
}

export function loadSessionUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return sanitizeSessionUser(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function saveSessionUser(user) {
  if (typeof window === 'undefined') {
    return;
  }

  const sanitizedUser = sanitizeSessionUser(user);

  if (!sanitizedUser) {
    clearSessionUser();
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sanitizedUser));
}

export function clearSessionUser() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export { SESSION_STORAGE_KEY, USERS_STORAGE_KEY };

```

## Archivos actualizados

### src/App.jsx

Contenido final del archivo en esta semana:

```jsx
import { useEffect, useMemo, useState } from 'react';
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
import OrderConfirmation from './pages/OrderConfirmation';
import OrderDetail from './pages/OrderDetail';
import ProductList from './pages/ProductList';
import Register from './pages/Register';
import UserOrders from './pages/UserOrders';
import UserProfile from './pages/UserProfile';
import {
  calculateOrderTotals,
  getPaymentMethodById,
  getShippingOptionById,
} from './utils/calculateOrderTotals';
import { CART_STORAGE_KEY, loadCartItems } from './utils/cartStorage';
import { saveOrder } from './utils/ordersStorage';

import './App.css';

function App() {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState(loadCartItems);
  const [latestOrder, setLatestOrder] = useState(null);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

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

  const handleCompleteCheckout = ({ customer, shippingMethodId, paymentMethodId }) => {
    if (cartItems.length === 0) {
      return null;
    }

    const totals = calculateOrderTotals(cartItems, shippingMethodId);
    const order = {
      id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser?.id ?? '',
      createdAt: new Date().toISOString(),
      items: cartItems.map((item) => ({ ...item })),
      customer,
      shippingMethod: getShippingOptionById(shippingMethodId),
      paymentMethod: getPaymentMethodById(paymentMethodId),
      totals,
    };

    saveOrder(order);
    setLatestOrder(order);
    setCartItems([]);
    return order;
  };

  const handleBackHomeAfterOrder = () => {
    setLatestOrder(null);
  };

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  return (
    <div className="app">
      <Header user={currentUser} cartItemCount={cartItemCount} />

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/category/:categoryName"
            element={<CategoryProducts cartItems={cartItems} onAddToCart={handleAddToCart} />}
          />
          <Route path="/products" element={<ProductList />} />
          <Route
            path="/cart"
            element={
              <Cart
                cartItems={cartItems}
                onUpdateQuantity={handleUpdateCartItemQuantity}
                onRemoveItem={handleRemoveCartItem}
                onClearCart={handleClearCart}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout
                  cartItems={cartItems}
                  user={currentUser}
                  onCompleteCheckout={handleCompleteCheckout}
                />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;

```

### src/components/Header.jsx

Contenido final del archivo en esta semana:

```jsx
import styles from '../styles/Header.module.css';

import Navbar from './Navbar';

function Header({ user, onSignOut, cartItemCount }) {
  return (
    <header className={styles.header}>
      <Navbar user={user} onSignOut={onSignOut} cartItemCount={cartItemCount} />
    </header>
  );
}

export default Header;

```

### src/components/Navbar.jsx

Contenido final del archivo en esta semana:

```jsx
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import logo from '../assets/img-logos/logo-Cesde-2023.svg';
import useAuth from '../hooks/useAuth';
import styles from '../styles/Navbar.module.css';

function Navbar({ user, onSignOut, cartItemCount = 0 }) {
  const userLabel = user?.name ?? 'Invitado';
  const isLoggedIn = Boolean(user);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const isHomeActive = location.pathname === '/' || location.pathname.startsWith('/category/');
  const isCartActive =
    location.pathname === '/cart' ||
    location.pathname === '/checkout' ||
    location.pathname === '/order-confirmation';
  const isAccountActive =
    location.pathname.startsWith('/user/') ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  const handleAccountNavigation = () => {
    navigate(isLoggedIn ? '/user/profile' : '/login');
  };

  const handleSignOut = () => {
    logout();
    onSignOut?.();
    navigate('/', { replace: true });
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <img className={styles.logo} src={logo} alt="Logo" />
        <span className={styles.brandName}>Sistema Ventas</span>
      </div>

      <div className={styles.links}>
        <NavLink to="/" end className={() => `${styles.link} ${isHomeActive ? styles.active : ''}`}>
          Inicio
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
        >
          Productos
        </NavLink>
        <NavLink to="/cart" className={() => `${styles.link} ${isCartActive ? styles.active : ''}`}>
          Carrito
          {cartItemCount > 0 ? <span className={styles.cartBadge}>{cartItemCount}</span> : null}
        </NavLink>
        <button
          type="button"
          className={`${styles.link} ${isAccountActive ? styles.active : ''}`}
          onClick={handleAccountNavigation}
        >
          Mi cuenta
        </button>
      </div>

      <div className={styles.auth}>
        <span className={styles.userName}>{userLabel}</span>

        {isLoggedIn ? (
          <button type="button" className={styles.authBtn} onClick={handleSignOut}>
            Salir
          </button>
        ) : (
          <div className={styles.guestActions}>
            <button type="button" className={styles.authBtn} onClick={() => navigate('/login')}>
              Ingresar
            </button>
            <button
              type="button"
              className={styles.secondaryAuthBtn}
              onClick={() => navigate('/register')}
            >
              Registrarse
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

```

### src/main.jsx

Contenido final del archivo en esta semana:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);

```

### src/pages/Checkout.jsx

Contenido final del archivo en esta semana:

```jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles/Checkout.module.css';
import {
  calculateOrderTotals,
  PAYMENT_METHODS,
  SHIPPING_OPTIONS,
} from '../utils/calculateOrderTotals';
import { formatCOP } from '../utils/formatCOP';

const EMAIL_REGEX = /^[^@]+@[^@]+\.[^@]+$/;

function Checkout({ cartItems, user, onCompleteCheckout }) {
  const [values, setValues] = useState({
    fullName: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    postalCode: user?.postalCode ?? '',
    shippingMethod: SHIPPING_OPTIONS[0].id,
    paymentMethod: PAYMENT_METHODS[0].id,
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setValues((currentValues) => ({
      ...currentValues,
      fullName: user?.name ?? currentValues.fullName,
      email: user?.email ?? currentValues.email,
      phone: user?.phone ?? currentValues.phone,
      address: user?.address ?? currentValues.address,
      city: user?.city ?? currentValues.city,
      postalCode: user?.postalCode ?? currentValues.postalCode,
    }));
  }, [user]);

  const totals = useMemo(
    () => calculateOrderTotals(cartItems, values.shippingMethod),
    [cartItems, values.shippingMethod]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
  };

  const validateValues = () => {
    const nextErrors = {};

    if (!values.fullName.trim()) nextErrors.fullName = 'Ingresa el nombre completo.';
    if (!values.email.trim()) nextErrors.email = 'Ingresa un correo electrónico.';
    if (values.email.trim() && !EMAIL_REGEX.test(values.email.trim())) {
      nextErrors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!values.phone.trim()) nextErrors.phone = 'Ingresa un número de contacto.';
    if (!values.address.trim()) nextErrors.address = 'Ingresa la dirección de entrega.';
    if (!values.city.trim()) nextErrors.city = 'Ingresa la ciudad.';
    if (!values.postalCode.trim()) nextErrors.postalCode = 'Ingresa el código postal.';
    if (!values.shippingMethod) nextErrors.shippingMethod = 'Selecciona un método de envío.';
    if (!values.paymentMethod) nextErrors.paymentMethod = 'Selecciona un método de pago.';

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateValues();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const order = onCompleteCheckout({
      customer: {
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address.trim(),
        city: values.city.trim(),
        postalCode: values.postalCode.trim(),
      },
      shippingMethodId: values.shippingMethod,
      paymentMethodId: values.paymentMethod,
    });

    if (order) {
      navigate('/order-confirmation');
    } else {
      navigate('/cart');
    }
  };

  if (cartItems.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.emptyText}>
            No hay productos en el carrito. Regresa para agregar artículos antes de continuar.
          </p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/cart')}
          >
            Volver al carrito
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 08</p>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.subtitle}>
            Completa los datos de entrega y confirma el pedido con un flujo de compra funcional.
          </p>
        </div>

        <button type="button" className={styles.secondaryButton} onClick={() => navigate('/cart')}>
          Volver al carrito
        </button>
      </header>

      <div className={styles.layout}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Datos del cliente</h2>

            <div className={styles.fieldGrid}>
              <label className={styles.field}>
                <span className={styles.label}>Nombre completo</span>
                <input
                  className={styles.input}
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  placeholder="Ejemplo: Ana Gómez"
                />
                {errors.fullName ? <span className={styles.error}>{errors.fullName}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Correo electrónico</span>
                <input
                  className={styles.input}
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="correo@dominio.com"
                  type="email"
                />
                {errors.email ? <span className={styles.error}>{errors.email}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Teléfono</span>
                <input
                  className={styles.input}
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  placeholder="3001234567"
                />
                {errors.phone ? <span className={styles.error}>{errors.phone}</span> : null}
              </label>

              <label className={`${styles.field} ${styles.fieldWide}`}>
                <span className={styles.label}>Dirección</span>
                <input
                  className={styles.input}
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  placeholder="Calle 10 # 20-30"
                />
                {errors.address ? <span className={styles.error}>{errors.address}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Ciudad</span>
                <input
                  className={styles.input}
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  placeholder="Medellín"
                />
                {errors.city ? <span className={styles.error}>{errors.city}</span> : null}
              </label>

              <label className={styles.field}>
                <span className={styles.label}>Código postal</span>
                <input
                  className={styles.input}
                  name="postalCode"
                  value={values.postalCode}
                  onChange={handleChange}
                  placeholder="050021"
                />
                {errors.postalCode ? (
                  <span className={styles.error}>{errors.postalCode}</span>
                ) : null}
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Método de envío</h2>
            <div className={styles.optionList}>
              {SHIPPING_OPTIONS.map((option) => (
                <label key={option.id} className={styles.optionCard}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={option.id}
                    checked={values.shippingMethod === option.id}
                    onChange={handleChange}
                  />
                  <div>
                    <span className={styles.optionTitle}>{option.label}</span>
                    <p className={styles.optionDescription}>{option.description}</p>
                  </div>
                  <strong className={styles.optionPrice}>{formatCOP(option.price)}</strong>
                </label>
              ))}
            </div>
            {errors.shippingMethod ? (
              <span className={styles.error}>{errors.shippingMethod}</span>
            ) : null}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Método de pago</h2>
            <div className={styles.optionList}>
              {PAYMENT_METHODS.map((option) => (
                <label key={option.id} className={styles.optionCard}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={option.id}
                    checked={values.paymentMethod === option.id}
                    onChange={handleChange}
                  />
                  <div>
                    <span className={styles.optionTitle}>{option.label}</span>
                    <p className={styles.optionDescription}>{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.paymentMethod ? (
              <span className={styles.error}>{errors.paymentMethod}</span>
            ) : null}
          </section>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/cart')}
            >
              Volver
            </button>
            <button type="submit" className={styles.primaryButton}>
              Confirmar compra
            </button>
          </div>
        </form>

        <aside className={styles.summaryCard}>
          <h2 className={styles.sectionTitle}>Resumen del pedido</h2>

          <div className={styles.summaryList}>
            {cartItems.map((item) => (
              <article key={item.id} className={styles.summaryItem}>
                <img className={styles.summaryImage} src={item.image} alt={item.name} />
                <div>
                  <h3 className={styles.summaryName}>{item.name}</h3>
                  <p className={styles.summaryMeta}>
                    {item.quantity} x {formatCOP(item.price)}
                  </p>
                </div>
                <strong className={styles.summaryPrice}>
                  {formatCOP(item.price * item.quantity)}
                </strong>
              </article>
            ))}
          </div>

          <div className={styles.totalRows}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{formatCOP(totals.subtotal)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>IVA (19%)</span>
              <strong>{formatCOP(totals.tax)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>{totals.shippingOption.label}</span>
              <strong>{formatCOP(totals.shipping)}</strong>
            </div>
            <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
              <span>Total</span>
              <strong>{formatCOP(totals.total)}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;

```

### src/pages/OrderDetail.jsx

Contenido final del archivo en esta semana:

```jsx
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/OrderDetail.module.css';
import { formatCOP } from '../utils/formatCOP';
import { loadOrdersByUserId } from '../utils/ordersStorage';

function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { currentUser } = useAuth();

  const order = useMemo(
    () =>
      loadOrdersByUserId(currentUser?.id).find((savedOrder) => savedOrder.id === orderId) ?? null,
    [currentUser?.id, orderId]
  );

  if (!order) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.eyebrow}>Semana 11</p>
          <h1 className={styles.title}>Orden no encontrada</h1>
          <p className={styles.subtitle}>
            El identificador solicitado no pertenece al usuario autenticado o ya no está disponible
            en este navegador.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/user/orders')}
            >
              Volver al historial
            </button>
            <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
              Ir al inicio
            </button>
          </div>
        </div>
      </section>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 11</p>
          <h1 className={styles.title}>Detalle de orden</h1>
          <p className={styles.subtitle}>
            Consulta el pedido completo, con los datos del cliente, envio, pago y totales.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/orders')}
          >
            Volver al historial
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/user/profile')}
          >
            Mi perfil
          </button>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.label}>Orden</span>
          <strong>{order.id}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.label}>Fecha</span>
          <strong>{formattedDate}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.label}>Envio</span>
          <strong>{order.shippingMethod.label}</strong>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.label}>Pago</span>
          <strong>{order.paymentMethod.label}</strong>
        </div>
      </div>

      <div className={styles.layout}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Cliente</h2>
          <div className={styles.infoList}>
            <p>
              <strong>{order.customer.fullName}</strong>
            </p>
            <p>{order.customer.email}</p>
            <p>{order.customer.phone}</p>
            <p>{order.customer.address}</p>
            <p>
              {order.customer.city} - {order.customer.postalCode}
            </p>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Totales</h2>
          <div className={styles.totalRows}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{formatCOP(order.totals.subtotal)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>IVA</span>
              <strong>{formatCOP(order.totals.tax)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>Envio</span>
              <strong>{formatCOP(order.totals.shipping)}</strong>
            </div>
            <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
              <span>Total</span>
              <strong>{formatCOP(order.totals.total)}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>Productos</h2>
        <div className={styles.itemList}>
          {order.items.map((item) => (
            <article key={`${order.id}-${item.id}`} className={styles.item}>
              <img className={styles.itemImage} src={item.image} alt={item.name} />
              <div className={styles.itemContent}>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemMeta}>Categoria: {item.category}</p>
                <p className={styles.itemMeta}>Cantidad: {item.quantity}</p>
              </div>
              <strong className={styles.itemPrice}>{formatCOP(item.price * item.quantity)}</strong>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default OrderDetail;

```

### src/pages/UserOrders.jsx

Contenido final del archivo en esta semana:

```jsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import OrderCard from '../components/OrderCard';
import useAuth from '../hooks/useAuth';
import styles from '../styles/UserOrders.module.css';
import { loadOrdersByUserId } from '../utils/ordersStorage';

function UserOrders() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const orders = useMemo(
    () =>
      loadOrdersByUserId(currentUser?.id).sort(
        (leftOrder, rightOrder) => new Date(rightOrder.createdAt) - new Date(leftOrder.createdAt)
      ),
    [currentUser?.id]
  );

  if (orders.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.eyebrow}>Semana 11</p>
          <h1 className={styles.title}>Mis ordenes</h1>
          <p className={styles.subtitle}>
            Todavía no hay compras asociadas a tu sesión. Completa el checkout autenticado para
            poblar esta vista.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/user/profile')}
            >
              Ir al perfil
            </button>
            <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
              Explorar productos
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 11</p>
          <h1 className={styles.title}>Historial de ordenes</h1>
          <p className={styles.subtitle}>
            Recupera únicamente las compras del usuario autenticado y navega al detalle de cada
            pedido.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/profile')}
          >
            Mi perfil
          </button>
          <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </header>

      <div className={styles.list}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onOpen={(orderId) => navigate(`/user/orders/${orderId}`)}
          />
        ))}
      </div>
    </section>
  );
}

export default UserOrders;

```

### src/pages/UserProfile.jsx

Contenido final del archivo en esta semana:

```jsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/UserProfile.module.css';
import { formatCOP } from '../utils/formatCOP';
import { loadOrdersByUserId } from '../utils/ordersStorage';

function UserProfile() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const orders = useMemo(() => loadOrdersByUserId(currentUser?.id), [currentUser?.id]);
  const latestOrder = orders[0] ?? null;

  const profile = {
    name: currentUser?.name || 'Invitado',
    email: currentUser?.email || 'Sin correo registrado',
    phone: currentUser?.phone || latestOrder?.customer?.phone || 'Sin telefono registrado',
    address:
      currentUser?.address || latestOrder?.customer?.address || 'Aun no hay direccion registrada',
    city: currentUser?.city || latestOrder?.customer?.city || 'Sin ciudad registrada',
    postalCode: currentUser?.postalCode || latestOrder?.customer?.postalCode || '---',
  };

  const stats = {
    totalOrders: orders.length,
    latestOrderId: latestOrder?.id ?? 'Sin compras',
    latestTotal: latestOrder ? formatCOP(latestOrder.totals.total) : 'Sin compras',
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 11</p>
          <h1 className={styles.title}>Mi cuenta</h1>
          <p className={styles.subtitle}>
            Esta vista centraliza la sesión autenticada y un resumen rápido de las órdenes del
            usuario actual.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/orders')}
          >
            Ver historial
          </button>
          <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Datos del perfil</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Nombre</span>
              <strong>{profile.name}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Correo</span>
              <strong>{profile.email}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Telefono</span>
              <strong>{profile.phone}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Direccion</span>
              <strong>{profile.address}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Ciudad</span>
              <strong>{profile.city}</strong>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Codigo postal</span>
              <strong>{profile.postalCode}</strong>
            </div>
          </div>
        </section>

        <aside className={styles.card}>
          <h2 className={styles.sectionTitle}>Resumen de compras</h2>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.label}>Ordenes guardadas</span>
              <strong>{stats.totalOrders}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.label}>Ultima orden</span>
              <strong>{stats.latestOrderId}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.label}>Ultimo total</span>
              <strong>{stats.latestTotal}</strong>
            </div>
          </div>

          {latestOrder ? (
            <div className={styles.latestOrder}>
              <p className={styles.latestOrderText}>
                Tu compra mas reciente fue enviada con{' '}
                <strong>{latestOrder.shippingMethod.label}</strong> y pagada con{' '}
                <strong>{latestOrder.paymentMethod.label}</strong>.
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate(`/user/orders/${latestOrder.id}`)}
              >
                Abrir ultima orden
              </button>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                Aun no hay compras registradas. Cuando completes el checkout, el historial quedara
                disponible desde esta seccion.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default UserProfile;

```

### src/styles/Navbar.module.css

Contenido final del archivo en esta semana:

```css
.navbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid var(--gray-200);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
}

.logo {
  width: 166px;
  height: 38px;
}

.brandName {
  font-weight: 800;
  color: var(--gray-900);
}

.links {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.link {
  background: transparent;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  color: var(--gray-900);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.link:hover {
  background: var(--gray-100);
}

.active {
  background: var(--gray-100);
  color: var(--primary-dark);
}

.auth {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.guestActions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.userName {
  font-weight: 700;
  color: var(--gray-900);
}

.authBtn {
  border: none;
  background: var(--primary);
  color: white;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 800;
}

.authBtn:hover {
  background: var(--primary-dark);
}

.secondaryAuthBtn {
  border: none;
  background: white;
  color: var(--primary-dark);
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 800;
}

.secondaryAuthBtn:hover {
  background: var(--gray-100);
}

.cartBadge {
  min-width: 1.35rem;
  height: 1.35rem;
  padding: 0 0.35rem;
  border-radius: 999px;
  background: var(--primary);
  color: white;
  font-size: 0.75rem;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .navbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .brand {
    min-width: auto;
  }

  .auth {
    justify-content: flex-start;
  }
}

```

### src/utils/ordersStorage.js

Contenido final del archivo en esta semana:

```javascript
const STORAGE_KEY = 'orders';

const normalizeOrderItem = (item) => ({
  id: Number(item?.id),
  name: String(item?.name ?? 'Producto'),
  category: String(item?.category ?? 'Sin categoría'),
  price: Number(item?.price) || 0,
  stock: Number(item?.stock) || 0,
  image: String(item?.image ?? ''),
  quantity: Math.max(1, Math.floor(Number(item?.quantity) || 1)),
});

const normalizeOrder = (order) => ({
  id: String(order?.id ?? ''),
  userId: String(order?.userId ?? ''),
  createdAt: String(order?.createdAt ?? new Date().toISOString()),
  items: Array.isArray(order?.items) ? order.items.map(normalizeOrderItem) : [],
  customer: {
    fullName: String(order?.customer?.fullName ?? ''),
    email: String(order?.customer?.email ?? ''),
    phone: String(order?.customer?.phone ?? ''),
    address: String(order?.customer?.address ?? ''),
    city: String(order?.customer?.city ?? ''),
    postalCode: String(order?.customer?.postalCode ?? ''),
  },
  shippingMethod: {
    id: String(order?.shippingMethod?.id ?? 'standard'),
    label: String(order?.shippingMethod?.label ?? 'Envío estándar'),
    description: String(order?.shippingMethod?.description ?? ''),
    price: Number(order?.shippingMethod?.price) || 0,
  },
  paymentMethod: {
    id: String(order?.paymentMethod?.id ?? 'card'),
    label: String(order?.paymentMethod?.label ?? 'Tarjeta de crédito'),
    description: String(order?.paymentMethod?.description ?? ''),
  },
  totals: {
    subtotal: Number(order?.totals?.subtotal) || 0,
    tax: Number(order?.totals?.tax) || 0,
    shipping: Number(order?.totals?.shipping) || 0,
    total: Number(order?.totals?.total) || 0,
  },
});

export function loadOrders() {
  if (typeof window === 'undefined') {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeOrder).filter((order) => order.id);
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedOrder = normalizeOrder(order);
  const currentOrders = loadOrders();

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([normalizedOrder, ...currentOrders]));
}

export function loadOrdersByUserId(userId) {
  const normalizedUserId = String(userId ?? '').trim();

  if (!normalizedUserId) {
    return [];
  }

  return loadOrders().filter((order) => order.userId === normalizedUserId);
}

export const ORDERS_STORAGE_KEY = STORAGE_KEY;

```

## Checklist de integracion

1. aplica primero los archivos nuevos de esta semana
2. luego reemplaza o ajusta los archivos marcados como actualizados
3. ejecuta la aplicacion y valida el flujo principal descrito en la guia narrativa
4. si esta semana agrega dependencias o configuracion, ejecutalas antes de probar la UI
