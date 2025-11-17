import React, { useState, useMemo } from 'react';
import { useBillingData } from '../contexts';
import { IconBilling } from '../layouts/components/Icons';
import styles from './Billing.module.css';
import Modal from '../components/common/Modal'; // <-- 1. IMPORT THE MODAL

const Billing = () => {
  const {
    billingInvoices,
    billingPayments,
    insurancePolicies,
    makePayment,
    loading,
    error,
  } = useBillingData();

  // --- 2. ADD STATE FOR THE MODAL ---
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null); // { id, amount, number }

  // Find the next invoice that needs payment
  const outstandingInvoices = useMemo(
    () => billingInvoices.filter(inv => inv.financialSummary.amountDue > 0),
    [billingInvoices]
  );

  // --- 3. UPDATE THIS HANDLER TO OPEN THE MODAL ---
  const handlePayInvoice = (invoiceId, amount, invoiceNumber) => {
    // Instead of paying, just set the target and open the modal
    setPaymentTarget({ id: invoiceId, amount, number: invoiceNumber });
    setIsPayModalOpen(true);
  };

  // --- 4. CREATE A NEW HANDLER FOR THE MODAL'S "CONFIRM" BUTTON ---
  const handleConfirmPayment = async () => {
    if (!paymentTarget) return;

    try {
      await makePayment(paymentTarget.id, paymentTarget.amount);
      // Success!
      setPaymentTarget(null); // Clear target
      // The modal will close itself on success
    } catch (err) {
      console.error("Payment failed", err);
      // RE-THROW the error to keep the modal open
      // so the user knows it failed.
      throw err; 
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <h1>Billing</h1>
      <p className={styles.pageDescription}>
        Manage your invoices, payments, and insurance policies.
      </p>

      {/* Show context error OR modal error */ }
      {error && <p className="error-text">Error: {error}</p>}

      {/* --- Main Billing Layout Grid --- */}
      <div className={styles.billingLayout}>

        {/* --- Column 1: Invoices --- */}
        <section className={styles.section}>
          <h2>Outstanding Invoices</h2>
          {loading && !outstandingInvoices.length && <p>Loading invoices...</p>}
          
          {outstandingInvoices.length > 0 ? (
            outstandingInvoices.map(invoice => (
              <div className="card" key={invoice.id}>
                <div className={styles.invoiceHeader}>
                  <strong>Invoice #{invoice.invoiceNumber}</strong>
                  <span className={styles.amountDue}>
                    ${invoice.financialSummary.amountDue.toFixed(2)} Due
                  </span>
                </div>
                <p>Date: {invoice.invoiceDate}</p>
                <p>Total Patient Responsibility: ${invoice.financialSummary.patientResponsibility.toFixed(2)}</p>
                
                {/* --- 5. UPDATE THE BUTTON'S onClick --- */}
                <button
                  onClick={() => handlePayInvoice(
                    invoice.id, 
                    invoice.financialSummary.amountDue,
                    invoice.invoiceNumber // Pass number for modal
                  )}
                  disabled={loading} // Only disable if global state is loading
                  className={styles.payButton}
                >
                  {/* Text is simpler now */ }
                  {`Pay $${invoice.financialSummary.amountDue.toFixed(2)} Now`}
                </button>
              </div>
            ))
          ) : (
            !loading && <p>No outstanding invoices. You're all paid up!</p>
          )}
        </section>

        {/* --- Column 2: Insurance & Payments --- */}
        <div className={styles.columnSecondary}>
          {/* ... (Insurance and Payment History sections remain unchanged) ... */}
          <section className={styles.section}>
            <h2>Insurance Policies</h2>
            {loading && !insurancePolicies.length && <p>Loading policies...</p>}
            
            {insurancePolicies.filter(p => p.status === 'Active').map(policy => (
              <div className="card" key={policy.id}>
                <strong>{policy.carrier.name} (Primary)</strong>
                <p>Plan: {policy.plan.planName}</p>
                <p>Group #: {policy.plan.groupNumber}</p>
                <p>Policy #: {policy.plan.policyNumber}</p>
              </div>
            ))}
            <button className="secondary" style={{width: '100%', marginTop: '1rem'}}>+ Add Insurance</button>
          </section>

          <section className={styles.section}>
            <h2>Payment History</h2>
            {loading && !billingPayments.length && <p>Loading payments...</p>}
            
            <div className={`card ${styles.paymentList}`}>
              {billingPayments.length > 0 ? (
                billingPayments.map(payment => (
                  <div className={styles.paymentItem} key={payment.id}>
                    <div>
                      <strong>${payment.amount.toFixed(2)}</strong> on {payment.paymentDate}
                      <span className={styles.paymentMethod}>{payment.method}</span>
                    </div>
                    <span>{payment.status}</span>
                  </div>
                ))
              ) : (
                !loading && <p>No payment history.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* --- 6. ADD THE PAYMENT MODAL --- */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => {
          if (loading) return; // Don't close if context is loading
          setIsPayModalOpen(false);
          setPaymentTarget(null);
        }}
        title="Confirm Payment"
        isLoading={loading} // Use the global loading state
        primaryActionText={paymentTarget ? `Pay $${paymentTarget.amount.toFixed(2)}` : 'Confirm'}
        onPrimaryAction={handleConfirmPayment}
        secondaryActionText="Cancel"
      >
        <p>You are about to pay <strong>${paymentTarget?.amount.toFixed(2)}</strong> for Invoice <strong>#{paymentTarget?.number}</strong>.</p>
        <p>This action will charge your card on file.</p>
      </Modal>

    </div>
  );
};

export default Billing;