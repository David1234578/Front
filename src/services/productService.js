import { loadProducts, saveProducts } from '../utils/productsStorage';

const normalizeId = (value) => Number(value);

function getProducts() {
  return loadProducts();
}

function getProductById(productId) {
  const normalizedId = normalizeId(productId);
  return getProducts().find((product) => product.id === normalizedId) ?? null;
}

function persistProducts(products) {
  return saveProducts(products);
}

function createProduct(product, currentProducts = getProducts()) {
  const maxId = currentProducts.reduce(
    (accumulator, item) => Math.max(accumulator, normalizeId(item.id) || 0),
    0
  );

  return persistProducts([...currentProducts, { ...product, id: maxId + 1 }]);
}

function updateProduct(updatedProduct, currentProducts = getProducts()) {
  return persistProducts(
    currentProducts.map((product) =>
      product.id === updatedProduct.id ? { ...product, ...updatedProduct } : product
    )
  );
}

function deleteProduct(productId, currentProducts = getProducts()) {
  const normalizedId = normalizeId(productId);
  return persistProducts(currentProducts.filter((product) => product.id !== normalizedId));
}

const productService = {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  persistProducts,
  updateProduct,
};

export { productService };
export default productService;
