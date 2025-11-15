import React, { useState } from 'react';
import styles from './ProfileContactForm.module.css';
import ContactPhoneInput from './profileContactForm/ContactPhoneInput';
import ContactAddressForm from './profileContactForm/ContactAddressForm';

/**
 * PARENT CONTROLLER COMPONENT
 * This component now holds the validation logic and orchestrates
 * the sub-components.
 */
const ProfileContactForm = ({ 
  formData, 
  handleChange, 
  handleVerifyEmail, 
  handleVerifyPhone,
  phoneIsVerified 
}) => {
  const [errors, setErrors] = useState({});

  // Helper to get the correct class name for an input
  const getInputClass = (name) => {
    return errors[name] ? styles.isInvalid : '';
  };

  /**
   * Validates a field based on its value and the current country.
   * This logic remains in the parent.
   */
  const validateField = (name, value, currentCountry) => {
    let error = null;
    switch (name) {
      case 'preferredName':
        if (!value) error = 'Preferred name is required.';
        break;
      case 'email':
        if (!value) error = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(value)) error = 'Please enter a valid email.';
        break;
      case 'phoneNumber':
        if (!value) error = 'Local phone number is required.';
        break;
      case 'country':
        if (!value) error = 'Country is required.';
        break;
      case 'addressLine1':
        if (!value) error = 'Address is required.';
        break;
      case 'city':
        if (!value) error = 'City is required.';
        break;
      case 'state':
        // This logic is now a bit simpler as it's just for errors
        if (currentCountry === 'US' && !value) error = 'State is required.';
        if (currentCountry === 'EG' && !value) error = 'Governorate is required.';
        break;
      case 'postalCode':
        if (currentCountry === 'US') {
          if (!value) error = 'Zip code is required.';
          else if (!/^\d{5}(-\d{4})?$/.test(value)) error = 'Enter a 5-digit zip code.';
        }
        if (currentCountry === 'EG' && !value) error = 'Postal code is required.';
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value, formData.country);
  };

  // --- New Email Verification UI ---
  const renderEmailStatus = () => {
    if (formData.emailIsVerified) {
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
    <div className={`card ${styles.formCard}`}>
      {/* --- Fieldset 1: Personal Info --- */}
      <fieldset className={styles.fieldset}>
        <legend>Personal Information</legend>
        <div className="form-group">
          <label htmlFor="preferredName">Preferred Name</label>
          <input
            type="text"
            id="preferredName"
            name="preferredName"
            value={formData.preferredName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={getInputClass('preferredName')}
          />
          {errors.preferredName && <p className={styles.errorText}>{errors.preferredName}</p>}
        </div>
      </fieldset>

      {/* --- Fieldset 2: Contact Info --- */}
      <fieldset className={styles.fieldset}>
        <legend>Contact Information</legend>
        
        {/* --- Email --- */}
        <div className="form-group">
          <div className={styles.labelWrapper}>
            <label htmlFor="email">Email Address</label>
            {renderEmailStatus()}
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={getInputClass('email')}
          />
          {errors.email && <p className={styles.errorText}>{errors.email}</p>}
          
          {!formData.emailIsVerified ? (
            <div className={styles.verifyWrapper}>
              <p className={styles.helpText}>Your email is unverified.</p>
              <button 
                type="button" 
                className={styles.verifyButton}
                onClick={handleVerifyEmail}
              >
                Verify Now
              </button>
            </div>
          ) : (
            <p className={styles.helpText}>This email is used for login and billing.</p>
          )}
        </div>

        {/* --- Phone (Rendered by Child) --- */}
        <ContactPhoneInput
          countryCode={formData.phoneCountryCode}
          phoneNumber={formData.phoneNumber}
          phoneType={formData.phoneType}
          allowSms={formData.allowSms}
          phoneIsVerified={phoneIsVerified} 
          onChange={handleChange}
          onBlur={handleBlur}
          handleVerifyPhone={handleVerifyPhone} 
          phoneNumberError={errors.phoneNumber}
        />

        {/* --- Address (Rendered by Child) --- */}
        <ContactAddressForm
          // Pass down all the state and handlers
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </fieldset>
    </div>
  );
};

export default ProfileContactForm;