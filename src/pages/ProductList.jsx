import { useEffect, useMemo, useState } from 'react';

import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import useCart from '../hooks/useCart';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import styles from '../styles/ProductList.module.css';

function ProductList() {
  const { addToCart, cartItems } = useCart();
  const [productsState, setProductsState] = useState([]);
  const [categoriesState, setCategoriesState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const [products, categories] = await Promise.all([
          productService.getProductsAsync({ activeOnly: true }),
          categoryService.getCategoriesAsync(),
        ]);

        if (isMounted) {
          setProductsState(products);
          setCategoriesState(categories);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error && error.message
              ? error.message
              : 'No fue posible cargar el catálogo.'
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCatalog();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(
    () =>
      categoriesState.sort((leftCategory, rightCategory) =>
        leftCategory.name.localeCompare(rightCategory.name)
      ),
    [categoriesState]
  );

  const cartQuantityByProductId = useMemo(
    () => new Map(cartItems.map((item) => [item.id, item.quantity])),
    [cartItems]
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return productsState.filter((product) => {
      if (product.isActive === false) {
        return false;
      }

      const productCategoryId = String(product.categoryId ?? '');
      const productStock = Number(product.stockQty ?? product.stock ?? 0);
      const matchesCategory = selectedCategory === 'all' || productCategoryId === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        String(product.name ?? '')
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery && (product.isAvailable ?? productStock > 0);
    });
  }, [productsState, query, selectedCategory]);

  const handleOpenDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Catalogo de productos</h1>
        <p className={styles.subtitle}>
          Explora todo el inventario disponible y agrega productos al carrito desde una vista
          general.
        </p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre..."
            type="search"
          />

          <select
            className={styles.select}
            disabled={isLoading}
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="all">Todas las categorias</option>
            {categories.map((category) => (
              <option key={category.id || category.slug} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.emptyState}>
          <p>Cargando catálogo...</p>
        </div>
      ) : loadError ? (
        <div className={styles.emptyState}>
          <p>{loadError}</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No hay productos que coincidan con los filtros actuales.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              categoryName={product.categoryName}
              price={product.price}
              rating={product.rating}
              stock={product.stock}
              stockQty={product.stockQty}
              isActive={product.isActive}
              isAvailable={product.isAvailable}
              image={product.image}
              description={product.description}
              onAddToCart={addToCart}
              onDetails={() => handleOpenDetails(product)}
              disableAddToCart={(cartQuantityByProductId.get(product.id) ?? 0) >= product.stockQty}
            />
          ))}
        </div>
      )}

      <ProductDetailsModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleCloseDetails}
      />
    </div>
  );
}

export default ProductList;
