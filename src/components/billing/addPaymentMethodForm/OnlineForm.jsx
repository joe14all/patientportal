import React, { useState } from 'react';
import { useBillingData } from '../../../contexts';
import { PAYMENT_METHOD_CONFIG } from '../../../constants';
import styles from './OnlineForm.module.css'; // We'll create this CSS file

// Get digital wallet types from the main config
const WALLET_TYPES = PAYMENT_METHOD_CONFIG.find(m => m.id === 'online').types;

// Initial state for the online form
const getInitialOnlineState = () => ({
  serviceName: WALLET_TYPES[0], // Default to Instapay
  email: '',
  phone: '',
  isDefault: false,
});

/**
 * Renders the form for adding a new Digital Wallet (Instapay, etc.).
 * Manages its own state and submission logic.
 */
const OnlineForm = ({ onCancel, onSuccess }) => {
  const { addPaymentMethod, loading } = useBillingData();
  const [formData, setFormData] = useState(getInitialOnlineState());
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
      // Simple Validation
      const identifier = formData.email || formData.phone;
      if (!identifier) {
        setError("Please enter an email or phone number associated with the account.");
        return;
      }

      // Prepare data for context
      const newOnlineData = {
        type: 'online',
        serviceName: formData.serviceName,
        email: formData.email,
        phone: formData.phone,
        lastFour: identifier.slice(-4), // Use last 4 of identifier as "lastFour"
        isDefault: formData.isDefault,
      };
      
      await addPaymentMethod(newOnlineData);
      onSuccess(); // Close modal on success

    } catch (err) {
      console.error("Failed to add online account:", err);
      setError("Could not save this account. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* --- Form Fields --- */}
      <div className="form-group">
        <label htmlFor="serviceName">Service</label>
        <select
          id="serviceName"
          name="serviceName"
          value={formData.serviceName}
          onChange={handleChange}
          className={styles.select}
          disabled={loading}
        >
          {WALLET_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="email">Associated Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          placeholder="e.g., jane.doe@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Associated Phone</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          disabled={loading}
          placeholder="e.g., +20 100 123 4567"
        />
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
          {loading ? 'Saving...' : 'Save Account'}
        </button>
      </div>
    </form>
  );
};

export default OnlineForm;