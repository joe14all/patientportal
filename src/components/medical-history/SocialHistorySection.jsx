import React from 'react';
import styles from './SocialHistorySection.module.css';

// Define the options for the dropdowns
const STATUS_OPTIONS = {
  Tobacco: ['Current', 'Former', 'Never'],
  Alcohol: ['Current', 'Former', 'Never'],
  RecreationalDrugs: ['Current', 'Former', 'Never'],
};

/**
 * Manages the "Social History" section of the Medical History page.
 * This is a controlled component that updates its data via the parent.
 */
const SocialHistorySection = ({ data, onChange }) => {
  // Helper to find a specific item in the array, e.g., "Tobacco"
  const findItem = (type) => {
    return data.find(item => item.type === type) || { type, status: '', details: '' };
  };

  // This handler updates the parent's state with a new array
  const handleChange = (type, field, value) => {
    // Create a new version of the array
    const newData = data.map(item => {
      if (item.type === type) {
        return {
          ...item,
          [field]: value,
        };
      }
      return item;
    });
    // Call the parent's generic onChange handler
    onChange(newData);
  };

  // Helper to render one row (e.g., for "Tobacco")
  const renderHistoryRow = (type) => {
    const item = findItem(type);
    const options = STATUS_OPTIONS[type];

    return (
      <div className={styles.row} key={type}>
        <div className="form-group">
          <label htmlFor={`social_${type}_status`}>{type} Use</label>
          <select
            id={`social_${type}_status`}
            name="status"
            value={item.status || ''}
            onChange={(e) => handleChange(type, 'status', e.target.value)}
            className={styles.select}
          >
            <option value="">Select...</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor={`social_${type}_details`}>Details (Optional)</label>
          <input
            type="text"
            id={`social_${type}_details`}
            name="details"
            value={item.details || ''}
            onChange={(e) => handleChange(type, 'details', e.g.target.value)}
            placeholder={type === 'Tobacco' ? 'e.g., 1 pack/day for 5 years' : ''}
          />
        </div>
      </div>
    );
  };

  return (
    <section className="card">
      <h2>Social History</h2>
      <div className={styles.formContainer}>
        {renderHistoryRow('Tobacco')}
        {renderHistoryRow('Alcohol')}
        {renderHistoryRow('RecreationalDrugs')}
      </div>
    </section>
  );
};

export default SocialHistorySection;