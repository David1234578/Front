import { useMemo, useState } from 'react';

import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import useCart from '../hooks/useCart';
import productService from '../services/productService';
import styles from '../styles/ProductList.module.css';

function ProductList() {
  const { addToCart, cartItems } = useCart();
  const [productsState] = useState(productService.getProducts);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(productsState.map((product) => product.categoryName ?? product.category))
      ).sort(),
    [productsState]
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

      const productCategory = product.categoryName ?? product.category;
      const productStock = Number(product.stockQty ?? product.stock ?? 0);
      const matchesCategory = selectedCategory === 'all' || productCategory === selectedCategory;
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
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="all">Todas las categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
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
