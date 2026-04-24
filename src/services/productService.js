import { loadProducts, saveProducts } from '../utils/productsStorage';

const normalizeId = (value) => Number(value);
const toAsyncResult = (callback) => Promise.resolve().then(callback);

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

function getProductsAsync() {
  return toAsyncResult(() => getProducts());
}

function createProductAsync(product, currentProducts = getProducts()) {
  return toAsyncResult(() => createProduct(product, currentProducts));
}

function updateProductAsync(updatedProduct, currentProducts = getProducts()) {
  return toAsyncResult(() => updateProduct(updatedProduct, currentProducts));
}

function deleteProductAsync(productId, currentProducts = getProducts()) {
  return toAsyncResult(() => deleteProduct(productId, currentProducts));
}

const productService = {
  createProduct,
  createProductAsync,
  deleteProduct,
  deleteProductAsync,
  getProductById,
  getProducts,
  getProductsAsync,
  persistProducts,
  updateProduct,
  updateProductAsync,
};

export { productService };
export default productService;
