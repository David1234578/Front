import { useEffect } from 'react';

import styles from '../styles/AppModal.module.css';

function AppModal({ isOpen, onClose, ariaLabel = 'Modal', className = '', children }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className={styles.overlay} onMouseDown={handleOverlayMouseDown}>
      <div className={`${styles.modal} ${className}`.trim()} role="dialog" aria-modal="true" aria-label={ariaLabel}>
        {children}
      </div>
    </div>
  );
}

export default AppModal;
