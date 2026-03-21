import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from '../styles/Cart.module.css';
import { clearCart, loadCart, removeFromCart, updateCartItemQuantity } from '../utils/cartStorage';

const copCurrencyFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const formatCOP = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? copCurrencyFormatter.format(amount) : 'COP 0';
};

function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncCart = () => {
      setItems(loadCart());
    };

    window.addEventListener('storage', syncCart);
    window.addEventListener('cart:changed', syncCart);

    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('cart:changed', syncCart);
    };
  }, []);

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

  const handleIncrease = (item) => {
    setItems(updateCartItemQuantity(item.id, item.quantity + 1));
  };

  const handleDecrease = (item) => {
    if (item.quantity <= 1) {
      setItems(removeFromCart(item.id));
      return;
    }

    setItems(updateCartItemQuantity(item.id, item.quantity - 1));
  };

  const handleRemove = (productId) => {
    setItems(removeFromCart(productId));
  };

  const handleClearCart = () => {
    setItems(clearCart());
  };

  return (
    <section className={styles.cartSection}>
      <header className={styles.hero}>
        <p className={styles.kicker}>Resumen de compra</p>
        <h1 className={styles.title}>Tu carrito</h1>
        <p className={styles.subtitle}>
          Gestiona cantidades, revisa totales y deja lista tu orden con una vista clara y rápida.
        </p>
      </header>

      {items.length === 0 ? (
        <article className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>Aún no tienes productos en el carrito</h2>
          <p className={styles.emptyText}>
            Ve a Productos o Categorías y usa el botón Agregar al carrito para empezar tu compra.
          </p>
        </article>
      ) : (
        <div className={styles.layout}>
          <article className={styles.itemsPanel}>
            <div className={styles.itemsHeader}>
              <h2 className={styles.panelTitle}>Productos seleccionados</h2>
              <p className={styles.panelMeta}>
                {totals.units} {totals.units === 1 ? 'unidad' : 'unidades'}
              </p>
            </div>

            <div className={styles.itemsList}>
              {items.map((item) => {
                const stockLabel = item.stock > 0 ? `Stock: ${item.stock}` : 'Sin stock';

                return (
                  <article key={item.id} className={styles.cartItem}>
                    <img className={styles.itemImage} src={item.image} alt={item.name} />

                    <div className={styles.itemInfo}>
                      <p className={styles.itemCategory}>{item.category}</p>
                      <h3 className={styles.itemName}>{item.name}</h3>
                      <p className={styles.itemPrice}>Precio unidad: {formatCOP(item.price)}</p>
                      <p className={styles.itemStock}>{stockLabel}</p>
                    </div>

                    <div className={styles.itemActions}>
                      <div className={styles.qtyControl}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => handleDecrease(item)}
                          aria-label={`Disminuir cantidad de ${item.name}`}
                        >
                          -
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => handleIncrease(item)}
                          disabled={item.stock > 0 && item.quantity >= item.stock}
                          aria-label={`Aumentar cantidad de ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <p className={styles.itemTotal}>{formatCOP(item.price * item.quantity)}</p>

                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => handleRemove(item.id)}
                      >
                        Quitar
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </article>

          <aside className={styles.summaryPanel}>
            <h2 className={styles.panelTitle}>Resumen</h2>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <strong>{formatCOP(totals.subtotal)}</strong>
              </div>

              <div className={styles.summaryRow}>
                <span>Envío</span>
                <strong>{totals.shipping === 0 ? 'Gratis' : formatCOP(totals.shipping)}</strong>
              </div>

              <div className={styles.summaryRow}>
                <span>IVA (19%)</span>
                <strong>{formatCOP(totals.tax)}</strong>
              </div>

              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <strong>{formatCOP(totals.total)}</strong>
              </div>
            </div>

            <button
              type="button"
              className={styles.checkoutBtn}
              onClick={() => navigate('/checkout')}
            >
              Proceder al pago
            </button>

            <button type="button" className={styles.clearBtn} onClick={handleClearCart}>
              Vaciar carrito
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

export default Cart;