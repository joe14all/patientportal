import React from 'react';
import styles from './DemographicsGenderForm.module.css';
import { GENDER_IDENTITY_OPTIONS } from '../../../constants';

/**
 * This component renders the Gender Identity and Pronouns fields.
 * It shows a text input if "Other" is selected for gender.
 *
 * Note on Logic:
 * The parent component's `handleChange` needs to be aware of the
 * 'demographics.genderIdentity' field.
 *
 * When the user selects "Other", this component will rely on a *new*
 * field in the `formData` called `demographics.genderIdentityOther`
 * to store the free-text value.
 *
 * The parent's `handleSave` logic will need to be updated to check:
 * if (formData.demographics.genderIdentity === 'Other') {
 * save(formData.demographics.genderIdentityOther);
 * } else {
 * save(formData.demographics.genderIdentity);
 * }
 */
const DemographicsGenderForm = ({ formData, handleChange }) => {
  const gender = formData.genderIdentity;

  return (
    <div className={styles.formGrid}>
      {/* --- Gender Identity Dropdown --- */}
      <div className="form-group">
        <label htmlFor="genderIdentity">Gender Identity</label>
        <select
          id="genderIdentity"
          name="demographics.genderIdentity" // This name must match the parent's state
          value={gender}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">Select...</option>
          {GENDER_IDENTITY_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* --- Conditional "Other" Text Input --- */}
      {gender === 'Other' && (
        <div className="form-group">
          <label htmlFor="genderIdentityOther">Please specify</label>
          <input
            type="text"
            id="genderIdentityOther"
            name="demographics.genderIdentityOther" // A new field for the parent to manage
            value={formData.genderIdentityOther || ''}
            onChange={handleChange}
          />
        </div>
      )}

      {/* --- Pronouns Text Input --- */}
      <div className="form-group">
        <label htmlFor="pronouns">Pronouns</label>
        <input
          type="text"
          id="pronouns"
          name="demographics.pronouns" // This name must match the parent's state
          value={formData.pronouns}
          onChange={handleChange}
          placeholder="e.g., she/her, they/them"
        />
      </div>
    </div>
  );
};

export default DemographicsGenderForm;