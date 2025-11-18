import React, { useState } from 'react';
import { useBillingData } from '../../../contexts';
import { PAYMENT_METHOD_CONFIG } from '../../../constants';
import styles from './BankForm.module.css';

// Get bank account types from the main config
const BANK_TYPES = PAYMENT_METHOD_CONFIG.find(m => m.id === 'bank').types;
const ACCOUNT_TYPES = ['Checking', 'Savings'];

// Initial state for the bank form
const getInitialBankState = () => ({
  accountHolderName: '',
  bankName: '',
  accountType: ACCOUNT_TYPES[0],
  bankType: BANK_TYPES[0],
  accountNumber: '',
  routingNumber: '', // Placeholder for Routing or SWIFT
  isDefault: false,
});

/**
 * Renders the form for adding a new Bank Account.
 * Manages its own state and submission logic.
 */
const BankForm = ({ onCancel, onSuccess }) => {
  const { addPaymentMethod, loading } = useBillingData();
  const [formData, setFormData] = useState(getInitialBankState());
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
      // --- Simple Validation ---
      if (!formData.accountHolderName || !formData.bankName || !formData.accountNumber) {
        setError("Please fill in all required fields.");
        return;
      }
      if (formData.accountNumber.length < 4) {
        setError("Please enter a valid account number (at least 4 digits).");
        return;
      }

      // --- Prepare data for context ---
      const newBankData = {
        type: 'bank',
        accountHolderName: formData.accountHolderName,
        bankName: formData.bankName,
        accountType: formData.accountType,
        bankType: formData.bankType,
        lastFour: formData.accountNumber.slice(-4),
        isDefault: formData.isDefault,
      };
      
      await addPaymentMethod(newBankData);
      onSuccess(); // Close modal on success

    } catch (err) {
      console.error("Failed to add bank account:", err);
      setError("Could not save this account. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* --- Form Fields --- */}
      <div className="form-group">
        <label htmlFor="accountHolderName">Account Holder Name</label>
        <input
          type="text"
          id="accountHolderName"
          name="accountHolderName"
          value={formData.accountHolderName}
          onChange={handleChange}
          disabled={loading}
          placeholder="Jane M. Doe"
        />
      </div>

      <div className="form-group">
        <label htmlFor="bankName">Bank Name</label>
        <input
          type="text"
          id="bankName"
          name="bankName"
          value={formData.bankName}
          onChange={handleChange}
          disabled={loading}
          placeholder="Example National Bank"
        />
      </div>

      <div className={styles.grid}>
        <div className="form-group">
          <label htmlFor="accountType">Account Type</label>
          <select
            id="accountType"
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
            className={styles.select}
            disabled={loading}
          >
            {ACCOUNT_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="bankType">Bank System</label>
          <select
            id="bankType"
            name="bankType"
            value={formData.bankType}
            onChange={handleChange}
            className={styles.select}
            disabled={loading}
          >
            {BANK_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.grid}>
        <div className="form-group">
          <label htmlFor="accountNumber">Account Number</label>
          <input
            type="tel"
            id="accountNumber"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            disabled={loading}
            placeholder="Last 4 digits are stored"
          />
        </div>
        <div className="form-group">
          <label htmlFor="routingNumber">Routing / SWIFT</label>
          <input
            type="tel"
            id="routingNumber"
            name="routingNumber"
            value={formData.routingNumber}
            onChange={handleChange}
            disabled={loading}
            placeholder="Optional"
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
          {loading ? 'Saving...' : 'Save Account'}
        </button>
      </div>
    </form>
  );
};

export default BankForm;