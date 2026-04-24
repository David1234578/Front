import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AddressForm from '../components/AddressForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import UserProfileForm from '../components/UserProfileForm';
import useAuth from '../hooks/useAuth';
import addressService from '../services/addressService';
import orderService from '../services/orderService';
import styles from '../styles/UserProfile.module.css';
import { formatCOP } from '../utils/formatCOP';

const formatCreatedAt = (value) => {
  if (!value) {
    return 'Sin fecha registrada';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sin fecha registrada';
  }

  return parsedDate.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

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
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addressError, setAddressError] = useState('');
  const [addressSuccess, setAddressSuccess] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const latestOrder = orders[0] ?? null;

  const profile = {
    fullName: currentUser?.fullName || currentUser?.name || 'Invitado',
    firstName: currentUser?.firstName || 'Sin nombre registrado',
    lastName: currentUser?.lastName || 'Sin apellido registrado',
    email: currentUser?.email || 'Sin correo registrado',
    role: currentUser?.role === 'ADMIN' ? 'Administrador' : 'Cliente',
    phone: currentUser?.phone || 'Sin telefono registrado',
    status: currentUser?.status === 'ACTIVE' ? 'Activa' : currentUser?.status || 'Sin estado',
    createdAt: formatCreatedAt(currentUser?.createdAt),
  };

  const stats = {
    totalOrders: orders.length,
    latestOrderId: latestOrder?.id ?? 'Sin compras',
    latestTotal: latestOrder ? formatCOP(latestOrder.totals.total) : 'Sin compras',
  };

  useEffect(() => {
    let isMounted = true;

    const loadAddresses = async () => {
      try {
        const nextAddresses = await addressService.getAddressesByUserIdAsync(currentUser?.id);

        if (isMounted) {
          setAddresses(nextAddresses);
        }
      } catch (error) {
        if (isMounted) {
          setAddressError(
            error instanceof Error && error.message
              ? error.message
              : 'No fue posible cargar las direcciones de la cuenta.'
          );
        }
      }
    };

    loadAddresses();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setOrdersError('');

      try {
        const nextOrders = await orderService.getOrdersByUserIdAsync(currentUser?.id);

        if (isMounted) {
          setOrders(
            [...nextOrders].sort(
              (leftOrder, rightOrder) =>
                new Date(rightOrder.createdAt) - new Date(leftOrder.createdAt)
            )
          );
        }
      } catch (error) {
        if (isMounted) {
          setOrdersError(
            error instanceof Error && error.message
              ? error.message
              : 'No fue posible cargar el resumen de compras.'
          );
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  const refreshAddresses = async () => {
    const nextAddresses = await addressService.getAddressesByUserIdAsync(currentUser?.id);
    setAddresses(nextAddresses);
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

  const handleStartCreateAddress = () => {
    setAddressError('');
    setAddressSuccess('');
    setEditingAddress(null);
    setIsEditingAddress(true);
  };

  const handleStartEditAddress = (address) => {
    setAddressError('');
    setAddressSuccess('');
    setEditingAddress(address);
    setIsEditingAddress(true);
  };

  const handleCancelAddress = () => {
    setAddressError('');
    setEditingAddress(null);
    setIsEditingAddress(false);
  };

  const handleAddressSubmit = async (addressValues) => {
    setIsSavingAddress(true);
    setAddressError('');
    setAddressSuccess('');

    try {
      const savedAddress = await addressService.saveUserAddressAsync(
        currentUser?.id,
        addressValues
      );

      if (!savedAddress) {
        setAddressError('No fue posible guardar la dirección.');
        return { ok: false };
      }

      refreshAddresses();
      setIsEditingAddress(false);
      setEditingAddress(null);
      setAddressSuccess('La dirección fue guardada correctamente.');
      return { ok: true };
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    setAddressError('');
    setAddressSuccess('');

    try {
      await addressService.deleteUserAddressAsync(currentUser?.id, addressId);
      refreshAddresses();
      setAddressSuccess('La dirección fue eliminada correctamente.');
    } catch (error) {
      setAddressError(
        error instanceof Error && error.message
          ? error.message
          : 'No fue posible eliminar la dirección.'
      );
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    setAddressError('');
    setAddressSuccess('');

    try {
      await addressService.setUserDefaultAddressAsync(currentUser?.id, addressId);
      refreshAddresses();
      setAddressSuccess('La dirección predeterminada fue actualizada.');
    } catch (error) {
      setAddressError(
        error instanceof Error && error.message
          ? error.message
          : 'No fue posible actualizar la dirección predeterminada.'
      );
    }
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Semana 15</p>
          <h1 className={styles.title}>Mi cuenta</h1>
          <p className={styles.subtitle}>
            Esta vista centraliza la sesión autenticada, permite editar la identidad del usuario y
            mantiene el cambio de contraseña alineado con el contrato actual del backend.
          </p>
        </div>

        <div className={styles.headerActions}>
          {currentUser?.role === 'ADMIN' ? (
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
                  Puedes actualizar nombre, apellido y teléfono. El correo, el rol y el estado se
                  mantienen solo lectura. Las direcciones se moverán a su propio recurso.
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
                  <span className={styles.label}>Nombre completo</span>
                  <strong>{profile.fullName}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Nombre</span>
                  <strong>{profile.firstName}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Apellido</span>
                  <strong>{profile.lastName}</strong>
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
                  <span className={styles.label}>Estado de cuenta</span>
                  <strong>{profile.status}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Creada el</span>
                  <strong>{profile.createdAt}</strong>
                </div>
              </div>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeaderCompact}>
              <div>
                <h2 className={styles.sectionTitle}>Seguridad de la cuenta</h2>
                <p className={styles.sectionText}>
                  Cambia tu contraseña desde la sesión actual. El backend responde con éxito sin
                  payload y la sesión vigente se mantiene activa.
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

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>Direcciones</h2>
                <p className={styles.sectionText}>
                  Gestiona las direcciones que luego se usarán en checkout como envío y facturación.
                </p>
              </div>

              {!isEditingAddress ? (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleStartCreateAddress}
                >
                  Agregar dirección
                </button>
              ) : null}
            </div>

            {addressSuccess ? <p className={styles.successBanner}>{addressSuccess}</p> : null}
            {addressError ? <p className={styles.errorBanner}>{addressError}</p> : null}

            {isEditingAddress ? (
              <AddressForm
                initialValues={editingAddress}
                isSubmitting={isSavingAddress}
                onCancel={handleCancelAddress}
                onSubmit={handleAddressSubmit}
                submitError={addressError}
              />
            ) : addresses.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>
                  Aún no tienes direcciones guardadas. Crea al menos una para preparar el checkout.
                </p>
              </div>
            ) : (
              <div className={styles.addressList}>
                {addresses.map((address) => (
                  <article key={address.id} className={styles.addressCard}>
                    <div className={styles.addressHeader}>
                      <div>
                        <strong>{address.type === 'BILLING' ? 'Facturación' : 'Envío'}</strong>
                        {address.isDefault ? (
                          <span className={styles.addressBadge}>Predeterminada</span>
                        ) : null}
                      </div>
                      <div className={styles.addressActions}>
                        {!address.isDefault ? (
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => handleSetDefaultAddress(address.id)}
                          >
                            Usar por defecto
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={() => handleStartEditAddress(address)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div className={styles.addressBody}>
                      <p>{address.line1}</p>
                      {address.line2 ? <p>{address.line2}</p> : null}
                      <p>
                        {address.city}, {address.state}
                      </p>
                      <p>
                        {address.country} - {address.postalCode}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className={styles.card}>
          <h2 className={styles.sectionTitle}>Resumen de compras</h2>

          {ordersError ? <p className={styles.errorBanner}>{ordersError}</p> : null}

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
                Tu compra más reciente quedó registrada como{' '}
                <strong>{latestOrder.orderNumber || latestOrder.id}</strong> con estado{' '}
                <strong>{latestOrder.status}</strong>.
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
