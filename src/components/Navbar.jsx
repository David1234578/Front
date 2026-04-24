import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import logo from '../assets/img-logos/logo-Cesde-2023.svg';
import useAuth from '../hooks/useAuth';
import styles from '../styles/Navbar.module.css';

function Navbar({ user, onSignOut, cartItemCount = 0 }) {
  const userLabel = user?.fullName ?? user?.name ?? 'Invitado';
  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === 'ADMIN';
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
  const isAdminActive = location.pathname.startsWith('/admin');

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
        {isAdmin ? (
          <button
            type="button"
            className={`${styles.link} ${isAdminActive ? styles.active : ''}`}
            onClick={() => navigate('/admin')}
          >
            Admin
          </button>
        ) : null}
      </div>

      <div className={styles.auth}>
        <div className={styles.userMeta}>
          <span className={styles.userName}>{userLabel}</span>
          {isLoggedIn ? (
            <span className={styles.roleBadge}>{isAdmin ? 'Administrador' : 'Cliente'}</span>
          ) : null}
        </div>

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
