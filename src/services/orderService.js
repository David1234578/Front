import { loadOrders, loadOrdersByUserId, saveOrder } from '../utils/ordersStorage';

const createLocalOrderId = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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

const orderService = {
  createOrder,
  getOrderByIdForUser,
  getOrders,
  getOrdersByUserId,
};

export { orderService };
export default orderService;
