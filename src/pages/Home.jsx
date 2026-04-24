import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import OptionalImage from '../components/OptionalImage';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import homeStyles from '../styles/Home.module.css';

function Home() {
  const [categoriesState, setCategoriesState] = useState([]);
  const [productsState, setProductsState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadCatalog = async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const [categories, products] = await Promise.all([
          categoryService.getCategoriesAsync(),
          productService.getProductsAsync({ activeOnly: true }),
        ]);

        if (isMounted) {
          setCategoriesState(categories);
          setProductsState(products);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error && error.message
              ? error.message
              : 'No fue posible cargar el catálogo inicial.'
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

  const categoryTiles = useMemo(() => {
    const bestByCategory = new Map();

    for (const product of productsState) {
      if (product.isActive === false) {
        continue;
      }

      const categoryKey = String(
        product.categoryId ?? product.categoryName ?? product.category ?? ''
      );
      const rating = Number(product.rating);
      const current = bestByCategory.get(categoryKey);

      if (!current) {
        bestByCategory.set(categoryKey, { product, rating });
        continue;
      }

      const currentRating = Number(current.rating);
      const isBetter =
        (Number.isFinite(rating) ? rating : 0) >
        (Number.isFinite(currentRating) ? currentRating : 0);

      if (isBetter) {
        bestByCategory.set(categoryKey, { product, rating });
      }
    }

    return categoriesState
      .map((category) => {
        const categoryKey = String(category.id || category.name);
        const featured = bestByCategory.get(categoryKey);

        if (!featured) {
          return null;
        }

        return {
          category,
          product: featured.product,
        };
      })
      .filter(Boolean);
  }, [categoriesState, productsState]);
  return (
    <div className={homeStyles.container}>
      <header className={homeStyles.header}>
        <h1 className={homeStyles.title}>Inicio</h1>
        <p className={homeStyles.subtitle}>Selecciona una categoría para ver sus productos</p>
      </header>

      {isLoading ? <p className={homeStyles.subtitle}>Cargando categorías...</p> : null}
      {!isLoading && loadError ? <p className={homeStyles.subtitle}>{loadError}</p> : null}

      <div className={homeStyles.categoryGrid}>
        {categoryTiles.map(({ category, product }) => (
          <button
            key={category.id || category.slug || category.name}
            type="button"
            className={homeStyles.categoryTile}
            onClick={() =>
              navigate(`/category/${encodeURIComponent(category.slug || category.name)}`)
            }
            aria-label={`Ver productos de ${category.name}`}
          >
            <OptionalImage
              className={homeStyles.categoryImage}
              src={product.image}
              alt={product.name}
            />
            <span className={homeStyles.categoryLabel} aria-hidden="true">
              <span className={homeStyles.categoryLabelText}>{category.name}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Home;
