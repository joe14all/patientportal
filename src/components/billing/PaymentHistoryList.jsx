import React, { useState } from 'react';
import { useBillingData } from '../../contexts';
import Modal from '../common/Modal'; // Use the generic modal for confirmation
import { formatCurrency } from '../../utils/formatting';
import styles from './PaymentHistoryList.module.css';

/**
 * Renders the "Payment History" card, showing a list of past payments
 * and allowing users to request refunds for unapplied credits.
 */
const PaymentHistoryList = () => {
  const { billingPayments, requestRefund, loading } = useBillingData();
  
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null); 
  const [refundReason, setRefundReason] = useState('');

  // --- Event Handlers ---

  const handleRefundClick = (payment) => {
    setRefundTarget(payment);
    setRefundReason(''); 
    setIsRefundModalOpen(true);
  };

  // --- 1. UPDATED: Removed validation logic ---
  const handleConfirmRefund = async () => {
    // We no longer need to check for !refundReason here,
    // as the button will be disabled.
    
    try {
      await requestRefund(refundTarget.id, refundReason);
      setRefundTarget(null);
      // On success, the Modal's onPrimaryAction wrapper will close the modal.
    } catch (err) {
      console.error("Failed to request refund:", err);
      // Re-throw the API error to be displayed by the modal's fallback alert
      throw err;
    }
  };

  // --- 2. NEW: Calculate disabled state ---
  const isSubmitDisabled = !refundReason.trim();

  return (
    <>
      <section className={`card ${styles.paymentCard}`}>
        <h2>Payment History</h2>
        
        <ul className={styles.paymentList}>
          {billingPayments.length > 0 ? (
            billingPayments.map(payment => (
              <li className={styles.paymentItem} key={payment.id}>
                <div className={styles.paymentInfo}>
                  <strong>{formatCurrency(payment.amount)}</strong> on {payment.paymentDate}
                  <span className={styles.paymentMethod}>{payment.method}</span>
                </div>
                <span className={styles.status}>{payment.status}</span>
                
                {payment.unappliedAmount.amount > 0.01 && (
                  <div className={styles.unappliedSection}>
                    <span>
                      Unapplied: <strong>{formatCurrency(payment.unappliedAmount)}</strong>
                    </span>
                    <button 
                      className={styles.refundButton}
                      onClick={() => handleRefundClick(payment)}
                      disabled={loading}
                    >
                      Request Refund
                    </button>
                  </div>
                )}
              </li>
            ))
          ) : (
            !loading && <p className={styles.noItemsText}>No payment history.</p>
          )}
          {loading && billingPayments.length === 0 && (
             <p className={styles.noItemsText}>Loading payment history...</p>
          )}
        </ul>
      </section>

      {/* --- Refund Modal --- */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title="Request Refund"
        primaryActionText="Submit Request"
        onPrimaryAction={handleConfirmRefund}
        secondaryActionText="Cancel"
        isLoading={loading}
        primaryActionDisabled={isSubmitDisabled} // <-- 3. PASS THE PROP
      >
        <p>You are requesting a refund for an unapplied credit of <strong>{formatCurrency(refundTarget?.unappliedAmount)}</strong> from your payment on {refundTarget?.paymentDate}.</p>
        <div className="form-group" style={{marginTop: '1rem'}}>
          <label htmlFor="refundReason">Reason for request</label>
          <textarea
            id="refundReason"
            name="refundReason"
            rows="3"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            placeholder="e.g., I overpaid by accident."
          />
        </div>
      </Modal>

      {/* --- Error modal is no longer needed --- */}
    </>
  );
};

export default PaymentHistoryList;