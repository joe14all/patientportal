import React from 'react';
import styles from './ContactPhoneInput.module.css';
import { COUNTRIES } from '../../../constants';

const ContactPhoneInput = ({ 
  countryCode, 
  phoneNumber,
  phoneType,
  allowSms,
  onChange, 
  onBlur, 
  phoneNumberError 
}) => {
  
  const getInputClass = () => {
    return phoneNumberError ? styles.isInvalid : '';
  };

  return (
    <div className={styles.phoneWrapper}>
      {/* --- Phone Type Dropdown --- */}
      <div className="form-group">
        <label htmlFor="phoneType">Phone Type</label>
        <select
          id="phoneType"
          name="phoneType"
          value={phoneType}
          onChange={onChange}
          onBlur={onBlur}
          className={styles.select}
        >
          <option value="Mobile">Mobile</option>
          <option value="Home">Home</option>
          <option value="Work">Work</option>
        </select>
      </div>

      {/* --- Phone Number Grid --- */}
      <div className={styles.phoneGrid}>
        <div className="form-group">
          <label htmlFor="phoneCountryCode">Code</label>
          <select
            id="phoneCountryCode"
            name="phoneCountryCode"
            value={countryCode}
            onChange={onChange}
            onBlur={onBlur}
            className={styles.select}
          >
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.phoneCode}>{c.code} ({c.phoneCode})</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">Local Phone Number</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={phoneNumber}
            onChange={onChange}
            onBlur={onBlur}
            required
            className={getInputClass()}
          />
        </div>
      </div>
      
      {/* Show validation error for the number */}
      {phoneNumberError && <p className={styles.errorText}>{phoneNumberError}</p>}

      {/* --- Allow SMS Checkbox --- */}
      {/* We only show this if the type is "Mobile" */}
      {phoneType === 'Mobile' && (
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="allowSms"
            name="allowSms"
            checked={allowSms}
            onChange={onChange}
          />
          <label htmlFor="allowSms">Allow SMS for appointment reminders</label>
        </div>
      )}
    </div>
  );
};

export default ContactPhoneInput;