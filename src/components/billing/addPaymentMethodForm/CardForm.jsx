import React, { useState } from 'react';
import { useBillingData } from '../../../contexts';
import { PAYMENT_METHOD_CONFIG, EXPIRATION_MONTHS, getExpirationYears } from '../../../constants';
import styles from './CardForm.module.css';

// Get card types from the main config
const CARD_TYPES = PAYMENT_METHOD_CONFIG.find(m => m.id === 'card').types;
const EXPIRATION_YEARS = getExpirationYears(10);

// Initial state for the *card* form
const getInitialCardState = () => ({
  cardType: CARD_TYPES[0],
  cardNumber: '',
  expMonth: EXPIRATION_MONTHS[0].value,
  expYear: EXPIRATION_YEARS[0],
  cvc: '',
  isDefault: false,
  billingAddress: {
    line: ["123 Main St"],
    city: "Anytown",
    state: "CA",
    postalCode: "12345",
    country: "US"
  }
});

/**
 * Renders the form for adding a new Credit/Debit Card.
 * Manages its own state and submission logic.
 */
const CardForm = ({ onCancel, onSuccess }) => {
  const { addPaymentMethod, loading } = useBillingData();
  const [formData, setFormData] = useState(getInitialCardState());
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (error) setError(null);

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    try {
      // --- Validation ---
      if (formData.cardNumber.length < 15 || formData.cardNumber.length > 16) {
        setError("Please enter a valid card number.");
        return;
      }
      if (formData.cvc.length < 3 || formData.cvc.length > 4) {
        setError("Please enter a valid CVC.");
        return;
      }

      const newCardData = {
        type: 'card', 
        cardType: formData.cardType,
        lastFour: formData.cardNumber.slice(-4),
        expMonth: formData.expMonth,
        expYear: formData.expYear,
        isDefault: formData.isDefault,
        billingAddress: formData.billingAddress
      };
      
      await addPaymentMethod(newCardData);
      onSuccess(); // Close modal on success

    } catch (err) {
      console.error("Failed to add payment method:", err);
      setError("Could not save this card. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* --- Form Fields --- */}
      <div className="form-group">
        <label htmlFor="cardType">Card Type</label>
        <select
          id="cardType"
          name="cardType"
          value={formData.cardType}
          onChange={handleChange}
          className={styles.select}
          disabled={loading}
        >
          {CARD_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="cardNumber">Card Number</label>
        <input
          type="tel"
          id="cardNumber"
          name="cardNumber"
          placeholder="•••• •••• •••• 1234"
          value={formData.cardNumber || ''}
          onChange={handleChange}
          disabled={loading}
          maxLength="16"
        />
      </div>
      <div className={styles.grid}>
        <div className="form-group">
          <label htmlFor="expMonth">Expires On</label>
          <div className={styles.expiryGrid}>
            <select
              id="expMonth"
              name="expMonth"
              value={formData.expMonth}
              onChange={handleChange}
              className={styles.select}
              disabled={loading}
            >
              {EXPIRATION_MONTHS.map(month => (
                <option key={month.value} value={month.value}>{month.name}</option>
              ))}
            </select>
            <select
              id="expYear"
              name="expYear"
              value={formData.expYear}
              onChange={handleChange}
              className={styles.select}
              disabled={loading}
            >
              {EXPIRATION_YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="cvc">CVC</label>
          <input
            type="tel"
            id="cvc"
            name="cvc"
            placeholder="123"
            value={formData.cvc || ''}
            onChange={handleChange}
            disabled={loading}
            maxLength="4"
          />
        </div>
      </div>
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          disabled={loading}
        />
        <label htmlFor="isDefault">Set as default payment method</label>
      </div>

      {/* --- Error Display --- */}
      {error && (
        <p className={styles.errorText}>{error}</p>
      )}

      {/* --- Actions --- */}
      <div className={styles.modalActions}>
        <button 
          type="button" 
          className="secondary" 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Card'}
        </button>
      </div>
    </form>
  );
};

export default CardForm;