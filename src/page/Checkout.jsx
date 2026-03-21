import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppModal from '../components/AppModal';
import styles from '../styles/Checkout.module.css';
import { clearCart, loadCart } from '../utils/cartStorage';

const copCurrencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const formatCOP = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? copCurrencyFormatter.format(amount) : 'COP 0';
};

const emptyValues = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  paymentMethod: '',
  notes: '',
};

const paymentMethods = [
  { value: 'card', label: 'Tarjeta debito / credito' },
  { value: 'pse', label: 'PSE' },
  { value: 'cash', label: 'Efectivo contra entrega' },
];

const getPaymentMethodLabel = (value) => {
  const found = paymentMethods.find((method) => method.value === value);
  return found ? found.label : 'Sin metodo seleccionado';
};

function Checkout() {
  const navigate = useNavigate();
  const [items, setItems] = useState(loadCart);
  const [values, setValues] = useState(emptyValues);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const totals = useMemo(() => {
    const units = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 0 && subtotal < 200000 ? 15000 : 0;
    const tax = subtotal * 0.19;

    return {
      units,
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax,
    };
  }, [items]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Flujo solicitado: pago siempre exitoso al enviar.
    setItems(clearCart());
    setIsSuccessOpen(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccessOpen(false);
    navigate('/');
  };

  if (items.length === 0 && !isSuccessOpen) {
    return (
      <section className={styles.page}>
        <div className={styles.emptyCard}>
          <h1 className={styles.title}>Checkout</h1>
          <p className={styles.subtitle}>No tienes productos para pagar en este momento.</p>
          <button type="button" className={styles.primaryBtn} onClick={() => navigate('/products')}>
            Ir a productos
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Finalizar compra</h1>
        <p className={styles.subtitle}>Completa tus datos para procesar el pedido.</p>
      </header>

      <div className={styles.layout}>
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Datos de entrega</h2>

          <div className={styles.gridTwo}>
            <label className={styles.field}>
              <span>Nombre completo</span>
              <input
                className={styles.input}
                name="fullName"
                value={values.fullName}
                onChange={handleChange}
                placeholder="Ej: Juan Diaz"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Correo</span>
              <input
                className={styles.input}
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                placeholder="correo@dominio.com"
                required
              />
            </label>
          </div>

          <div className={styles.gridTwo}>
            <label className={styles.field}>
              <span>Telefono</span>
              <input
                className={styles.input}
                name="phone"
                value={values.phone}
                onChange={handleChange}
                placeholder="3001234567"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Ciudad</span>
              <input
                className={styles.input}
                name="city"
                value={values.city}
                onChange={handleChange}
                placeholder="Medellin"
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Direccion</span>
            <input
              className={styles.input}
              name="address"
              value={values.address}
              onChange={handleChange}
              placeholder="Calle 00 # 00-00"
              required
            />
          </label>

          <fieldset className={styles.paymentMethods}>
            <legend className={styles.paymentTitle}>Metodo de pago</legend>

            <div className={styles.paymentOptions}>
              {paymentMethods.map((method) => (
                <label key={method.value} className={styles.paymentOption}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={values.paymentMethod === method.value}
                    onChange={handleChange}
                    required
                  />
                  <span>{method.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className={styles.field}>
            <span>Notas del pedido (opcional)</span>
            <textarea
              className={styles.textarea}
              name="notes"
              value={values.notes}
              onChange={handleChange}
              placeholder="Indicaciones de entrega"
              rows={3}
            />
          </label>

          <div className={styles.actions}>
            <button type="button" className={styles.secondaryBtn} onClick={() => navigate('/cart')}>
              Volver al carrito
            </button>
            <button type="submit" className={styles.primaryBtn}>
              Confirmar pago
            </button>
          </div>
        </form>

        <aside className={styles.summaryCard}>
          <h2 className={styles.sectionTitle}>Resumen de pago</h2>
          <p className={styles.meta}>{totals.units} unidades</p>
          <p className={styles.methodTag}>Metodo: {getPaymentMethodLabel(values.paymentMethod)}</p>

          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <strong>{formatCOP(totals.subtotal)}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Envio</span>
              <strong>{totals.shipping === 0 ? 'Gratis' : formatCOP(totals.shipping)}</strong>
            </div>
            <div className={styles.summaryRow}>
              <span>IVA (19%)</span>
              <strong>{formatCOP(totals.tax)}</strong>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total</span>
              <strong>{formatCOP(totals.total)}</strong>
            </div>
          </div>
        </aside>
      </div>

      <AppModal isOpen={isSuccessOpen} onClose={handleCloseSuccess} ariaLabel="Pago exitoso" className={styles.successModal}>
        <div className={styles.successBody}>
          <p className={styles.successKicker}>Operacion aprobada</p>
          <h2 className={styles.successTitle}>Pago realizado con exito</h2>
          <p className={styles.successText}>
            Tu pedido fue confirmado correctamente con {getPaymentMethodLabel(values.paymentMethod)}.
            Recibiras un correo de seguimiento.
          </p>
          <button type="button" className={styles.primaryBtn} onClick={handleCloseSuccess}>
            Volver al inicio
          </button>
        </div>
      </AppModal>
    </section>
  );
}

export default Checkout;
