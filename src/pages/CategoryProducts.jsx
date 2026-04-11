import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import styles from '../styles/CategoryProducts.module.css';
import productListStyles from '../styles/ProductList.module.css';
import { addToCart } from '../utils/cartStorage';
import { loadProducts } from '../utils/productsStorage';

function CategoryProducts({ user }) {
  const navigate = useNavigate();
  const { categoryName } = useParams();
  const category = decodeURIComponent(String(categoryName ?? ''));
  const canBuy = user?.role !== 'admin';
  const [query, setQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productsState] = useState(loadProducts);
  const [sortBy, setSortBy] = useState('name');

  const filteredProducts = useMemo(() => {
    if (!category) return [];

    const q = query.trim().toLowerCase();

    const base = productsState.filter((product) => {
      if (product.category !== category) return false;
      if (!q) return true;

      return String(product.name ?? '')
        .toLowerCase()
        .includes(q);
    });

    if (sortBy === 'price-desc') {
      return [...base].sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortBy === 'price-asc') {
      return [...base].sort((a, b) => Number(a.price) - Number(b.price));
    }

    return [...base].sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
  }, [category, productsState, query, sortBy]);

  const handleOpenDetails = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.headerTop}>
            <button type="button" className={styles.btnBack} onClick={() => navigate('/')}>
              Volver
            </button>

            <p className={styles.resultsMeta}>{filteredProducts.length} productos</p>
          </div>

          <h1 className={styles.title}>{category ?? 'Categoría'}</h1>
          <p className={styles.subtitle}>Explora la categoría y compara productos según precio o nombre.</p>

          <div className={styles.toolsRow}>
            <input
              className={styles.input}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre..."
            />

            <select
              className={styles.select}
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="name">Ordenar: Nombre</option>
              <option value="price-asc">Precio: Menor a mayor</option>
              <option value="price-desc">Precio: Mayor a menor</option>
            </select>
          </div>
        </div>

        <aside className={styles.sidePanel}>
          <h2 className={styles.sideTitle}>Compra con confianza</h2>
          <ul className={styles.sideList}>
            <li>Stock visible en cada producto</li>
            <li>Precios claros por unidad</li>
            <li>Detalles rápidos desde la misma vista</li>
          </ul>
        </aside>
      </header>

      {!category ? (
        <p className={styles.empty}>Selecciona una categoría desde Inicio.</p>
      ) : filteredProducts.length === 0 ? (
        <p className={styles.empty}>No hay productos para mostrar.</p>
      ) : (
        <div className={productListStyles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              category={product.category}
              rating={product.rating}
              price={product.price}
              stock={product.stock}
              image={product.image}
              description={product.description}
              onDetails={() => handleOpenDetails(product)}
              onAddToCart={canBuy ? () => handleAddToCart(product) : undefined}
            />
          ))}
        </div>
      )}

      <ProductDetailsModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleCloseDetails}
      />
    </section>
  );
}

export default CategoryProducts;