import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ChangePasswordForm from '../components/ChangePasswordForm';
import UserProfileForm from '../components/UserProfileForm';
import useAuth from '../hooks/useAuth';
import orderService from '../services/orderService';
import styles from '../styles/UserProfile.module.css';
import { formatCOP } from '../utils/formatCOP';

function UserProfile() {
  const navigate = useNavigate();
  const { changePassword, currentUser, updateProfile } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const orders = useMemo(() => orderService.getOrdersByUserId(currentUser?.id), [currentUser?.id]);
  const latestOrder = orders[0] ?? null;

  const profile = {
    name: currentUser?.name || 'Invitado',
    email: currentUser?.email || 'Sin correo registrado',
    role: currentUser?.role === 'admin' ? 'Administrador' : 'Cliente',
    phone: currentUser?.phone || 'Sin telefono registrado',
    address: currentUser?.address || 'Aun no hay direccion registrada',
    city: currentUser?.city || 'Sin ciudad registrada',
    postalCode: currentUser?.postalCode || '---',
  };

  const stats = {
    totalOrders: orders.length,
    latestOrderId: latestOrder?.id ?? 'Sin compras',
    latestTotal: latestOrder ? formatCOP(latestOrder.totals.total) : 'Sin compras',
  };

  const handleStartEdit = () => {
    setProfileError('');
    setProfileSuccess('');
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setProfileError('');
    setIsEditingProfile(false);
  };

  const handleProfileSubmit = async (updates) => {
    setIsSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const result = await updateProfile(updates);

      if (!result.ok) {
        setProfileError(result.error ?? 'No fue posible actualizar el perfil.');
        return result;
      }

      setIsEditingProfile(false);
      setProfileSuccess('Tus datos de perfil fueron actualizados correctamente.');
      return result;
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async ({ currentPassword, newPassword }) => {
    setIsChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const result = await changePassword(currentPassword, newPassword);

      if (!result.ok) {
        setPasswordError(result.error ?? 'No fue posible cambiar la contraseña.');
        return result;
      }

      setPasswordSuccess('La contraseña fue actualizada correctamente.');
      return result;
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 15</p>
          <h1 className={styles.title}>Mi cuenta</h1>
          <p className={styles.subtitle}>
            Esta vista centraliza la sesión autenticada, permite editar el perfil y agrega un cambio
            de contraseña controlado desde la cuenta actual.
          </p>
        </div>

        <div className={styles.headerActions}>
          {currentUser?.role === 'admin' ? (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate('/admin')}
            >
              Ir al panel admin
            </button>
          ) : null}
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => navigate('/user/orders')}
          >
            Ver historial
          </button>
          <button type="button" className={styles.primaryButton} onClick={() => navigate('/')}>
            Volver al inicio
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.accountColumn}>
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Datos del perfil</h2>
                <p className={styles.sectionText}>
                  Puedes actualizar tus datos personales desde esta misma sección. El correo y el
                  rol permanecen solo lectura.
                </p>
              </div>

              {!isEditingProfile ? (
                <button type="button" className={styles.secondaryButton} onClick={handleStartEdit}>
                  Editar perfil
                </button>
              ) : null}
            </div>

            {profileSuccess ? <p className={styles.successBanner}>{profileSuccess}</p> : null}

            {isEditingProfile ? (
              <UserProfileForm
                email={profile.email}
                initialValues={currentUser}
                isSubmitting={isSavingProfile}
                onCancel={handleCancelEdit}
                onSubmit={handleProfileSubmit}
                roleLabel={profile.role}
                submitError={profileError}
              />
            ) : (
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Nombre</span>
                  <strong>{profile.name}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Correo</span>
                  <strong>{profile.email}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Rol</span>
                  <strong>{profile.role}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Telefono</span>
                  <strong>{profile.phone}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Direccion</span>
                  <strong>{profile.address}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Ciudad</span>
                  <strong>{profile.city}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Codigo postal</span>
                  <strong>{profile.postalCode}</strong>
                </div>
              </div>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeaderCompact}>
              <div>
                <h2 className={styles.sectionTitle}>Seguridad de la cuenta</h2>
                <p className={styles.sectionText}>
                  Cambia tu contraseña desde la sesión actual. La recuperación por correo queda para
                  una etapa con backend real.
                </p>
              </div>
            </div>

            <ChangePasswordForm
              isSubmitting={isChangingPassword}
              onSubmit={handlePasswordSubmit}
              submitError={passwordError}
              submitSuccess={passwordSuccess}
            />
          </section>
        </div>

        <aside className={styles.card}>
          <h2 className={styles.sectionTitle}>Resumen de compras</h2>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.label}>Ordenes guardadas</span>
              <strong>{stats.totalOrders}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.label}>Ultima orden</span>
              <strong>{stats.latestOrderId}</strong>
            </div>
            <div className={styles.statCard}>
              <span className={styles.label}>Ultimo total</span>
              <strong>{stats.latestTotal}</strong>
            </div>
          </div>

          {latestOrder ? (
            <div className={styles.latestOrder}>
              <p className={styles.latestOrderText}>
                Tu compra mas reciente fue enviada con{' '}
                <strong>{latestOrder.shippingMethod.label}</strong> y pagada con{' '}
                <strong>{latestOrder.paymentMethod.label}</strong>.
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate(`/user/orders/${latestOrder.id}`)}
              >
                Abrir ultima orden
              </button>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>
                Aun no hay compras registradas. Cuando completes el checkout, el historial quedara
                disponible desde esta seccion.
              </p>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default UserProfile;
