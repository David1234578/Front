import { NavLink, useLocation } from 'react-router-dom';

import logo from '../assets/img-logos/logo-Cesde-2023.svg';
import styles from '../styles/Navbar.module.css';

function Navbar({ user, onSignIn, onSignOut, cartItemCount = 0 }) {
  const userLabel = user?.name ?? 'Invitado';
  const isLoggedIn = Boolean(user);
  const location = useLocation();

  const isHomeActive = location.pathname === '/' || location.pathname.startsWith('/category/');
  const isCartActive =
    location.pathname === '/cart' ||
    location.pathname === '/checkout' ||
    location.pathname === '/order-confirmation';
  const isAccountActive = location.pathname.startsWith('/user/');

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
        <NavLink
          to="/user/profile"
          className={() => `${styles.link} ${isAccountActive ? styles.active : ''}`}
        >
          Mi cuenta
        </NavLink>
      </div>

      <div className={styles.auth}>
        <span className={styles.userName}>{userLabel}</span>

        {isLoggedIn ? (
          <button type="button" className={styles.authBtn} onClick={onSignOut}>
            Salir
          </button>
        ) : (
          <button type="button" className={styles.authBtn} onClick={onSignIn}>
            Ingresar
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
