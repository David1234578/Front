const ORDERS_STORAGE_KEY = 'orders';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeOrder = (order) => ({
  id: String(order?.id ?? ''),
  userId: Number(order?.userId) || 0,
  createdAt: String(order?.createdAt ?? new Date().toISOString()),
  paymentMethod: String(order?.paymentMethod ?? ''),
  shippingAddress: String(order?.shippingAddress ?? ''),
  city: String(order?.city ?? ''),
  notes: String(order?.notes ?? ''),
  items: Array.isArray(order?.items)
    ? order.items.map((item) => ({
        id: toNumber(item?.id),
        name: String(item?.name ?? 'Producto'),
        image: String(item?.image ?? ''),
        price: Math.max(0, toNumber(item?.price)),
        quantity: Math.max(1, Math.floor(toNumber(item?.quantity, 1))),
      }))
    : [],
  totals: {
    subtotal: Math.max(0, toNumber(order?.totals?.subtotal)),
    shipping: Math.max(0, toNumber(order?.totals?.shipping)),
    tax: Math.max(0, toNumber(order?.totals?.tax)),
    total: Math.max(0, toNumber(order?.totals?.total)),
  },
});

const canUseStorage = () => typeof window !== 'undefined';

export function loadOrders() {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeOrder).filter((order) => order.id && order.userId > 0);
  } catch {
    return [];
  }
}

export function saveOrders(orders) {
  if (!canUseStorage()) {
    return [];
  }

  const normalizedOrders = Array.isArray(orders) ? orders.map(normalizeOrder) : [];
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(normalizedOrders));
  return normalizedOrders;
}

export function saveOrder(order) {
  const normalized = normalizeOrder(order);
  const current = loadOrders();
  return saveOrders([normalized, ...current]);
}

export function getOrdersByUserId(userId) {
  const targetId = Number(userId) || 0;
  if (targetId <= 0) {
    return [];
  }

  return loadOrders()
    .filter((order) => order.userId === targetId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getOrderById(orderId) {
  const targetId = String(orderId ?? '').trim();
  if (!targetId) {
    return null;
  }

  return loadOrders().find((order) => order.id === targetId) ?? null;
}

export { ORDERS_STORAGE_KEY };
