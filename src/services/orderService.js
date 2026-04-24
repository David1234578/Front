import { loadOrders, loadOrdersByUserId, saveOrder } from '../utils/ordersStorage';

const createLocalOrderId = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const toAsyncResult = (callback) => Promise.resolve().then(callback);

function getOrders() {
  return loadOrders();
}

function getOrdersByUserId(userId) {
  return loadOrdersByUserId(userId);
}

function getOrderByIdForUser(userId, orderId) {
  return getOrdersByUserId(userId).find((order) => order.id === orderId) ?? null;
}

function createOrder(order) {
  return saveOrder({
    ...order,
    id: String(order?.id ?? createLocalOrderId()),
    status: String(order?.status ?? 'confirmed'),
    createdAt: order?.createdAt ?? new Date().toISOString(),
  });
}

function getOrdersAsync() {
  return toAsyncResult(() => getOrders());
}

function getOrdersByUserIdAsync(userId) {
  return toAsyncResult(() => getOrdersByUserId(userId));
}

function getOrderByIdForUserAsync(userId, orderId) {
  return toAsyncResult(() => getOrderByIdForUser(userId, orderId));
}

function createOrderAsync(order) {
  return toAsyncResult(() => createOrder(order));
}

const orderService = {
  createOrder,
  createOrderAsync,
  getOrderByIdForUser,
  getOrderByIdForUserAsync,
  getOrders,
  getOrdersAsync,
  getOrdersByUserId,
  getOrdersByUserIdAsync,
};

export { orderService };
export default orderService;
