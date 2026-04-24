import { loadProducts, saveProducts } from '../utils/productsStorage';

const normalizeId = (value) => Number(value);
const toAsyncResult = (callback) => Promise.resolve().then(callback);

const normalizeProductInput = (product, currentProducts = []) => {
  const normalizedId = normalizeId(product?.id);
  const existingProduct = currentProducts.find((item) => item.id === normalizedId);
  const categoryName = String(product?.categoryName ?? product?.category ?? '').trim();
  const stockQty = Number(product?.stockQty ?? product?.stock);
  const normalizedStockQty = Number.isFinite(stockQty) && stockQty >= 0 ? Math.floor(stockQty) : 0;
  const isActive = Boolean(product?.isActive ?? existingProduct?.isActive ?? true);

  return {
    ...existingProduct,
    ...product,
    categoryId: Number(product?.categoryId ?? existingProduct?.categoryId ?? 0) || undefined,
    categoryName,
    category: categoryName,
    stockQty: normalizedStockQty,
    stock: normalizedStockQty,
    isActive,
    isAvailable: Boolean((product?.isAvailable ?? normalizedStockQty > 0) && isActive),
  };
};

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

  return persistProducts([
    ...currentProducts,
    normalizeProductInput({ ...product, id: maxId + 1 }, currentProducts),
  ]);
}

function updateProduct(updatedProduct, currentProducts = getProducts()) {
  return persistProducts(
    currentProducts.map((product) =>
      product.id === updatedProduct.id
        ? normalizeProductInput({ ...product, ...updatedProduct }, currentProducts)
        : product
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
