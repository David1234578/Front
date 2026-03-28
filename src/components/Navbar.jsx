import styles from "../styles/Navbar.module.css";
import { NavLink } from "react-router-dom";
 
function Navbar({ user, onSignOut }) {
  const userLabel = user?.name ?? "Sin sesion";
  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === "admin";
 
  return (
    <nav className={styles.navbar}>
      <div className={styles.topRow}>
        <div className={styles.brand}>
          <span className={styles.brandBadge}>NT</span>
          <div className={styles.brandText}>
            <strong className={styles.brandName}>NovaTech </strong>
            <span className={styles.brandTagline}>Tecnologia para empresa y hogar</span>
          </div>
        </div>
 
        <div className={styles.auth}>
          <span className={styles.userName}>{userLabel}</span>

          {isLoggedIn ? (
            <button type="button" className={styles.authBtn} onClick={onSignOut}>
              Cerrar sesion
            </button>
          ) : (
            <>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `${styles.authBtn} ${styles.secondaryAuthBtn} ${isActive ? styles.activeAuthBtn : ""}`
                }
              >
                Crear cuenta
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${styles.authBtn} ${isActive ? styles.activeAuthBtn : ""}`
                }
              >
                Iniciar sesion
              </NavLink>
            </>
          )}
        </div>
      </div>

      <div className={styles.links}>
        <NavLink
          to="/"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
        >
          Inicio
        </NavLink>
        {isAdmin ? (
          <NavLink
            to="/products"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
          >
            Gestion de productos
          </NavLink>
        ) : null}
        {!isAdmin ? (
          <NavLink
            to="/cart"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
          >
            Carrito
          </NavLink>
        ) : null}
        {isLoggedIn ? (
          <NavLink
            to="/my-account"
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
          >
            Mi cuenta
          </NavLink>
        ) : null}
      </div>
    </nav>
  );
}
 
export default Navbar;