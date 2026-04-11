import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/AuthPage.module.css';

const emptyValues = {
  name: '',
  email: '',
  city: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

function Register() {
  const { register } = useAuth();
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

    const result = register(values);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError('');
    navigate('/user/profile', { replace: true });
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Semana 11</p>
        <h1 className={styles.title}>Crear cuenta</h1>
        <p className={styles.subtitle}>Registra un usuario local para mantener sesion y proteger rutas.</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Nombre completo</span>
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
            <span className={styles.label}>Correo</span>
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

          <label className={styles.field}>
            <span className={styles.label}>Ciudad</span>
            <input
              className={styles.input}
              name="city"
              value={values.city}
              onChange={handleChange}
              placeholder="Medellin"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Telefono</span>
            <input
              className={styles.input}
              name="phone"
              value={values.phone}
              onChange={handleChange}
              placeholder="3001234567"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Contrasena</span>
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
            <span className={styles.label}>Confirmar contrasena</span>
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

          <button type="submit" className={styles.primaryButton}>
            Crear cuenta
          </button>
        </form>

        <p className={styles.helperText}>
          <Link to="/login">Ya tengo cuenta</Link>
        </p>
      </div>
    </section>
  );
}

export default Register;