import styles from "../styles/Header.module.css";
 
import Navbar from "./Navbar";
 
function Header({ user }) {
  return (
    <header className={styles.header}>
      <Navbar user={user} />
    </header>
  );
}
 
export default Header;