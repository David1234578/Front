import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/AuthPage.module.css';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from ?? '/';

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = login({ email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    navigate(from, { replace: true });
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Semana 11</p>
        <h1 className={styles.title}>Iniciar sesion</h1>
        <p className={styles.subtitle}>
          Accede a tu cuenta para proteger el checkout y consultar tu historial de ordenes.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Correo electronico</span>
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
            <span className={styles.label}>Contrasena</span>
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

          <button type="submit" className={styles.primaryButton}>
            Ingresar
          </button>
        </form>

        <p className={styles.helperText}>
          <Link to="/recover-password">Recuperar clave</Link>
          {' | '}
          <Link to="/register">Crear cuenta</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;