import React, { useState } from 'react';
import styles from './InvoiceCard.module.css';

/**
 * A card that displays a single outstanding invoice.
 * It manages its own expanded/collapsed state to show line items.
 *
 * @param {object} props
 *_ @param {object} props.invoice - The invoice object to display.
 * @param {function} props.onPayClick - Function to call when "Pay Now" is clicked.
 * @param {boolean} props.isLoading - Whether the app is in a global loading state.
 */
const InvoiceCard = ({ invoice, onPayClick, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    financialSummary,
    lineItems,
    notesToPatient,
    invoiceNumber,
    invoiceDate,
  } = invoice;

  return (
    <div className={`card ${styles.invoiceCard}`}>
      {/* --- Card Header (Always Visible) --- */}
      <div 
        className={styles.invoiceHeader} 
        onClick={() => setIsExpanded(prev => !prev)}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`details-${invoice.id}`}
      >
        <div className={styles.headerInfo}>
          <strong>Invoice #{invoiceNumber}</strong>
          <span>Date: {invoiceDate}</span>
        </div>
        <div className={styles.headerAmount}>
          <span className={styles.amountDue}>
            ${financialSummary.amountDue.toFixed(2)} Due
          </span>
          <span className={styles.expandIcon}>{isExpanded ? '−' : '+'}</span>
        </div>
      </div>

      {/* --- Expandable Details (Line Items) --- */}
      {isExpanded && (
        <div className={styles.invoiceDetails} id={`details-${invoice.id}`}>
          {/* 1. Line Items */}
          <div className={styles.detailSection}>
            <h4>Line Items</h4>
            <ul className={styles.lineItemList}>
              {lineItems.map(item => (
                <li key={item.id} className={styles.lineItem}>
                  <span>{item.description}</span>
                  <span>${item.patientPortion.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* 2. Financial Summary */}
          <div className={styles.detailSection}>
            <h4>Financial Summary</h4>
            <ul className={styles.summaryList}>
              <li>
                <span>Total Charges</span>
                <span>${financialSummary.totalCharges.toFixed(2)}</span>
              </li>
              <li>
                <span>Insurance Paid</span>
                <span>-${financialSummary.totalInsurancePaid.toFixed(2)}</span>
              </li>
              <li>
                <span>Your Responsibility</span>
                <strong>${financialSummary.patientResponsibility.toFixed(2)}</strong>
              </li>
              <li>
                <span>Payments Made</span>
                <span>-${financialSummary.totalPaymentsMade.toFixed(2)}</span>
              </li>
              <li className={styles.summaryTotal}>
                <span>Amount Due</span>
                <strong>${financialSummary.amountDue.toFixed(2)}</strong>
              </li>
            </ul>
          </div>

          {/* 3. Notes from Staff */}
          {notesToPatient && (
            <div className={styles.detailSection}>
              <h4>Notes</h4>
              <p className={styles.notes}>{notesToPatient}</p>
            </div>
          )}
        </div>
      )}

      {/* --- Card Footer (Pay Button) --- */}
      <div className={styles.invoiceFooter}>
        <button
          onClick={() => onPayClick(invoice)}
          disabled={isLoading}
          className={styles.payButton}
        >
          {`Pay $${financialSummary.amountDue.toFixed(2)} Now`}
        </button>
      </div>
    </div>
  );
};

export default InvoiceCard;