import React, { useState } from 'react';
import { useBillingData } from '../../contexts';
import { IconArrowLeft } from '../../layouts/components/Icons';
import styles from './AddPaymentMethodForm.module.css';

// 1. Import all our sub-components
import PaymentMethodSelector from './addPaymentMethodForm/PaymentMethodSelector';
import CardForm from './addPaymentMethodForm/CardForm';
import BankForm from './addPaymentMethodForm/BankForm';
import OnlineForm from './addPaymentMethodForm/OnlineForm'; // <-- 1. IMPORT NEW FORM
// No longer need PlaceholderForm

/**
 * A "controller" component that manages the flow of adding a new payment method.
 * It shows a selection screen first, then the appropriate form.
 */
const AddPaymentMethodForm = ({ onSuccess, onCancel }) => {
  const { loading } = useBillingData(); // Get loading state for disabling
  
  // State to manage which view is visible: null (selector), 'card', 'bank', etc.
  const [methodType, setMethodType] = useState(null); 

  // --- Main Render Logic ---
  return (
    <div className={styles.formWrapper}>
      
      {/* --- SHOW SELECTION SCREEN FIRST --- */}
      {!methodType && (
        <PaymentMethodSelector onSelectMethod={setMethodType} />
      )}

      {/* --- SHOW FORM/PLACEHOLDER AFTER SELECTION --- */}
      {methodType && (
        <div className={styles.formContent}>
          {/* Back button */}
          <button
            type="button"
            className={`${styles.backButton} icon-button`}
            onClick={() => setMethodType(null)} // Go back to selection
            disabled={loading}
            title="Back"
          >
            <IconArrowLeft />
          </button>
          
          {/* Render the correct form component.
            We pass onCancel and onSuccess down to the child,
            so it can control closing the modal.
          */}
          {methodType === 'card' && (
            <CardForm 
              onCancel={onCancel} 
              onSuccess={onSuccess} 
            />
          )}
          
          {methodType === 'bank' && (
            <BankForm 
              onCancel={onCancel} 
              onSuccess={onSuccess}
            />
          )}
          
          {/* --- 2. THIS IS THE UPDATE --- */}
          {methodType === 'online' && (
            <OnlineForm 
              onCancel={onCancel} 
              onSuccess={onSuccess}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AddPaymentMethodForm;