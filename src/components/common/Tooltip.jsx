import React, { useState } from 'react';
import styles from './Tooltip.module.css';

/**
 * Educational Tooltip Component
 * Helps patients understand medical and dental terms
 */
const Tooltip = ({ children, content, title = null }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className={styles.tooltipWrapper}>
      <span
        className={styles.trigger}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
      >
        {children}
        <span className={styles.icon}>ℹ️</span>
      </span>
      {isVisible && (
        <div className={styles.tooltipContent}>
          {title && <strong className={styles.tooltipTitle}>{title}</strong>}
          <p className={styles.tooltipText}>{content}</p>
        </div>
      )}
    </span>
  );
};

export default Tooltip;
