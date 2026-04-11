import { useMemo, useState } from 'react';

import styles from '../styles/Auth.module.css';
import { updateCurrentUserProfile } from '../utils/authStorage';

function MyAccount({ user, onProfileUpdated }) {
  const initialValues = useMemo(
    () => ({
      name: String(user?.name ?? ''),
      city: String(user?.city ?? ''),
      phone: String(user?.phone ?? ''),
      password: '',
    }),
    [user]
  );

  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = updateCurrentUserProfile(values);
    if (!result.ok) {
      setError(result.message);
      setMessage('');
      return;
    }

    setError('');
    setMessage('Datos actualizados correctamente.');

    setValues((prev) => ({
      ...prev,
      password: '',
      name: result.user.name,
      city: result.user.city,
      phone: result.user.phone,
    }));

    if (typeof onProfileUpdated === 'function') {
      onProfileUpdated(result.user);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.authLayout}>
        <aside className={styles.authAside}>
          <p className={styles.kicker}>Perfil</p>
          <h1 className={styles.asideTitle}>Configura tu cuenta</h1>
          <p className={styles.asideText}>
            Administra tu informacion personal y manten tu acceso seguro en un solo lugar.
          </p>

          <div className={styles.accountPreview}>
            <h3>Resumen actual</h3>
            <p>
              <strong>Nombre:</strong> {values.name || 'Sin definir'}
            </p>
            <p>
              <strong>Correo:</strong> {String(user?.email ?? '') || 'Sin definir'}
            </p>
            <p>
              <strong>Ciudad:</strong> {values.city || 'Sin definir'}
            </p>
            <p>
              <strong>Telefono:</strong> {values.phone || 'Sin definir'}
            </p>
          </div>
        </aside>

        <article className={styles.card}>
          <header className={styles.header}>
            <h2 className={styles.title}>Mi cuenta</h2>
            <p className={styles.subtitle}>Edita tus datos personales y tu clave.</p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Nombre</span>
              <input
                className={styles.input}
                name="name"
                value={values.name}
                onChange={handleChange}
                required
              />
            </label>

            <label className={styles.field}>
              <span>Correo</span>
              <input className={styles.input} value={String(user?.email ?? '')} disabled readOnly />
            </label>

            <div className={styles.twoColumns}>
              <label className={styles.field}>
                <span>Ciudad</span>
                <input
                  className={styles.input}
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  placeholder="Medellin"
                />
              </label>

              <label className={styles.field}>
                <span>Telefono</span>
                <input
                  className={styles.input}
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  placeholder="3001234567"
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Nueva clave (opcional)</span>
              <input
                className={styles.input}
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Solo si quieres cambiarla"
              />
            </label>

            {error ? <p className={styles.error}>{error}</p> : null}
            {message ? <p className={styles.success}>{message}</p> : null}

            <button type="submit" className={styles.primaryBtn}>
              Guardar datos
            </button>
          </form>
        </article>
      </div>
    </section>
  );
}

export default MyAccount;