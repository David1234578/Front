import { useState } from 'react';
import styles from '../styles/ProductCard.module.css';
   
    function ProductCard({name, price, stock, description,rating, image, category, onEdit, onDelete, onDetails})
    { const [likes, setLikes] = useState(0);
        const [isLiked, setIsLiked] = useState(false);
        const handleLike = () => {
            if (isLiked) { setLikes(likes - 1);
                setIsLiked(false);
            } else { setLikes(likes + 1); setIsLiked(true); } };
 
    return (
        <article className={styles.productCard}>
            <img src={image} alt={name} className={styles.productImage} />
            <div className={styles.productInfo}>
                <span className={styles.productCategory}>{category}</span>
                <h3 className={styles.productName}>{name}</h3>
                {Number.isFinite(rating) ? (
                    <div className={styles.productRating}>
                        {'⭐'.repeat(Math.round(rating))} ({rating.toFixed(1)})
                    </div>
                ) : null}
                <p className={styles.productDescription}>{description}</p>
                <p className={styles.productStock}>Stock: {stock}</p>
                <div className={styles.productFooter}>
                    <span className={styles.productPrice}>${price.toFixed(2)}</span>
                    <button
                        className={`${styles.btnLike} ${isLiked ? styles.liked : ''}`}
                        onClick={handleLike}
                    >
                        {isLiked ? '❤️' : '🤍'} {likes} Me gusta
                    </button>
                </div>
                {onDetails || onEdit || onDelete ? (
          <div className={styles.cardActions}>
            {onDetails ? (
              <button type="button" className={styles.btnDetails} onClick={onDetails}>
                Más información
              </button>
            ) : null}
 
            {onEdit ? (
              <button type="button" className={styles.btnEdit} onClick={onEdit}>
                Editar
              </button>
            ) : null}
 
            {onDelete ? (
              <button type="button" className={styles.btnDelete} onClick={onDelete}>
                Eliminar
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
 
export default ProductCard;

