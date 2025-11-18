import React, { useState, useEffect } from 'react';
import { useBillingData } from '../../contexts';
import { IconBilling, IconClose, IconBank, IconZap } from '../../layouts/components/Icons'; // <-- 1. IMPORT ICONS
import styles from './PaymentModal.module.css';
import { formatCurrency } from '../../utils/formatting';

/**
 * A specific modal for handling an invoice payment.
 */
const PaymentModal = ({ isOpen, onClose, invoiceToPay }) => {
  const { 
    paymentMethods, 
    makePayment, 
    loading: contextLoading 
  } = useBillingData();

  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currency, setCurrency] = useState('USD'); 

  useEffect(() => {
    if (isOpen && invoiceToPay) {
      const amountDue = invoiceToPay.financialSummary.amountDue.amount;
      const currencyCode = invoiceToPay.financialSummary.amountDue.currency;

      setPaymentAmount(amountDue.toFixed(2));
      setCurrency(currencyCode);
      
      const defaultMethod = paymentMethods.find(pm => pm.isDefault);
      // --- 2. LOGIC IS FINE, just ensure paymentMethods[0] exists ---
      setSelectedMethodId(defaultMethod ? defaultMethod.id : (paymentMethods[0]?.id || ''));
      
      setError(null);
      setIsProcessing(false);
    }
  }, [isOpen, invoiceToPay, paymentMethods]);

  const handleAmountChange = (e) => {
    if (error) setError(null);
    setPaymentAmount(e.target.value);
  };

  const handleMethodChange = (e) => {
    setSelectedMethodId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isProcessing || contextLoading) return;

    setError(null);
    const amount = parseFloat(paymentAmount);
    const amountDue = invoiceToPay.financialSummary.amountDue.amount;

    if (!selectedMethodId) {
      setError("Please select a payment method.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }
    if (amount - amountDue > 0.01) {
      const formattedAmountDue = formatCurrency({ amount: amountDue, currency });
      setError(`Amount cannot exceed the ${formattedAmountDue} due.`);
      return;
    }

    setIsProcessing(true);
    try {
      await makePayment(invoiceToPay.id, amount, selectedMethodId, currency);
      onClose(); 
    } catch (err) {
      console.error("Payment failed:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 3. HELPER TO RENDER OPTION TEXT ---
  const getMethodTitle = (pm) => {
    switch (pm.type) {
      case 'card':
        return `${pm.cardType} **** ${pm.lastFour} ${pm.isDefault ? '(Default)' : ''}`;
      case 'bank':
        return `${pm.bankName} (....${pm.lastFour}) ${pm.isDefault ? '(Default)' : ''}`;
      case 'online':
        return `${pm.serviceName} ${pm.isDefault ? '(Default)' : ''}`;
      default:
        return 'Unknown Method';
    }
  };

  if (!isOpen || !invoiceToPay) {
    return null;
  }

  const isLoading = contextLoading || isProcessing;
  const amountToPay = parseFloat(paymentAmount || 0);

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

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <p className={styles.totalDue}>
              Total Amount Due: 
              <strong>
                {formatCurrency(invoiceToPay.financialSummary.amountDue)}
              </strong>
            </p>

            {/* --- 4. UPDATED PAYMENT METHOD SELECT --- */}
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
                <option value="" disabled>Select a payment method...</option>
                {paymentMethods.map(pm => (
                  <option key={pm.id} value={pm.id}>
                    {getMethodTitle(pm)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="paymentAmount">Amount to pay</label>
              <div className={styles.amountInputWrapper}>
                {/* --- 5. UPDATED CURRENCY SPAN --- */}
                <span className={styles.currencySymbol}>{currency}</span> 
                <input
                  type="number"
                  id="paymentAmount"
                  name="paymentAmount"
                  value={paymentAmount}
                  onChange={handleAmountChange}
                  disabled={isLoading}
                  step="0.01"
                  min="0.01"
                  max={invoiceToPay.financialSummary.amountDue.amount.toFixed(2)}
                />
              </div>
            </div>
            
            {error && (
              <p className={styles.errorText}>{error}</p>
            )}
          </div>

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
              {isProcessing ? 'Processing...' : 
                `Pay ${formatCurrency({ amount: amountToPay, currency })}`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;