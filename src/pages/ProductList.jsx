import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import styles from '../styles/ProductList.module.css';

function ProductList() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Productos Informáticos</h1>
        <p className={styles.subtitle}>
          Encuentra los mejores productos de tecnología para tu setup
        </p>
      </header>

      <div className={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            category={product.category}
            price={product.price}
            image={product.image}
            description={product.description}
          />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
