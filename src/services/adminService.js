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

const adminService = {
  getDashboardSnapshot,
};

export { adminService };
export default adminService;
