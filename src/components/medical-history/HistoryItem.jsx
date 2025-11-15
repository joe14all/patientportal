import React from 'react';
// We'll use the existing icons from your layout
import { IconTrash, IconEdit } from '../../layouts/components/Icons'; 
import styles from './HistoryItem.module.css';

/**
 * A reusable component to display a single, editable history item.
 * It now includes props for edit and remove actions.
 */
const HistoryItem = ({ item, onEdit, onRemove, loading }) => {
  // Dynamically create the display string for the item
  const renderItemDetails = () => {
    // For Allergies
    if (item.agent) {
      return (
        <>
          <strong>{item.agent}</strong>
          {item.reaction && <span> - {item.reaction}</span>}
          {item.type && <span className={styles.itemType}> ({item.type})</span>}
        </>
      );
    }
    // For Medications
    if (item.name) {
      return (
        <>
          <strong>{item.name}</strong>
          {item.dosage && <span> - {item.dosage}</span>}
          {item.reason && <span> ({item.reason})</span>}
        </>
      );
    }
    // For Surgeries
    if (item.type && item.year) {
      return (
        <>
          <strong>{item.type}</strong>
          <span> - {item.year}</span>
        </>
      );
    }
    // For Conditions
    if (item.name && item.status) {
      return (
        <>
          <strong>{item.name}</strong>
          <span> - {item.status}</span>
        </>
      );
    }
    // For Social History
    if (item.type && item.status) {
       return (
        <>
          <strong>{item.type}</strong>
          <span> - {item.status} {item.details && `(${item.details})`}</span>
        </>
      );
    }
    // Fallback
    return <strong>{item.name || item.type || 'Unknown Item'}</strong>;
  };

  return (
    <li className={styles.historyItem}>
      <div className={styles.itemInfo}>
        {renderItemDetails()}
      </div>
      <div className={styles.itemActions}>
        <button
          type="button"
          className="icon-button"
          onClick={() => onEdit(item)}
          disabled={loading}
        >
          <IconEdit />
        </button>
        <button
          type="button"
          className="icon-button danger"
          onClick={() => onRemove(item.id)}
          disabled={loading}
        >
          <IconTrash />
        </button>
      </div>
    </li>
  );
};

export default HistoryItem;