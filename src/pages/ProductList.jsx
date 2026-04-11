import { useEffect, useState } from 'react';

import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import styles from '../styles/ProductList.module.css';
import { loadProducts, PRODUCTS_STORAGE_KEY } from '../utils/productsStorage';

const STORAGE_KEY = PRODUCTS_STORAGE_KEY;

function ProductList() {
  const [productsState, setProductsState] = useState(loadProducts);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(productsState));
    } catch (error) {
      void error;
    }
  }, [productsState]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  const handleAddProduct = (product) => {
    setProductsState((prev) => {
      const maxId = prev.reduce((acc, item) => Math.max(acc, item.id), 0);
      const nextId = maxId + 1;

      return [...prev, { ...product, id: nextId }];
    });

    handleCloseForm();
  };

  const handleDeleteProduct = (id) => {
    setProductsState((prev) => prev.filter((product) => product.id !== id));

    if (editingProduct?.id === id) {
      handleCloseForm();
    }
  };

  const handleEditStart = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleEditSubmit = (updatedProduct) => {
    setProductsState((prev) =>
      prev.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
    );
    handleCloseForm();
  };

  const filteredProducts = productsState.filter((product) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

    return String(product.name ?? '').toLowerCase().includes(q);
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Gestión de catálogo</h1>
        <p className={styles.subtitle}>
          Administra inventario, edita fichas y mantén actualizado el catálogo de la tienda.
        </p>

        <div className={styles.statsRow}>
          <article className={styles.statCard}>
            <span>Total productos</span>
            <strong>{productsState.length}</strong>
          </article>
          <article className={styles.statCard}>
            <span>Con stock</span>
            <strong>{productsState.filter((item) => Number(item.stock) > 0).length}</strong>
          </article>
          <article className={styles.statCard}>
            <span>Sin stock</span>
            <strong>{productsState.filter((item) => Number(item.stock) <= 0).length}</strong>
          </article>
        </div>
      </header>

      {isFormOpen ? (
        <ProductForm
          initialValues={editingProduct}
          isEditing={Boolean(editingProduct)}
          onCancel={handleCloseForm}
          onSubmit={editingProduct ? handleEditSubmit : handleAddProduct}
        />
      ) : (
        <>
          <div className={styles.toolbarPanel}>
            <input
              className={styles.searchInput}
              placeholder="Buscar producto por nombre..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />

            <p className={styles.resultsText}>
              {filteredProducts.length} resultado{filteredProducts.length === 1 ? '' : 's'}
            </p>

            <button className={styles.btnAdd} type="button" onClick={handleOpenCreate}>
              Agregar producto
            </button>
          </div>

          <div className={styles.grid}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                category={product.category}
                price={product.price}
                rating={product.rating}
                stock={product.stock}
                image={product.image}
                description={product.description}
                showDescription={false}
                onDelete={() => handleDeleteProduct(product.id)}
                onEdit={() => handleEditStart(product)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <p className={styles.emptyNotice}>No hay productos que coincidan con tu búsqueda.</p>
          ) : null}
        </>
      )}
    </div>
  );
}

export default ProductList;