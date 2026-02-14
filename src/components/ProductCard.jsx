import styles from './ProductCard.module.css';

function ProductCard({name, price, description, image, category}) {
return ( 
    <article className={styles.productCard}>
        <img src={image} alt={name} className={styles.productImage} />
        <div className={styles.productInfo}>
            <span className={styles.productCategory}>{category}</span>
            <h3 className={styles.productName}>{name}</h3>
            <p className={styles.productDescription}>{description}</p>
            <div className={styles.productFooter}>
            <span className={styles.productPrice}>${price.toFixed(2)}</span>
            <button className={styles.btnLike}>Me gusta</button>
            </div>
        </div>
    </article>
)
}

export default ProductCard;