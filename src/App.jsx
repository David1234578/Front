import { useEffect, useMemo, useRef, useState } from 'react';

import Footer from './components/Footer';
import Header from './components/Header';
import Cart from './page/Cart';
import CategoryProducts from './page/CategoryProducts';
import Home from './page/Home';
import ProductList from './page/ProductList';

import './App.css';

function App() {
  const [activePage, setActivePage] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  const page = useMemo(() => {
    if (activePage === 'category') {
      return <CategoryProducts category={selectedCategory} onBack={handleBackFromCategory} />;
    }
    if (activePage === 'products') return <ProductList />;
    if (activePage === 'cart') return <Cart />;

    return <Home onOpenCategory={handleOpenCategory} />;
  }, [activePage, selectedCategory]);

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
      />

      <main className="main">{page}</main>

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