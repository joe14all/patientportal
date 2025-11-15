import React from 'react';
import styles from './ContactPhoneInput.module.css';
import { COUNTRIES } from '../../../constants';

const ContactPhoneInput = ({ 
  countryCode, 
  phoneNumber,
  phoneType,
  allowSms,
  phoneIsVerified, // NEW: Prop to get verification status
  onChange, 
  onBlur, 
  handleVerifyPhone, // NEW: Prop to call verification function
  phoneNumberError 
}) => {
  
  const getInputClass = () => {
    return phoneNumberError ? styles.isInvalid : '';
  };

  // --- NEW: Render the verification status badge ---
  const renderPhoneStatus = () => {
    if (phoneIsVerified) {
      return (
        <span className={`${styles.statusBadge} ${styles.verified}`}>
          Verified
        </span>
      );
    }
    return (
      <span className={`${styles.statusBadge} ${styles.unverified}`}>
        Unverified
      </span>
    );
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

      {/* --- NEW: Verification Button & Status --- */}
      {!phoneIsVerified ? (
        <div className={styles.verifyWrapper}>
          <p className={styles.helpText}>Your phone is unverified.</p>
          <button 
            type="button" 
            className={styles.verifyButton}
            onClick={handleVerifyPhone}
          >
            Verify Now
          </button>
        </div>
      ) : (
        <div className={styles.verifyWrapper}>
          <p className={styles.helpText}>Primary number for reminders.</p>
          {renderPhoneStatus()}
        </div>
      )}

      {/* --- Allow SMS Checkbox --- */}
      {phoneType === 'Mobile' && (
        <div className={styles.checkboxGroup}>
          <input
            type="checkbox"
            id="allowSms"
            name="allowSms"
            checked={allowSms}
            onChange={onChange}
            disabled={!phoneIsVerified}
          />
          <label 
            htmlFor="allowSms"
            className={!phoneIsVerified ? styles.disabledLabel : ''} 
          >
            Allow SMS for appointment reminders
          </label>
        </div>
      )}
    </div>
  );
};

export default ContactPhoneInput;