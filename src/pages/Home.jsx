import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import homeStyles from '../styles/Home.module.css';
import { loadProducts } from '../utils/productsStorage';

function Home() {
  const navigate = useNavigate();
  const [productsState] = useState(loadProducts);
  const [query, setQuery] = useState('');

  const openCategory = (category) => {
    const safeCategory = String(category ?? '').trim();
    if (!safeCategory) return;
    navigate(`/category/${encodeURIComponent(safeCategory)}`);
  };

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

  const recentProducts = useMemo(
    () =>
      [...productsState]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 4),
    [productsState]
  );

  const firstCategory = categoryTiles[0]?.category ?? '';
  const secondCategory = categoryTiles[1]?.category ?? firstCategory;
  const topCategories = categoryTiles.slice(0, 8);

  return (
    <div className={homeStyles.container}>
      <section className={homeStyles.hero}>
        <div className={homeStyles.heroGlow} aria-hidden="true" />
        <div className={homeStyles.heroMain}>
          <div className={homeStyles.heroContent}>
            <p className={homeStyles.heroKicker}>Modo gamer urbano</p>
            <h1 className={homeStyles.heroTitle}>Arma tu setup con energia de tarima y calle</h1>
            <p className={homeStyles.heroSubtitle}>
              Encuentra tecnologia dura, accesorios pro y combos con actitud para subir de nivel tu juego y tu estilo.
            </p>

            <div className={homeStyles.heroActions}>
              <button
                type="button"
                className={homeStyles.secondaryAction}
                onClick={() => (secondCategory ? openCategory(secondCategory) : undefined)}
              >
                Entrar al mood gamer
              </button>
            </div>
          </div>

          <div className={homeStyles.heroPanel}>
            <h2 className={homeStyles.panelTitle}>Por que este parche esta encendido</h2>
            <ul className={homeStyles.panelList}>
              <li>Productos con enfoque gaming y performance real</li>
              <li>Compra rapida sin vueltas raras</li>
              <li>Diseño con vibra urbana de Medellin</li>
            </ul>

            <div className={homeStyles.heroStats}>
              <article className={homeStyles.statItem}>
                <strong>{productsState.length}+</strong>
                <span>Productos</span>
              </article>
              <article className={homeStyles.statItem}>
                <strong>{categoryTiles.length}</strong>
                <span>Categorías</span>
              </article>
              <article className={homeStyles.statItem}>
                <strong>100%</strong>
                <span>En línea</span>
              </article>
            </div>
          </div>
        </div>

        <div className={homeStyles.quickCategories}>
          {topCategories.map(({ category }) => (
            <button
              key={category}
              type="button"
              className={homeStyles.categoryPill}
              onClick={() => openCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className={homeStyles.searchSection} aria-label="Buscador de productos">
        <label htmlFor="home-product-search" className={homeStyles.searchLabel}>
          Busca por nombre
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
                      <p className={homeStyles.searchMeta}>Categoría: {product.category}</p>
                    </div>

                    <button
                      type="button"
                      className={homeStyles.searchAction}
                      onClick={() => openCategory(product.category)}
                    >
                      Ver categoría
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </section>

      <section className={homeStyles.recentSection} aria-label="Productos recientes">
        <div className={homeStyles.sectionHeader}>
          <h2 className={homeStyles.sectionTitle}>Novedades del catálogo</h2>
          <button
            type="button"
            className={homeStyles.viewAll}
            onClick={() => (firstCategory ? openCategory(firstCategory) : undefined)}
          >
            Ver todos
          </button>
        </div>

        <div className={homeStyles.recentGrid}>
          {recentProducts.map((product) => (
            <article key={product.id} className={homeStyles.recentCard}>
              <img className={homeStyles.recentImage} src={product.image} alt={product.name} />
              <div className={homeStyles.recentBody}>
                <p className={homeStyles.recentCategory}>{product.category}</p>
                <h3 className={homeStyles.recentName}>{product.name}</h3>
                <p className={homeStyles.recentPrice}>${Number(product.price).toLocaleString('es-CO')}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={homeStyles.categoriesSection} aria-label="Categorias principales">
        <div className={homeStyles.sectionHeader}>
          <h2 className={homeStyles.sectionTitle}>Categorías</h2>
        </div>

        <div className={homeStyles.categoryGrid}>
        {categoryTiles.map(({ category, product }) => (
          <button
            key={category}
            type="button"
            className={homeStyles.categoryTile}
            onClick={() => openCategory(category)}
            aria-label={`Ver productos de ${category}`}
          >
            <img className={homeStyles.categoryImage} src={product.image} alt={product.name} />
            <div className={homeStyles.categoryOverlay}>
              <h3 className={homeStyles.categoryName}>{category}</h3>
            </div>
          </button>
        ))}
        </div>
      </section>
    </div>
  );
}

export default Home;