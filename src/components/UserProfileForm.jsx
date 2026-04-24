import { useEffect, useState } from 'react';

import styles from '../styles/UserProfile.module.css';

const emptyValues = {
  name: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
};

function UserProfileForm({
  initialValues,
  email,
  roleLabel,
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitError = '',
}) {
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({
      name: initialValues?.name ?? '',
      phone: initialValues?.phone ?? '',
      address: initialValues?.address ?? '',
      city: initialValues?.city ?? '',
      postalCode: initialValues?.postalCode ?? '',
    });
    setErrors({});
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
  };

  const validateValues = () => {
    const nextErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = 'Ingresa un nombre para el perfil.';
    }

    if (values.phone.trim() && values.phone.trim().length < 7) {
      nextErrors.phone = 'Ingresa un teléfono válido o déjalo vacío.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateValues();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      name: values.name.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      postalCode: values.postalCode.trim(),
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span className={styles.label}>Nombre completo</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="name"
            onChange={handleChange}
            placeholder="Ejemplo: Ana Gómez"
            value={values.name}
          />
          {errors.name ? <span className={styles.error}>{errors.name}</span> : null}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Correo</span>
          <input className={styles.input} disabled readOnly value={email} />
          <span className={styles.helper}>
            El correo es el identificador de acceso y no se edita aquí.
          </span>
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Rol</span>
          <input className={styles.input} disabled readOnly value={roleLabel} />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Teléfono</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="phone"
            onChange={handleChange}
            placeholder="3001234567"
            value={values.phone}
          />
          {errors.phone ? <span className={styles.error}>{errors.phone}</span> : null}
        </label>

        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.label}>Dirección</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="address"
            onChange={handleChange}
            placeholder="Calle 10 #20-30"
            value={values.address}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Ciudad</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="city"
            onChange={handleChange}
            placeholder="Medellín"
            value={values.city}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Código postal</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="postalCode"
            onChange={handleChange}
            placeholder="050021"
            value={values.postalCode}
          />
        </label>
      </div>

      {submitError ? <p className={styles.errorBanner}>{submitError}</p> : null}

      <div className={styles.formActions}>
        <button
          className={styles.secondaryButton}
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
        <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando perfil...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}

export default UserProfileForm;
