import React from 'react';
import styles from './StickySaveBar.module.css';

/**
 * A reusable sticky bar that appears when there are unsaved changes.
 * @param {object} props
 * @param {boolean} props.isDirty - If true, the bar is visible.
 * @param {boolean} props.loading - If true, shows "Saving..." text and disables the button.
 * @param {function} props.onSave - The function to call when the "Save" button is clicked.
 */
const StickySaveBar = ({ isDirty, loading, onSave }) => {
  // If there are no changes, render nothing
  if (!isDirty) {
    return null;
  }

  return (
    <div className={styles.saveBar}>
      <p>You have unsaved changes.</p>
      <button onClick={onSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
};

export default StickySaveBar;