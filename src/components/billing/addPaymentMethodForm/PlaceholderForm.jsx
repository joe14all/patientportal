import React from 'react';
import styles from './PlaceholderForm.module.css';

/**
 * Renders a placeholder for payment methods that are not yet implemented.
 */
const PlaceholderForm = ({ title, onCancel, loading }) => {
  return (
    <div>
      <div className={styles.placeholder}>
        <p>Adding {title} is not yet available.</p>
        <span>This feature is coming soon.</span>
      </div>

      {/* --- Actions --- */}
      <div className={styles.modalActions}>
        <button 
          type="button" 
          className="secondary" 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PlaceholderForm;