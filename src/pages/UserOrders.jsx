import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OrderCard from '../components/OrderCard';
import useAuth from '../hooks/useAuth';
import orderService from '../services/orderService';
import styles from '../styles/UserOrders.module.css';

function UserOrders() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const nextOrders = await orderService.getOrdersByUserIdAsync(currentUser?.id);

        if (isMounted) {
          setOrders(
            nextOrders.sort(
              (leftOrder, rightOrder) =>
                new Date(rightOrder.createdAt) - new Date(leftOrder.createdAt)
            )
          );
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error && error.message
              ? error.message
              : 'No fue posible cargar el historial de órdenes.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  if (isLoading) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.eyebrow}>Semana 14</p>
          <h1 className={styles.title}>Mis ordenes</h1>
          <p className={styles.subtitle}>Cargando historial del usuario autenticado...</p>
        </div>
      </section>
    );
  }

  if (loadError) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.eyebrow}>Semana 14</p>
          <h1 className={styles.title}>Mis ordenes</h1>
          <p className={styles.subtitle}>{loadError}</p>
        </div>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          <p className={styles.eyebrow}>Semana 11</p>
          <h1 className={styles.title}>Mis ordenes</h1>
          <p className={styles.subtitle}>
            Todavía no hay compras asociadas a tu sesión. Completa el checkout autenticado para
            poblar esta vista.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/user/profile')}
            >
              Ir al perfil
            </button>
            <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
              Explorar productos
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 11</p>
          <h1 className={styles.title}>Historial de ordenes</h1>
          <p className={styles.subtitle}>
            Recupera únicamente las compras del usuario autenticado y navega al detalle de cada
            pedido.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/profile')}
          >
            Mi perfil
          </button>
          <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </header>

      <div className={styles.list}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onOpen={(orderId) => navigate(`/user/orders/${orderId}`)}
          />
        ))}
      </div>
    </section>
  );
}

export default UserOrders;
