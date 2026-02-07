import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import styles from "./ProductList.module.css";

function ProductList() {
    return (
        <div className={styles.container}>
             <header className={styles.header}>
            <h1 className={styles.title}>Lista de Productos</h1>
            <p className={styles.subtitle}>Explora nuestra selección de productos disponibles para la venta.</p>
            </header>
        
        <div className={styles.grid}>
            {products.map((product) => (
                <ProductCard 
                key={product.id}
                name={product.name}
                price={product.price}  
                category={product.category}
                description={product.description}
                image={product.image}
                />   
            ))}
        </div>
        </div>

    )


}

export default ProductList;