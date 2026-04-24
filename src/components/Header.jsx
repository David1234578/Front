import styles from '../styles/Header.module.css';

import Navbar from './Navbar';

function Header({ user, onSignIn, onSignOut, cartItemCount }) {
  return (
    <header className={styles.header}>
      <Navbar user={user} onSignIn={onSignIn} onSignOut={onSignOut} cartItemCount={cartItemCount} />
    </header>
  );
}

export default Header;
