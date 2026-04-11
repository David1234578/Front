import { Link } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import styles from '../styles/UserArea.module.css';
import { getOrdersByUserId } from '../utils/ordersStorage';

const copCurrencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function UserOrders() {
  const { currentUser } = useAuth();
  const orders = getOrdersByUserId(currentUser?.id);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Mis pedidos</h1>
          <p className={styles.subtitle}>Revisa tu historial de compras y consulta el detalle.</p>
        </div>
      </header>

      <article className={styles.card}>
        {orders.length === 0 ? (
          <p className={styles.empty}>Aun no tienes pedidos registrados.</p>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <article key={order.id} className={styles.orderCard}>
                <div className={styles.orderTop}>
                  <div>
                    <p className={styles.orderId}>{order.id}</p>
                    <p className={styles.orderMeta}>
                      {new Date(order.createdAt).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <span className={styles.badge}>{copCurrencyFormatter.format(order.totals.total)}</span>
                </div>

                <Link className={styles.linkBtn} to={`/user/orders/${encodeURIComponent(order.id)}`}>
                  Ver detalle
                </Link>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default UserOrders;
