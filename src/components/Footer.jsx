import styles from "../styles/Footer.module.css";
 
function Footer() {
  const year = new Date().getFullYear();
 
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <article>
          <p className={styles.kicker}>Sistema Ventas</p>
          <h2 className={styles.brand}>Tecnología y accesorios para tu día a día</h2>
          <p className={styles.copy}>
            Catálogo online con productos seleccionados, atención clara y proceso de compra confiable.
          </p>
        </article>

        <article className={styles.metaBlock}>
          <p className={styles.metaLabel}>Soporte</p>
          <p className={styles.metaValue}>Lun a Sab · 10:00 - 19:00</p>
          <p className={styles.metaLabel}>Contacto</p>
          <p className={styles.metaValue}>soporte@sistemaventas.com</p>
        </article>
      </div>

      <p className={styles.text}>© {year} Sistema Ventas. Todos los derechos reservados.</p>
    </footer>
  );
}
 
export default Footer;