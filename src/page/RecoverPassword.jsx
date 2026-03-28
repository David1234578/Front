import { useState } from 'react';
import { Link } from 'react-router-dom';

import styles from '../styles/Auth.module.css';
import { recoverPasswordByEmail } from '../utils/authStorage';

function RecoverPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = recoverPasswordByEmail(email);

    if (!result.ok) {
      setError(result.message);
      setMessage('');
      return;
    }

    setError('');
    setMessage(result.message);
  };

  return (
    <section className={styles.page}>
      <div className={styles.authLayout}>
        <aside className={styles.authAside}>
          <p className={styles.kicker}>Recuperacion</p>
          <h1 className={styles.asideTitle}>Recupera el acceso a tu cuenta</h1>
          <p className={styles.asideText}>
            Ingresa el correo registrado para continuar con el proceso de recuperacion.
          </p>

          <ul className={styles.asideList}>
            <li>Validacion rapida por correo</li>
            <li>Proceso guiado en un solo paso</li>
            <li>Acceso de vuelta a tu cuenta</li>
          </ul>
        </aside>

        <article className={styles.card}>
          <header className={styles.header}>
            <h2 className={styles.title}>Recuperar clave</h2>
            <p className={styles.subtitle}>Escribe tu correo para continuar.</p>
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

            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.success}>{message}</p> : null}

            <button type="submit" className={styles.primaryBtn}>
              Recuperar
            </button>
          </form>

          <div className={styles.linksRow}>
            <Link to="/login" className={styles.inlineLink}>
              Volver a login
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

export default RecoverPassword;