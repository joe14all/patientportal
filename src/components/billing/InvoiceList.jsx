import React from 'react';
import InvoiceCard from './InvoiceCard';
import styles from './InvoiceList.module.css';

/**
 * Renders the "Outstanding Invoices" section, including a list of InvoiceCard components.
 *
 * @param {object} props
 * @param {object[]} props.invoices - The list of outstanding invoices.
 * @param {function} props.onPayClick - The handler to open the payment modal.
 * @param {boolean} props.isLoading - Global loading state.
 */
const InvoiceList = ({ invoices, onPayClick, isLoading }) => {
  return (
    <section className={styles.section}>
      <h2>Outstanding Invoices</h2>
      
      {isLoading && !invoices.length && <p>Loading invoices...</p>}
      
      {invoices.length > 0 ? (
        <div className={styles.invoiceList}>
          {invoices.map(invoice => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onPayClick={onPayClick}
              isLoading={isLoading}
            />
          ))}
        </div>
      ) : (
        !isLoading && <p>No outstanding invoices. You're all paid up!</p>
      )}
    </section>
  );
};

export default InvoiceList;