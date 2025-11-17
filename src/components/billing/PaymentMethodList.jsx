import React, { useState } from 'react';
import { useBillingData } from '../../contexts';
import { IconBilling, IconTrash } from '../../layouts/components/Icons';
import Modal from '../common/Modal'; // Import the common modal
import styles from './PaymentMethodList.module.css';

/**
 * Renders the "Payment Methods" card, allowing users to view,
 * add, remove, and set default payment methods.
 *
 * @param {object} props
 * @param {function} props.onAddNew - Function to call to open the "Add New" modal.
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

  // --- Event Handlers ---

  // Opens the confirmation modal before removing
  const handleRemoveClick = (method) => {
    setRemoveTarget(method);
    setIsRemoveModalOpen(true);
  };

  // Called by the modal's "Remove" button
  const handleConfirmRemove = async () => {
    if (!removeTarget) return;
    try {
      await removePaymentMethod(removeTarget.id);
      setRemoveTarget(null);
      // Modal closes on success
    } catch (err) {
      console.error("Failed to remove payment method", err);
      // Re-throw to keep modal open and show error
      throw err;
    }
  };

  // Sets a card as default
  const handleSetDefault = async (methodId) => {
    // This action is low-risk, no modal needed
    try {
      await setDefaultPaymentMethod(methodId);
    } catch (err) {
      console.error("Failed to set default payment method", err);
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
                <IconBilling className={styles.cardIcon} />
                <div className={styles.cardInfo}>
                  <strong>{method.cardType} **** {method.lastFour}</strong>
                  <span>Expires {method.expMonth}/{method.expYear}</span>
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
                    title="Remove card"
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

      {/* Confirmation Modal for Removing a Card */}
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
        <p>Are you sure you want to remove this card?</p>
        {removeTarget && (
          <p><strong>{removeTarget.cardType} **** {removeTarget.lastFour}</strong></p>
        )}
      </Modal>
    </>
  );
};

export default PaymentMethodList;