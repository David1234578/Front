import styles from "../styles/Navbar.module.css";
import { NavLink } from "react-router-dom";
 
import logo from "../assets/react.svg";
 
function Navbar({ user, onSignIn, onSignOut }) {
  const userLabel = user?.name ?? "Invitado";
  const isLoggedIn = Boolean(user);
 
  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <img className={styles.logo} src={logo} alt="Logo" />
        <span className={styles.brandName}>Sistema Ventas</span>
      </div>
 
      <div className={styles.links}>
        <NavLink
          to="/"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
        >
          Inicio
        </NavLink>
        <NavLink
          to="/products"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
        >
          Productos
        </NavLink>
        <NavLink
          to="/cart"
          className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}
        >
          Carrito
        </NavLink>
      </div>
 
      <div className={styles.auth}>
        <span className={styles.userName}>{userLabel}</span>
 
        {isLoggedIn ? (
          <button type="button" className={styles.authBtn} onClick={onSignOut}>
            Sign out
          </button>
        ) : (
          <button type="button" className={styles.authBtn} onClick={onSignIn}>
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
 
export default Navbar;