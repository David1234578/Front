import { useMemo, useState } from 'react';

import useAuth from '../hooks/useAuth';
import styles from '../styles/UserArea.module.css';

function UserProfile() {
  const { currentUser, updateProfile } = useAuth();
  const initialValues = useMemo(
    () => ({
      name: String(currentUser?.name ?? ''),
      city: String(currentUser?.city ?? ''),
      phone: String(currentUser?.phone ?? ''),
      password: '',
    }),
    [currentUser]
  );

  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setError('');
    setMessage('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const result = updateProfile(values);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setMessage('Perfil actualizado correctamente.');
    setValues((prev) => ({
      ...prev,
      password: '',
      name: result.user.name,
      city: result.user.city,
      phone: result.user.phone,
    }));
  };

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Mi perfil</h1>
          <p className={styles.subtitle}>Administra tus datos personales y de contacto.</p>
        </div>
      </header>

      <article className={styles.card}>
        <form className={styles.grid} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Nombre completo</span>
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
            <input className={styles.input} value={String(currentUser?.email ?? '')} readOnly disabled />
          </label>

          <div className={styles.row}>
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

          <div className={styles.actions}>
            <button type="submit" className={styles.primaryBtn}>
              Guardar cambios
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}

export default UserProfile;
