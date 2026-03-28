import styles from "../styles/Header.module.css";
 
import Navbar from "./Navbar";
 
function Header({ user, onSignOut }) {
  return (
    <header className={styles.header}>
      <Navbar
        user={user}
        onSignOut={onSignOut}
      />
    </header>
  );
}
 
export default Header;