import React from 'react';
import styles from './ContactAddressForm.module.css';
import { COUNTRIES, US_STATES } from '../../../constants';

const ContactAddressForm = ({ formData, errors, onChange, onBlur }) => {

  // Helper to get the correct class name for an input
  const getInputClass = (name) => {
    return errors[name] ? styles.isInvalid : '';
  };

  // --- Render Conditional Address Fields ---
  const renderStateField = () => {
    if (formData.country === 'US') {
      return (
        <div className="form-group">
          <label htmlFor="state">State</label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={onChange}
            onBlur={onBlur}
            required
            className={`${styles.select} ${getInputClass('state')}`}
          >
            <option value="">Select State...</option>
            {US_STATES.map(state => (
              <option key={state.code} value={state.code}>{state.name} ({state.code})</option>
            ))}
          </select>
          {errors.state && <p className={styles.errorText}>{errors.state}</p>}
        </div>
      );
    }

    if (formData.country === 'EG') {
      return (
        <div className="form-group">
          <label htmlFor="state">Governorate</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={onChange}
            onBlur={onBlur}
            required
            className={getInputClass('state')}
          />
          {errors.state && <p className={styles.errorText}>{errors.state}</p>}
        </div>
      );
    }

    if (formData.country) {
      return (
        <div className="form-group">
          <label htmlFor="state">State / Province / Region</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={onChange}
          />
        </div>
      );
    }
    return null;
  };

  const renderPostalCodeField = () => {
    const isUS = formData.country === 'US';
    const isEG = formData.country === 'EG';
    const label = isUS ? 'Zip Code' : 'Postal Code';

    if (isUS || isEG) {
      return (
        <div className="form-group">
          <label htmlFor="postalCode">{label}</label>
          <input
            type="text"
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={onChange}
            onBlur={onBlur}
            required
            inputMode={isUS ? "numeric" : "text"}
            pattern={isUS ? "\\d{5}(-\\d{4})?" : null}
            maxLength={isUS ? 10 : 20}
            className={getInputClass('postalCode')}
          />
          {errors.postalCode && <p className={styles.errorText}>{errors.postalCode}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.addressWrapper}>
      {/* --- Address Type Dropdown --- */}
      <div className="form-group">
        <label htmlFor="addressUse">Address Type</label>
        <select
          id="addressUse"
          name="addressUse"
          value={formData.addressUse}
          onChange={onChange}
          onBlur={onBlur}
          className={styles.select}
        >
          <option value="Home">Home</option>
          <option value="Work">Work</option>
          <option value="Mailing">Mailing</option>
        </select>
      </div>

      {/* --- Country Dropdown --- */}
      <div className="form-group">
        <label htmlFor="country">Country</label>
        <select
          id="country"
          name="country"
          value={formData.country}
          onChange={onChange}
          onBlur={onBlur}
          required
          className={`${styles.select} ${getInputClass('country')}`}
        >
          <option value="">Select Country...</option>
          {COUNTRIES.map(c => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
        {errors.country && <p className={styles.errorText}>{errors.country}</p>}
      </div>
      
      {/* --- Address Lines --- */}
      <div className="form-group">
        <label htmlFor="addressLine1">Address Line 1</label>
        <input
          type="text"
          id="addressLine1"
          name="addressLine1"
          placeholder="123 Main St"
          value={formData.addressLine1}
          onChange={onChange}
          onBlur={onBlur}
          required
          className={getInputClass('addressLine1')}
        />
        {errors.addressLine1 && <p className={styles.errorText}>{errors.addressLine1}</p>}
      </div>
      
      <div className="form-group">
        <label htmlFor="addressLine2">Address Line 2 (Optional)</label>
        <input
          type="text"
          id="addressLine2"
          name="addressLine2"
          placeholder="Apt, Suite, Bldg"
          value={formData.addressLine2 || ''}
          onChange={onChange}
        />
      </div>

      {/* --- City/State/Zip Grid --- */}
      <div className={styles.addressGrid}>
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={onChange}
            onBlur={onBlur}
            required
            className={getInputClass('city')}
          />
          {errors.city && <p className={styles.errorText}>{errors.city}</p>}
        </div>
        
        {renderStateField()}
        {renderPostalCodeField()}
      </div>
    </div>
  );
};

export default ContactAddressForm;