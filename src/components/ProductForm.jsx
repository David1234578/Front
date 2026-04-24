import { useEffect, useState } from 'react';

import styles from '../styles/ProductForm.module.css';

const emptyValues = {
  name: '',
  category: '',
  price: '',
  stock: '',
  image: '',
  description: '',
};

function ProductForm({
  initialValues,
  onSubmit,
  onCancel,
  isEditing = false,
  isSubmitting = false,
  submitError = '',
}) {
  const [values, setValues] = useState(emptyValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name ?? '',
        category: initialValues.category ?? '',
        price: initialValues.price ?? '',
        stock: initialValues.stock ?? '',
        image: initialValues.image ?? '',
        description: initialValues.description ?? '',
      });
    } else {
      setValues(emptyValues);
    }
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = values.name.trim();
    const category = values.category.trim();
    const image = values.image.trim();
    const description = values.description.trim();

    const price = Number(values.price);
    const stock = Number(values.stock);

    const parsedRating = Number(initialValues?.rating ?? 3);
    const rating = Number.isFinite(parsedRating) ? Math.min(5, Math.max(1, parsedRating)) : 3;

    if (!name) return;
    if (!Number.isFinite(price) || price <= 0) return;
    if (!Number.isFinite(stock) || stock < 0) return;

    const result = await onSubmit({
      ...initialValues,
      name,
      category,
      price,
      stock,
      image,
      description,
      rating,
    });

    if (!isEditing && result?.ok !== false) {
      setValues(emptyValues);
    }
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{isEditing ? 'Editar producto' : 'Agregar producto'}</h2>
        <p className={styles.subtitle}>Completa el formulario y guarda los cambios.</p>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span className={styles.label}>Nombre</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="Ej: Teclado gamer"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Categoría</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="category"
            value={values.category}
            onChange={handleChange}
            placeholder="Ej: Accesorios"
          />
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span className={styles.label}>Precio</span>
            <input
              className={styles.input}
              disabled={isSubmitting}
              name="price"
              type="number"
              min="1"
              value={values.price}
              onChange={handleChange}
              placeholder="Ej: 199990"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Stock</span>
            <input
              className={styles.input}
              disabled={isSubmitting}
              name="stock"
              type="number"
              min="0"
              value={values.stock}
              onChange={handleChange}
              placeholder="Ej: 10"
            />
          </label>
        </div>

        <label className={styles.field}>
          <span className={styles.label}>Imagen (URL)</span>
          <input
            className={styles.input}
            disabled={isSubmitting}
            name="image"
            value={values.image}
            onChange={handleChange}
            placeholder="https://..."
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Descripción</span>
          <textarea
            className={styles.textarea}
            disabled={isSubmitting}
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="Describe el producto..."
            rows={3}
          />
        </label>

        {submitError ? <p className={styles.error}>{submitError}</p> : null}

        <div className={styles.actions}>
          {onCancel ? (
            <button
              className={styles.btnSecondary}
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
          ) : null}

          <button className={styles.btnPrimary} type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? 'Guardando...'
                : 'Agregando...'
              : isEditing
                ? 'Guardar cambios'
                : 'Agregar producto'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default ProductForm;
