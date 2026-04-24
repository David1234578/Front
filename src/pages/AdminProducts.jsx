import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import ProductForm from '../components/ProductForm';
import productService from '../services/productService';
import adminStyles from '../styles/AdminProducts.module.css';
import productListStyles from '../styles/ProductList.module.css';

function AdminProducts() {
  const navigate = useNavigate();
  const [productsState, setProductsState] = useState(productService.getProducts);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return productsState.filter((product) => {
      if (!normalizedQuery) {
        return true;
      }

      return [product.name, product.category, product.description].some((field) =>
        String(field ?? '')
          .toLowerCase()
          .includes(normalizedQuery)
      );
    });
  }, [productsState, query]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  const handleAddProduct = (product) => {
    setProductsState((currentProducts) => productService.createProduct(product, currentProducts));

    handleCloseForm();
  };

  const handleDeleteProduct = (productId) => {
    setProductsState((currentProducts) => productService.deleteProduct(productId, currentProducts));

    if (editingProduct?.id === productId) {
      handleCloseForm();
    }
  };

  const handleEditStart = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleEditSubmit = (updatedProduct) => {
    setProductsState((currentProducts) =>
      productService.updateProduct(updatedProduct, currentProducts)
    );
    handleCloseForm();
  };

  return (
    <section className={adminStyles.container}>
      <header className={adminStyles.header}>
        <div>
          <p className={adminStyles.eyebrow}>Semana 12</p>
          <h1 className={adminStyles.title}>Gestión de productos</h1>
          <p className={adminStyles.subtitle}>
            Solo los administradores pueden crear, editar y eliminar productos del catálogo.
          </p>
        </div>

        <div className={adminStyles.actions}>
          <button
            type="button"
            className={adminStyles.secondaryButton}
            onClick={() => navigate('/admin')}
          >
            Volver al panel
          </button>
          <button
            type="button"
            className={adminStyles.primaryButton}
            onClick={() => navigate('/products')}
          >
            Ver catálogo público
          </button>
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
          <div className={productListStyles.toolbar}>
            <div className={productListStyles.filters}>
              <input
                className={productListStyles.searchInput}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre, categoría o descripción..."
                type="search"
              />
            </div>

            <button className={productListStyles.btnAdd} type="button" onClick={handleOpenCreate}>
              Agregar producto
            </button>
          </div>

          {filteredProducts.length === 0 ? (
            <div className={productListStyles.emptyState}>
              <p>No hay productos que coincidan con la búsqueda actual.</p>
            </div>
          ) : (
            <div className={productListStyles.grid}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  rating={product.rating}
                  stock={product.stock}
                  image={product.image}
                  description={product.description}
                  onDelete={() => handleDeleteProduct(product.id)}
                  onEdit={() => handleEditStart(product)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default AdminProducts;
