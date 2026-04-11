import { Link, Navigate, useParams } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/UserArea.module.css';
import { getOrderById } from '../utils/ordersStorage';

const copCurrencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function OrderDetail() {
  const { orderId } = useParams();
  const { currentUser } = useAuth();
  const order = getOrderById(decodeURIComponent(String(orderId ?? '')));

  if (!order || order.userId !== currentUser?.id) {
    return <Navigate to="/user/orders" replace />;
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Detalle de pedido</h1>
          <p className={styles.subtitle}>{order.id}</p>
        </div>
        <Link to="/user/orders" className={styles.secondaryBtn}>
          Volver
        </Link>
      </header>

      <article className={styles.card}>
        <p className={styles.orderMeta}>Fecha: {new Date(order.createdAt).toLocaleString('es-CO')}</p>
        <p className={styles.orderMeta}>Pago: {order.paymentMethod || 'No definido'}</p>
        <p className={styles.orderMeta}>
          Entrega: {order.shippingAddress || 'Sin direccion'} - {order.city || 'Sin ciudad'}
        </p>

        <div className={styles.items}>
          {order.items.map((item) => (
            <article key={`${order.id}-${item.id}`} className={styles.item}>
              <img className={styles.itemImage} src={item.image} alt={item.name} />
              <div>
                <p className={styles.itemName}>{item.name}</p>
                <p className={styles.itemMeta}>
                  {item.quantity} x {copCurrencyFormatter.format(item.price)}
                </p>
              </div>
              <strong className={styles.total}>
                {copCurrencyFormatter.format(item.price * item.quantity)}
              </strong>
            </article>
          ))}
        </div>

        <div className={styles.items}>
          <p className={styles.orderMeta}>Subtotal: {copCurrencyFormatter.format(order.totals.subtotal)}</p>
          <p className={styles.orderMeta}>Envio: {copCurrencyFormatter.format(order.totals.shipping)}</p>
          <p className={styles.orderMeta}>IVA: {copCurrencyFormatter.format(order.totals.tax)}</p>
          <p className={styles.total}>Total: {copCurrencyFormatter.format(order.totals.total)}</p>
        </div>
      </article>
    </section>
  );
}

export default OrderDetail;
