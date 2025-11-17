import React, { useState } from 'react';
import { useBillingData } from '../../contexts';
import Modal from '../common/Modal'; // Use the generic modal for confirmation
import styles from './PaymentHistoryList.module.css';

/**
 * Renders the "Payment History" card, showing a list of past payments
 * and allowing users to request refunds for unapplied credits.
 */
const PaymentHistoryList = () => {
  const { billingPayments, requestRefund, loading } = useBillingData();
  
  // State for the refund modal
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null); // The payment to be refunded
  const [refundReason, setRefundReason] = useState('');

  // --- Event Handlers ---

  const handleRefundClick = (payment) => {
    setRefundTarget(payment);
    setRefundReason(''); // Clear old reason
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = async () => {
    if (!refundTarget || !refundReason) {
      // Simple validation
      alert("Please provide a reason for the refund request.");
      throw new Error("Reason is required."); // Prevent modal from closing
    }
    try {
      await requestRefund(refundTarget.id, refundReason);
      setRefundTarget(null);
      // Modal will close on success
    } catch (err) {
      console.error("Failed to request refund:", err);
      // Re-throw to keep modal open
      throw err;
    }
  };

  return (
    <>
      <section className={`card ${styles.paymentCard}`}>
        <h2>Payment History</h2>
        
        <ul className={styles.paymentList}>
          {billingPayments.length > 0 ? (
            billingPayments.map(payment => (
              <li className={styles.paymentItem} key={payment.id}>
                <div className={styles.paymentInfo}>
                  <strong>${payment.amount.toFixed(2)}</strong> on {payment.paymentDate}
                  <span className={styles.paymentMethod}>{payment.method}</span>
                </div>
                <span className={styles.status}>{payment.status}</span>
                
                {/* --- Unapplied Credit Section --- */}
                {payment.unappliedAmount > 0 && (
                  <div className={styles.unappliedSection}>
                    <span>
                      Unapplied: <strong>${payment.unappliedAmount.toFixed(2)}</strong>
                    </span>
                    <button 
                      className={styles.refundButton}
                      onClick={() => handleRefundClick(payment)}
                      disabled={loading}
                    >
                      Request Refund
                    </button>
                    {/* We could add an "Apply to Invoice" button here in the future */}
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
      >
        <p>You are requesting a refund for an unapplied credit of <strong>${refundTarget?.unappliedAmount.toFixed(2)}</strong> from your payment on {refundTarget?.paymentDate}.</p>
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
    </>
  );
};

export default PaymentHistoryList;