import React, { useState } from 'react';
import { useBillingData } from '../../contexts';
// --- NEW: Import new icons ---
import { IconBilling, IconTrash, IconBank, IconZap } from '../../layouts/components/Icons';
import Modal from '../common/Modal'; // Import the common modal
import styles from './PaymentMethodList.module.css';

// --- NEW: Helper to render card details ---
const CardDetails = ({ method }) => (
  <>
    <strong>{method.cardType} **** {method.lastFour}</strong>
    <span>Expires {method.expMonth}/{method.expYear}</span>
  </>
);

// --- NEW: Helper to render bank details ---
const BankDetails = ({ method }) => (
  <>
    <strong>{method.bankName}</strong>
    <span>{method.accountType} (....{method.lastFour})</span>
  </>
);

// --- NEW: Helper to render online service details ---
const OnlineDetails = ({ method }) => (
  <>
    <strong>{method.serviceName}</strong>
    <span>{method.email || 'Linked Account'}</span>
  </>
);

/**
 * Renders the "Payment Methods" card, allowing users to view,
 * add, remove, and set default payment methods.
 */
const PaymentMethodList = ({ onAddNew }) => {
  const { 
    paymentMethods, 
    removePaymentMethod, 
    setDefaultPaymentMethod, 
    loading 
  } = useBillingData();

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);

  // --- (Event Handlers remain the same) ---
  const handleRemoveClick = (method) => {
    setRemoveTarget(method);
    setIsRemoveModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    try {
      await removePaymentMethod(removeTarget.id);
      setRemoveTarget(null);
    } catch (err) {
      console.error("Failed to remove payment method", err);
      throw err;
    }
  };

  const handleSetDefault = async (methodId) => {
    try {
      await setDefaultPaymentMethod(methodId);
    } catch (err) {
      console.error("Failed to set default payment method", err);
    }
  };

  // --- NEW: Helper to get the correct icon ---
  const getIconForMethod = (method) => {
    switch (method.type) {
      case 'card':
        return <IconBilling className={styles.cardIcon} />;
      case 'bank':
        return <IconBank className={styles.cardIcon} />;
      case 'online':
        return <IconZap className={styles.cardIcon} />;
      default:
        return <IconBilling className={styles.cardIcon} />;
    }
  };

  // --- NEW: Helper to get the correct details ---
  const renderMethodDetails = (method) => {
    switch (method.type) {
      case 'card':
        return <CardDetails method={method} />;
      case 'bank':
        return <BankDetails method={method} />;
      case 'online':
        return <OnlineDetails method={method} />;
      default:
        return <strong>Unknown Payment Type</strong>;
    }
  };
  
  // --- NEW: Helper to get item title for modal ---
  const getMethodTitle = (method) => {
    if (!method) return '';
    switch (method.type) {
      case 'card':
        return `${method.cardType} **** ${method.lastFour}`;
      case 'bank':
        return `${method.bankName} (....${method.lastFour})`;
      default:
        return 'this method';
    }
  };

  return (
    <>
      <section className={`card ${styles.paymentCard}`}>
        <h2>Payment Methods</h2>
        {paymentMethods.length > 0 ? (
          <ul className={styles.paymentList}>
            {paymentMethods.map(method => (
              <li className={styles.paymentItem} key={method.id}>
                {/* --- UPDATED: Dynamic Icon --- */}
                {getIconForMethod(method)}
                
                {/* --- UPDATED: Dynamic Details --- */}
                <div className={styles.cardInfo}>
                  {renderMethodDetails(method)}
                </div>

                <div className={styles.cardMeta}>
                  {method.isDefault ? (
                    <span className={styles.defaultBadge}>Default</span>
                  ) : (
                    <button 
                      className={styles.setDefaultButton}
                      onClick={() => handleSetDefault(method.id)}
                      disabled={loading}
                    >
                      Set as Default
                    </button>
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    className="icon-button danger"
                    onClick={() => handleRemoveClick(method)}
                    disabled={loading}
                    title="Remove method"
                  >
                    <IconTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p className={styles.noMethodsText}>No payment methods on file.</p>
        )}
        
        {loading && paymentMethods.length === 0 && (
          <p className={styles.noMethodsText}>Loading payment methods...</p>
        )}

        <button
          className={`secondary ${styles.addButton}`}
          onClick={onAddNew}
          disabled={loading}
        >
          + Add New Payment Method
        </button>
      </section>

      {/* --- UPDATED: Dynamic Modal Text --- */}
      <Modal
        isOpen={isRemoveModalOpen}
        onClose={() => setIsRemoveModalOpen(false)}
        title="Remove Payment Method"
        primaryActionText="Remove"
        primaryActionVariant="danger"
        onPrimaryAction={handleConfirmRemove}
        secondaryActionText="Cancel"
        isLoading={loading}
      >
        <p>Are you sure you want to remove this payment method?</p>
        {removeTarget && (
          <p><strong>{getMethodTitle(removeTarget)}</strong></p>
        )}
      </Modal>
    </>
  );
};

export default PaymentMethodList;