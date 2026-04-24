import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import adminService from '../services/adminService';
import styles from '../styles/AdminDashboard.module.css';
import { formatCOP } from '../utils/formatCOP';

function AdminDashboard() {
  const navigate = useNavigate();
  const { products, orders, users } = useMemo(() => adminService.getDashboardSnapshot(), []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((total, order) => total + (order.totals?.total ?? 0), 0);

    return {
      totalProducts: products.length,
      lowStockProducts: products.filter((product) => Number(product.stock) <= 5).length,
      totalOrders: orders.length,
      totalRevenue: formatCOP(totalRevenue),
      totalUsers: users.length,
      adminUsers: users.filter((user) => user.role === 'admin').length,
    };
  }, [orders, products, users]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);
  const recentUsers = useMemo(() => users.slice(0, 5), [users]);

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 12</p>
          <h1 className={styles.title}>Panel administrativo</h1>
          <p className={styles.subtitle}>
            Esta vista concentra métricas rápidas del sistema y abre la gestión de productos solo
            para usuarios con rol administrador.
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={() => navigate('/')}>
            Ir a tienda
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => navigate('/admin/products')}
          >
            Gestionar productos
          </button>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Productos activos</span>
          <strong>{stats.totalProducts}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Productos con bajo stock</span>
          <strong>{stats.lowStockProducts}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Órdenes registradas</span>
          <strong>{stats.totalOrders}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Ingresos acumulados</span>
          <strong>{stats.totalRevenue}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Usuarios registrados</span>
          <strong>{stats.totalUsers}</strong>
        </article>
        <article className={styles.statCard}>
          <span className={styles.statLabel}>Usuarios admin</span>
          <strong>{stats.adminUsers}</strong>
        </article>
      </div>

      <div className={styles.layout}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Órdenes recientes</h2>
            <span className={styles.helper}>Últimas 5 órdenes guardadas</span>
          </div>

          {recentOrders.length === 0 ? (
            <p className={styles.emptyText}>Todavía no hay órdenes registradas en el sistema.</p>
          ) : (
            <div className={styles.list}>
              {recentOrders.map((order) => (
                <article key={order.id} className={styles.listItem}>
                  <div>
                    <strong>{order.id}</strong>
                    <span>{order.customer.fullName || 'Cliente sin nombre'}</span>
                  </div>
                  <div className={styles.listMeta}>
                    <span>{new Date(order.createdAt).toLocaleDateString('es-CO')}</span>
                    <strong>{formatCOP(order.totals.total)}</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Usuarios recientes</h2>
            <span className={styles.helper}>Incluye el administrador demo</span>
          </div>

          {recentUsers.length === 0 ? (
            <p className={styles.emptyText}>No hay usuarios registrados.</p>
          ) : (
            <div className={styles.list}>
              {recentUsers.map((user) => (
                <article key={user.id} className={styles.listItem}>
                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <span className={styles.roleBadge}>
                    {user.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

export default AdminDashboard;
