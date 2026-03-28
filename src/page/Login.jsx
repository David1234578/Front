import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import styles from '../styles/Auth.module.css';
import { authenticateUser } from '../utils/authStorage';

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from ?? '/';

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = authenticateUser(email, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError('');
    if (typeof onLoginSuccess === 'function') {
      onLoginSuccess(result.user);
    }
    navigate(from, { replace: true });
  };

  return (
    <section className={styles.page}>
      <div className={styles.authLayout}>
        <aside className={styles.authAside}>
          <p className={styles.kicker}>Bienvenido</p>
          <h1 className={styles.asideTitle}>Ingresa a tu cuenta</h1>
          <p className={styles.asideText}>
            Gestiona tus pedidos, revisa tu carrito y actualiza tus datos en un solo lugar.
          </p>

          <ul className={styles.asideList}>
            <li>Acceso rapido a tu historial de compra</li>
            <li>Datos de entrega guardados</li>
            <li>Proceso de pago mas agil</li>
          </ul>
        </aside>

        <article className={styles.card}>
          <header className={styles.header}>
            <h2 className={styles.title}>Iniciar sesion</h2>
            <p className={styles.subtitle}>Ingresa con tu correo y clave para continuar.</p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Correo</span>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="correo@dominio.com"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Clave</span>
              <input
                className={styles.input}
                type="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu clave"
                required
              />
            </label>

            {error ? <p className={styles.error}>{error}</p> : null}

            <button type="submit" className={styles.primaryBtn}>
              Entrar
            </button>
          </form>

          <div className={styles.linksRow}>
            <Link to="/recover-password" className={styles.inlineLink}>
              Recuperar clave
            </Link>
            {' | '}
            <Link to="/register" className={styles.inlineLink}>
              Crear cuenta
            </Link>
          </div>

          <p className={styles.hint}>
            Demo admin: admin@ventas.com / Admin123* | Demo usuario: cliente@ventas.com / Cliente123*
          </p>
        </article>
      </div>
    </section>
  );
}

export default Login;