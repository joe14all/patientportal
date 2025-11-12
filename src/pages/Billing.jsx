import React, { useState, useMemo } from 'react';
import { useBillingData } from '../contexts';
import { IconBilling } from '../layouts/components/Icons';
import styles from './Billing.module.css';

const Billing = () => {
  const {
    billingInvoices,
    billingPayments,
    insurancePolicies,
    makePayment,
    loading,
    error,
  } = useBillingData();

  const [paymentInProgress, setPaymentInProgress] = useState(null); // Tracks which invoice is being paid

  // Find the next invoice that needs payment
  const outstandingInvoices = useMemo(
    () => billingInvoices.filter(inv => inv.financialSummary.amountDue > 0),
    [billingInvoices]
  );

  const handlePayInvoice = async (invoiceId, amount) => {
    setPaymentInProgress(invoiceId);
    try {
      await makePayment(invoiceId, amount);
      // Success! The context state will refresh and this component will re-render.
    } catch (err) {
      // Error is handled in context, but we can stop loading here
      console.error("Payment failed", err);
    } finally {
      setPaymentInProgress(null);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <h1>Billing</h1>
      <p className={styles.pageDescription}>
        Manage your invoices, payments, and insurance policies.
      </p>

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
                <button
                  onClick={() => handlePayInvoice(invoice.id, invoice.financialSummary.amountDue)}
                  disabled={loading || paymentInProgress === invoice.id}
                  className={styles.payButton}
                >
                  {paymentInProgress === invoice.id ? 'Processing...' : `Pay $${invoice.financialSummary.amountDue.toFixed(2)} Now`}
                </button>
              </div>
            ))
          ) : (
            !loading && <p>No outstanding invoices. You're all paid up!</p>
          )}
        </section>

        {/* --- Column 2: Insurance & Payments --- */}
        <div className={styles.columnSecondary}>

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
    </div>
  );
};

export default Billing;