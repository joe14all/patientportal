import React from 'react';
import styles from './ProfileDemographicsForm.module.css';
import { 
  ETHNICITY_OPTIONS, 
  MARITAL_STATUS_OPTIONS, 
  SEX_AT_BIRTH_OPTIONS 
} from '../../constants';
import DemographicsGenderForm from './ProfileDemographicsForm/DemographicsGenderForm';
import DemographicsRaceForm from './ProfileDemographicsForm/DemographicsRaceForm';

/**
 * This is the new "controller" for the demographics section.
 * It renders subcomponents for complex fields (Gender, Race)
 * and dropdowns for simple fields (Ethnicity, etc.).
 *
 * It receives all its state and handlers from the main Profile.jsx page.
 */
const ProfileDemographicsForm = ({ formData, handleChange, handleRaceChange }) => {
  
  if (!formData) {
    return (
      <div className={`card ${styles.formCard}`}>
        <h2>Demographics</h2>
        <p>Could not load demographic data.</p>
      </div>
    );
  }

  return (
    <form className={`card ${styles.formCard}`}>
      <h2>Demographics</h2>
      <p className={styles.helpText}>
        This information helps us provide you with the best and most respectful care.
      </p>

      {/* --- 1. Gender Identity & Pronouns (Subcomponent) --- */}
      <fieldset className={styles.fieldset}>
        <legend>Gender & Pronouns</legend>
        <DemographicsGenderForm 
          formData={formData} 
          handleChange={handleChange} 
        />
      </fieldset>

      {/* --- 2. Marital Status & Sex at Birth (Simple Dropdowns) --- */}
      <fieldset className={styles.fieldset}>
        <legend>Personal Details</legend>
        <div className={styles.formGrid}>
          <div className="form-group">
            <label htmlFor="maritalStatus">Marital Status</label>
            <select
              id="maritalStatus"
              name="demographics.maritalStatus" // Name matches parent state
              value={formData.maritalStatus}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Select...</option>
              {MARITAL_STATUS_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sexAtBirth">Sex at Birth</label>
            <select
              id="sexAtBirth"
              name="demographics.sexAtBirth" // Name matches parent state
              value={formData.sexAtBirth}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="">Select...</option>
              {SEX_AT_BIRTH_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>
      
      {/* --- 3. Ethnicity & Race (Simple Dropdown + Subcomponent) --- */}
      <fieldset className={styles.fieldset}>
        <legend>Ethnicity & Race</legend>
        <div className="form-group">
          <label htmlFor="ethnicity">Ethnicity</label>
          <select
            id="ethnicity"
            name="demographics.ethnicity" // Name matches parent state
            value={formData.ethnicity}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="">Select...</option>
            {ETHNICITY_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <DemographicsRaceForm 
          race={formData.race} // Pass down the race array
          onRaceChange={handleRaceChange} // Pass down the special handler
        />
      </fieldset>
    </form>
  );
};

export default ProfileDemographicsForm;