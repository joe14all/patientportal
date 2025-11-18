import React, { useState, useMemo } from 'react';
import { useBillingData } from '../contexts';
import styles from './Billing.module.css';

// --- 1. Import all our components ---
import InvoiceList from '../components/billing/InvoiceList';
import InsuranceList from '../components/billing/InsuranceList';
import PaymentHistoryList from '../components/billing/PaymentHistoryList';
import PaymentMethodList from '../components/billing/PaymentMethodList';
import PaymentModal from '../components/common/PaymentModal';
import Modal from '../components/common/Modal';
import AddPaymentMethodForm from '../components/billing/AddPaymentMethodForm';
import AddInsuranceForm from '../components/billing/AddInsuranceForm'; // <-- 1. IMPORT

const Billing = () => {
  const {
    billingInvoices,
    loading,
    error,
  } = useBillingData();

  // --- 2. State for all our modals ---
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [invoiceToPay, setInvoiceToPay] = useState(null);
  
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  // --- 2. UNCOMMENT INSURANCE MODAL STATE ---
  const [isAddInsuranceModalOpen, setIsAddInsuranceModalOpen] = useState(false);

  
  // --- 3. Filter data for the InvoiceList ---
  const outstandingInvoices = useMemo(
    () => billingInvoices.filter(inv => inv.financialSummary.amountDue.amount > 0.01),
    [billingInvoices]
  );

  // --- 4. Handlers to open/close modals ---
  
  const handlePayInvoiceClick = (invoice) => {
    setInvoiceToPay(invoice);
    setIsPayModalOpen(true);
  };

  const handleClosePayModal = () => {
    setInvoiceToPay(null);
    setIsPayModalOpen(false);
  };
  
  const handleAddNewCard = () => {
    setIsAddCardModalOpen(true);
  };
  
  // --- 3. UPDATE HANDLER ---
  const handleAddNewInsurance = () => {
    setIsAddInsuranceModalOpen(true); // <-- REMOVE ALERT
  };

  return (
    <div className={styles.pageWrapper}>
      <h1>Billing</h1>
      <p className={styles.pageDescription}>
        Manage your invoices, payments, and insurance policies.
      </p>

      {error && <p className="error-text">Error: {error}</p>}

      {/* --- 5. Main Billing Layout Grid --- */}
      <div className={styles.billingLayout}>

        {/* --- Column 1: Invoices --- */}
        <InvoiceList
          invoices={outstandingInvoices}
          onPayClick={handlePayInvoiceClick}
          isLoading={loading}
        />

        {/* --- Column 2: Insurance, Payments, etc. --- */}
        <div className={styles.columnSecondary}>
          <PaymentMethodList onAddNew={handleAddNewCard} />
          <InsuranceList onAddClick={handleAddNewInsurance} />
          <PaymentHistoryList />
        </div>
      </div>

      {/* --- 6. All Modals --- */}
      
      {/* The new, specific Payment Modal */}
      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={handleClosePayModal}
        invoiceToPay={invoiceToPay}
      />
      
      {/* The generic Modal for adding a new card */}
      <Modal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        title="Add New Payment Method"
      >
        <AddPaymentMethodForm
          onSuccess={() => setIsAddCardModalOpen(false)}
          onCancel={() => setIsAddCardModalOpen(false)}
        />
      </Modal>
      
      {/* --- 4. ADD THE NEW MODAL --- */}
      <Modal
        isOpen={isAddInsuranceModalOpen}
        onClose={() => setIsAddInsuranceModalOpen(false)}
        title="Add Insurance Policy"
      >
        <AddInsuranceForm
          onSuccess={() => setIsAddInsuranceModalOpen(false)}
          onCancel={() => setIsAddInsuranceModalOpen(false)}
        />
      </Modal>

    </div>
  );
};

export default Billing;