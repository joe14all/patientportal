import React from 'react';
import styles from './StickySaveBar.module.css';

/**
 * A reusable sticky bar that appears when there are unsaved changes.
 * @param {object} props
 * @param {boolean} props.isDirty - If true, the bar is visible.
 * @param {boolean} props.loading - If true, shows "Saving..." text and disables buttons.
 * @param {function} props.onSave - The function to call when the "Save" button is clicked.
 * @param {function} props.onRevert - The function to call when the "Revert" button is clicked.
 */
const StickySaveBar = ({ isDirty, loading, onSave, onRevert }) => {
  // If there are no changes, render nothing
  if (!isDirty) {
    return null;
  }

  return (
    <div className={styles.saveBar}>
      <p>You have unsaved changes.</p>
      <div className={styles.buttonGroup}>
        <button 
          className="secondary danger" 
          onClick={onRevert} 
          disabled={loading}
        >
          Revert Changes
        </button>
        <button onClick={onSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default StickySaveBar;