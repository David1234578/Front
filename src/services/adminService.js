import authService from './authService';
import orderService from './orderService';
import productService from './productService';

function getDashboardSnapshot() {
  return {
    products: productService.getProducts(),
    orders: orderService.getOrders(),
    users: authService.listUsers(),
  };
}

async function getDashboardSnapshotAsync() {
  const [products, orders] = await Promise.all([
    productService.getProductsAsync(),
    orderService.getOrdersAsync(),
  ]);

  return {
    products,
    orders,
    users: authService.listUsers(),
  };
}

const adminService = {
  getDashboardSnapshot,
  getDashboardSnapshotAsync,
};

export { adminService };
export default adminService;
