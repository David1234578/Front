import { useMemo, useState } from 'react';

import homeStyles from '../styles/Home.module.css';
import { loadProducts } from '../utils/productsStorage';

function Home({ onOpenCategory }) {
  const [productsState] = useState(loadProducts);
  const [query, setQuery] = useState('');

  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return [];

    return productsState
      .filter((product) => String(product.name ?? '').toLowerCase().includes(normalizedQuery))
      .sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
  }, [normalizedQuery, productsState]);

  const categoryTiles = useMemo(() => {
    const bestByCategory = new Map();

    for (const product of productsState) {
      const category = product.category ?? 'Sin categoría';
      const rating = Number(product.rating);
      const current = bestByCategory.get(category);

      if (!current) {
        bestByCategory.set(category, { product, rating });
        continue;
      }

      const currentRating = Number(current.rating);
      const isBetter =
        (Number.isFinite(rating) ? rating : 0) >
        (Number.isFinite(currentRating) ? currentRating : 0);

      if (isBetter) {
        bestByCategory.set(category, { product, rating });
      }
    }

    return Array.from(bestByCategory.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, data]) => ({ category, product: data.product }));
  }, [productsState]);

  return (
    <div className={homeStyles.container}>
      <header className={homeStyles.header}>
        <h1 className={homeStyles.title}>Inicio</h1>
        <p className={homeStyles.subtitle}>Selecciona una categoría para ver sus productos</p>
      </header>

      <section className={homeStyles.searchSection} aria-label="Buscador de productos">
        <label htmlFor="home-product-search" className={homeStyles.searchLabel}>
          Buscar por nombre
        </label>
        <input
          id="home-product-search"
          type="search"
          className={homeStyles.searchInput}
          placeholder="Ej: Laptop, Tablet..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {normalizedQuery ? (
          <div className={homeStyles.searchResults}>
            {searchResults.length === 0 ? (
              <p className={homeStyles.searchEmpty}>No encontramos productos con ese nombre.</p>
            ) : (
              <ul className={homeStyles.searchList}>
                {searchResults.map((product) => (
                  <li key={product.id} className={homeStyles.searchItem}>
                    <img className={homeStyles.searchImage} src={product.image} alt={product.name} />

                    <div className={homeStyles.searchInfo}>
                      <p className={homeStyles.searchName}>{product.name}</p>
                      <p className={homeStyles.searchMeta}>Categoria: {product.category}</p>
                    </div>

                    <button
                      type="button"
                      className={homeStyles.searchAction}
                      onClick={() => onOpenCategory?.(product.category)}
                    >
                      Ver categoria
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>

      <div className={homeStyles.categoryGrid}>
        {categoryTiles.map(({ category, product }) => (
          <button
            key={category}
            type="button"
            className={homeStyles.categoryTile}
            onClick={() => onOpenCategory?.(category)}
            aria-label={`Ver productos de ${category}`}
          >
            <img className={homeStyles.categoryImage} src={product.image} alt={product.name} />
            <div className={homeStyles.categoryOverlay}>
              <h3 className={homeStyles.categoryName}>{category}</h3>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;