import React, { useState, useEffect } from 'react';
import { useBillingData } from '../../contexts';
import { IconBilling, IconClose } from '../../layouts/components/Icons';
import styles from './PaymentModal.module.css';

/**
 * A specific modal for handling an invoice payment.
 * It allows selecting a payment method and paying a partial amount.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {function} props.onClose - Function to close the modal.
 * @param {object} props.invoiceToPay - The invoice object to be paid.
 */
const PaymentModal = ({ isOpen, onClose, invoiceToPay }) => {
  const { 
    paymentMethods, 
    makePayment, 
    loading: contextLoading 
  } = useBillingData();

  // --- Internal State ---
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Effects ---

  // When the modal opens, reset its internal state
  useEffect(() => {
    if (isOpen && invoiceToPay) {
      // 1. Set the payment amount to the full amount due
      setPaymentAmount(invoiceToPay.financialSummary.amountDue.toFixed(2));
      
      // 2. Find and select the default payment method
      const defaultMethod = paymentMethods.find(pm => pm.isDefault);
      setSelectedMethodId(defaultMethod ? defaultMethod.id : (paymentMethods[0]?.id || ''));
      
      // 3. Clear old errors
      setError(null);
      setIsProcessing(false);
    }
  }, [isOpen, invoiceToPay, paymentMethods]);

  // --- Event Handlers ---

  const handleAmountChange = (e) => {
    if (error) setError(null);
    setPaymentAmount(e.target.value);
  };

  const handleMethodChange = (e) => {
    setSelectedMethodId(e.target.value);
  };

  // Main submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing || contextLoading) return;

    setError(null);
    const amount = parseFloat(paymentAmount);
    const amountDue = invoiceToPay.financialSummary.amountDue;

    // --- Validation ---
    if (!selectedMethodId) {
      setError("Please select a payment method.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    // Use a small tolerance for floating point comparisons
    if (amount - amountDue > 0.01) {
      setError(`Amount cannot exceed the $${amountDue.toFixed(2)} due.`);
      return;
    }

    // --- Process Payment ---
    setIsProcessing(true);
    try {
      await makePayment(invoiceToPay.id, amount, selectedMethodId);
      onClose(); // Success! Close the modal.
    } catch (err) {
      console.error("Payment failed:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Prevent modal from rendering if not open
  if (!isOpen || !invoiceToPay) {
    return null;
  }

  // Combine loading states
  const isLoading = contextLoading || isProcessing;

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="payment-modal-title"
    >
      <div 
        className={`card ${styles.modalCard}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Modal Header --- */}
        <div className={styles.modalHeader}>
          <h2 id="payment-modal-title" className={styles.modalTitle}>
            Pay Invoice #{invoiceToPay.invoiceNumber}
          </h2>
          <button 
            type="button" 
            className="icon-button" 
            onClick={onClose} 
            disabled={isLoading}
          >
            <IconClose />
          </button>
        </div>

        {/* --- Modal Body (The Form) --- */}
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <p className={styles.totalDue}>
              Total Amount Due: 
              <strong>${invoiceToPay.financialSummary.amountDue.toFixed(2)}</strong>
            </p>

            {/* --- 1. Payment Method Select --- */}
            <div className="form-group">
              <label htmlFor="paymentMethod">Pay with</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                value={selectedMethodId}
                onChange={handleMethodChange}
                className={styles.select}
                disabled={isLoading}
              >
                <option value="" disabled>Select a card...</option>
                {paymentMethods.map(pm => (
                  <option key={pm.id} value={pm.id}>
                    {pm.cardType} **** {pm.lastFour} {pm.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {/* --- 2. Payment Amount Input (Partial Payment) --- */}
            <div className="form-group">
              <label htmlFor="paymentAmount">Amount to pay</label>
              <div className={styles.amountInputWrapper}>
                <span>$</span>
                <input
                  type="number"
                  id="paymentAmount"
                  name="paymentAmount"
                  value={paymentAmount}
                  onChange={handleAmountChange}
                  disabled={isLoading}
                  step="0.01"
                  min="0.01"
                  max={invoiceToPay.financialSummary.amountDue.toFixed(2)}
                />
              </div>
            </div>
            
            {error && (
              <p className={styles.errorText}>{error}</p>
            )}
          </div>

          {/* --- Modal Footer (Actions) --- */}
          <div className={styles.modalFooter}>
            <button 
              type="button" 
              className="secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || !selectedMethodId}
            >
              {isProcessing ? 'Processing...' : `Pay $${parseFloat(paymentAmount || 0).toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;