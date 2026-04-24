import { useNavigate } from 'react-router-dom';

import styles from '../styles/OrderConfirmation.module.css';
import { formatCOP } from '../utils/formatCOP';

function OrderConfirmation({ order, onBackHome }) {
  const navigate = useNavigate();

  const handleBackHome = () => {
    onBackHome();
    navigate('/');
  };

  const handleViewOrders = () => {
    navigate('/user/orders');
  };

  if (!order) {
    return (
      <section className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>No hay una orden reciente</h1>
          <p className={styles.subtitle}>
            El checkout ya se cerró o no existe una compra para mostrar en esta vista.
          </p>
          <button type="button" className={styles.primaryButton} onClick={handleBackHome}>
            Volver al inicio
          </button>
        </div>
      </section>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <p className={styles.eyebrow}>Compra confirmada</p>
        <h1 className={styles.title}>Tu pedido quedó registrado</h1>
        <p className={styles.subtitle}>
          Guarda este resumen para seguimiento. El carrito ya se vació y la orden quedó persistida
          localmente.
        </p>

        <div className={styles.metaGrid}>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Orden</span>
            <strong className={styles.metaValue}>{order.id}</strong>
          </div>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Fecha</span>
            <strong className={styles.metaValue}>{formattedDate}</strong>
          </div>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Envío</span>
            <strong className={styles.metaValue}>{order.shippingMethod.label}</strong>
          </div>
          <div className={styles.metaCard}>
            <span className={styles.metaLabel}>Pago</span>
            <strong className={styles.metaValue}>{order.paymentMethod.label}</strong>
          </div>
        </div>

        <div className={styles.layout}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Cliente</h2>
            <div className={styles.infoList}>
              <p>
                <strong>{order.customer.fullName}</strong>
              </p>
              <p>{order.customer.email}</p>
              <p>{order.customer.phone}</p>
              <p>{order.customer.address}</p>
              <p>
                {order.customer.city} - {order.customer.postalCode}
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Items</h2>
            <div className={styles.itemList}>
              {order.items.map((item) => (
                <article key={item.id} className={styles.item}>
                  <img className={styles.itemImage} src={item.image} alt={item.name} />
                  <div className={styles.itemContent}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemMeta}>
                      {item.quantity} x {formatCOP(item.price)}
                    </p>
                  </div>
                  <strong className={styles.itemPrice}>
                    {formatCOP(item.quantity * item.price)}
                  </strong>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Totales</h2>
          <div className={styles.totalRows}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <strong>{formatCOP(order.totals.subtotal)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>IVA</span>
              <strong>{formatCOP(order.totals.tax)}</strong>
            </div>
            <div className={styles.totalRow}>
              <span>Envío</span>
              <strong>{formatCOP(order.totals.shipping)}</strong>
            </div>
            <div className={`${styles.totalRow} ${styles.totalRowStrong}`}>
              <span>Total final</span>
              <strong>{formatCOP(order.totals.total)}</strong>
            </div>
          </div>
        </section>

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={handleViewOrders}>
            Ver historial
          </button>
          <button type="button" className={styles.primaryButton} onClick={handleBackHome}>
            Volver al inicio
          </button>
        </div>
      </div>
    </section>
  );
}

export default OrderConfirmation;
