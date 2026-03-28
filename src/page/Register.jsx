import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import styles from '../styles/Auth.module.css';
import { registerUser } from '../utils/authStorage';

const emptyValues = {
  name: '',
  email: '',
  city: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(emptyValues);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (values.password !== values.confirmPassword) {
      setError('Las claves no coinciden.');
      return;
    }

    const result = registerUser(values);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError('');

    if (typeof onRegisterSuccess === 'function') {
      onRegisterSuccess(result.user);
    }

    navigate('/', { replace: true });
  };

  return (
    <section className={styles.page}>
      <div className={styles.authLayout}>
        <aside className={styles.authAside}>
          <p className={styles.kicker}>Registro</p>
          <h1 className={styles.asideTitle}>Crea tu cuenta en minutos</h1>
          <p className={styles.asideText}>
            Completa tus datos y accede a una experiencia personalizada para tus compras.
          </p>

          <ul className={styles.asideList}>
            <li>Seguimiento facil de tus pedidos</li>
            <li>Proceso de pago mas rapido</li>
            <li>Edicion de datos desde Mi cuenta</li>
          </ul>
        </aside>

        <article className={styles.card}>
          <header className={styles.header}>
            <h2 className={styles.title}>Crear cuenta</h2>
            <p className={styles.subtitle}>Completa tus datos para registrarte en la plataforma.</p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Nombre completo</span>
              <input
                className={styles.input}
                name="name"
                value={values.name}
                onChange={handleChange}
                placeholder="Ej: Juan Diaz"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Correo</span>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                placeholder="correo@dominio.com"
                required
              />
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
              <span>Clave</span>
              <input
                className={styles.input}
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                placeholder="Minimo 6, con mayuscula, numero y simbolo"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Confirmar clave</span>
              <input
                className={styles.input}
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder="Repite la clave"
                required
              />
            </label>

            {error ? <p className={styles.error}>{error}</p> : null}

            <button type="submit" className={styles.primaryBtn}>
              Crear cuenta
            </button>
          </form>

          <div className={styles.linksRow}>
            <Link to="/login" className={styles.inlineLink}>
              Ya tengo cuenta
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

export default Register;