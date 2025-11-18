import React, { useState } from 'react';
import styles from './InvoiceCard.module.css';
import { formatCurrency } from '../../utils/formatting';
import { IconChevronDown } from '../../layouts/components/Icons'; // <-- 1. IMPORT

/**
 * A card that displays a single outstanding invoice.
 * It manages its own expanded/collapsed state to show line items.
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
            {formatCurrency(financialSummary.amountDue)} Due
          </span>
          {/* --- 2. REPLACE THE SPAN WITH THE ICON --- */}
          <IconChevronDown 
            className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`} 
          />
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
                  <span>{formatCurrency(item.patientPortion)}</span>
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
                <span>{formatCurrency(financialSummary.totalCharges)}</span>
              </li>
              <li>
                <span>Insurance Paid</span>
                <span>-{formatCurrency(financialSummary.totalInsurancePaid)}</span>
              </li>
              <li>
                <span>Your Responsibility</span>
                <strong>{formatCurrency(financialSummary.patientResponsibility)}</strong>
              </li>
              <li>
                <span>Payments Made</span>
                <span>-{formatCurrency(financialSummary.totalPaymentsMade)}</span>
              </li>
              <li className={styles.summaryTotal}>
                <span>Amount Due</span>
                <strong>{formatCurrency(financialSummary.amountDue)}</strong>
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
          {`Pay ${formatCurrency(financialSummary.amountDue)} Now`}
        </button>
      </div>
    </div>
  );
};

export default InvoiceCard;