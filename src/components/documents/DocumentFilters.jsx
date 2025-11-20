import React from 'react';
import { DOCUMENT_SORT_OPTIONS } from '../../constants';
import styles from './DocumentFilters.module.css';

const DocumentFilters = ({ 
  searchQuery, 
  onSearchChange, 
  sortOption, 
  onSortChange, 
  showArchived, 
  onToggleArchived 
}) => {
  return (
    <div className={`card ${styles.filtersCard}`}>
      {/* --- Search Bar --- */}
      <div className={styles.filterGroup}>
        <label htmlFor="doc-search" className="sr-only">Search Documents</label>
        <input
          type="text"
          id="doc-search"
          placeholder="Search by name or tag..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.controlsRow}>
        {/* --- Sort Dropdown --- */}
        <div className={styles.filterGroup}>
          <label htmlFor="doc-sort">Sort by</label>
          <select
            id="doc-sort"
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className={styles.sortSelect}
          >
            {DOCUMENT_SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* --- Archive Toggle --- */}
        <div className={styles.toggleGroup}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => onToggleArchived(e.target.checked)}
            />
            <span className={styles.toggleText}>Show Archived</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default DocumentFilters;