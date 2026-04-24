import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { appConfig } from '../config';
import useAuth from '../hooks/useAuth';
import cartService from '../services/cartService';
import styles from '../styles/AuthPage.module.css';
import { DEFAULT_ADMIN_USER } from '../utils/authStorage';

const REMOTE_DEMO_CREDENTIALS = {
  admin: {
    email: 'admin.demo@pps.com',
    password: 'Admin12345*',
  },
  customer: {
    email: 'customer.demo@pps.com',
    password: 'Customer12345*',
  },
  guestToken: 'demo-guest-session-token',
};

const fillDemoCredentials = (setValues, credentials) => {
  setValues({
    email: credentials.email,
    password: credentials.password,
  });
};

function Login() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const { authError, clearAuthError, isSubmittingAuth, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isRemoteMode = appConfig.useRemoteApi;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setFormError('');
    clearAuthError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const guestCartId = String(cartService.getCart()?.id ?? '').trim();

    const result = await login({
      email: values.email.trim(),
      guestCartId,
      password: values.password,
    });

    if (!result.ok) {
      setFormError(result.error ?? 'No fue posible iniciar sesión.');
      return;
    }

    const nextPath = location.state?.from || '/user/profile';
    navigate(nextPath, { replace: true });
  };

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Semana 12</p>
        <h1 className={styles.title}>Iniciar sesión</h1>
        <p className={styles.subtitle}>
          Accede a tu cuenta para proteger el checkout, diferenciar permisos y abrir el panel
          administrativo cuando el rol lo permita.
        </p>

        <div className={styles.infoBox}>
          <strong>
            {isRemoteMode ? 'Credenciales seed demo backend' : 'Credenciales demo locales'}
          </strong>
          <div className={styles.credentialsList}>
            {isRemoteMode ? (
              <>
                <span className={styles.credentialRow}>
                  Admin: {REMOTE_DEMO_CREDENTIALS.admin.email} /{' '}
                  {REMOTE_DEMO_CREDENTIALS.admin.password}
                </span>
                <span className={styles.credentialRow}>
                  Customer: {REMOTE_DEMO_CREDENTIALS.customer.email} /{' '}
                  {REMOTE_DEMO_CREDENTIALS.customer.password}
                </span>
                <span className={styles.credentialRow}>
                  Guest token demo: {REMOTE_DEMO_CREDENTIALS.guestToken}
                </span>
                <div className={styles.demoActions}>
                  <button
                    type="button"
                    className={styles.demoActionButton}
                    disabled={isSubmittingAuth}
                    onClick={() => fillDemoCredentials(setValues, REMOTE_DEMO_CREDENTIALS.customer)}
                  >
                    Usar customer demo
                  </button>
                  <button
                    type="button"
                    className={styles.demoActionButton}
                    disabled={isSubmittingAuth}
                    onClick={() => fillDemoCredentials(setValues, REMOTE_DEMO_CREDENTIALS.admin)}
                  >
                    Usar admin demo
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className={styles.credentialRow}>Correo: {DEFAULT_ADMIN_USER.email}</span>
                <span className={styles.credentialRow}>
                  Contraseña: {DEFAULT_ADMIN_USER.password}
                </span>
              </>
            )}
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Correo electrónico</span>
            <input
              className={styles.input}
              disabled={isSubmittingAuth}
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="correo@dominio.com"
              type="email"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Contraseña</span>
            <input
              className={styles.input}
              disabled={isSubmittingAuth}
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              type="password"
            />
          </label>

          {formError || authError ? <p className={styles.error}>{formError || authError}</p> : null}

          <button type="submit" className={styles.primaryButton} disabled={isSubmittingAuth}>
            {isSubmittingAuth ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className={styles.helperText}>
          ¿Todavía no tienes cuenta? <Link to="/register">Regístrate aquí</Link>.
        </p>
      </div>
    </section>
  );
}

export default Login;
