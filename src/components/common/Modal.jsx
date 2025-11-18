import React, { useEffect, useState } from 'react';
import { IconClose } from '../../layouts/components/Icons';
import styles from './Modal.module.css';

/**
 * A reusable, mobile-first modal component for alerts and confirmations.
 *
 * ... (all prop comments) ...
 * @param {boolean} [props.isLoading] - Disables all buttons and close actions (global loading).
 * @param {boolean} [props.primaryActionDisabled] - Disables just the primary action button.
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  primaryActionText,
  onPrimaryAction,
  secondaryActionText,
  onSecondaryAction,
  primaryActionVariant = 'primary',
  isLoading = false, // This is the GLOBAL loading state
  primaryActionDisabled = false, // <-- 1. ADD NEW PROP
  modalClassName = '',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  // --- 2. REMOVED internalError state ---

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      // --- 3. REMOVED error reset ---
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (isLoading || isProcessing) return;
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, isLoading, isProcessing]);

  if (!isOpen) {
    return null;
  }

  // --- 4. SIMPLIFIED handlePrimaryClick ---
  const handlePrimaryClick = async () => {
    setIsProcessing(true);
    if (onPrimaryAction) {
      try {
        await onPrimaryAction();
        // Action succeeded, close the modal
        onClose();
      } catch (e) {
        // We still want to catch API errors (e.g., network failure)
        console.error("Modal primary action failed:", e);
        alert(e.message || "An unexpected error occurred."); // Use alert as a fallback
        setIsProcessing(false); // Re-enable button
        return; 
      }
    } else {
      onClose();
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    }
    onClose();
  };

  const handleOverlayClick = () => {
    if (isLoading || isProcessing) return;
    onClose();
  };

  // --- 5. UPDATE DISABLED LOGIC ---
  const isFormLoading = isLoading || isProcessing;
  const isPrimaryDisabled = isFormLoading || primaryActionDisabled; // <-- Combine
  
  let buttonText = primaryActionText;
  if (isProcessing) {
    buttonText = "Processing...";
  } else if (isLoading) {
    buttonText = primaryActionText.includes("Cancel") ? "Cancelling..." : "Loading...";
  }

  return (
    <div 
      className={styles.overlay} 
      onClick={handleOverlayClick} 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-title"
    >
      <div 
        className={`card ${styles.modalCard} ${modalClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {title}
          </h2>
          <button 
            type="button" 
            className="icon-button" 
            onClick={handleOverlayClick} 
            disabled={isFormLoading} // <-- Use this
          >
            <IconClose />
          </button>
        </div>

        <div className={styles.modalBody}>
          {children}
          {/* --- 6. REMOVED error display area --- */}
        </div>

        {(primaryActionText || secondaryActionText) && (
          <div className={styles.modalFooter}>
            {secondaryActionText && (
              <button 
                type="button" 
                className="secondary" 
                onClick={handleSecondaryClick}
                disabled={isFormLoading} // <-- Use this
              >
                {secondaryActionText}
              </button>
            )}
            {primaryActionText && (
              <button 
                type="button" 
                className={primaryActionVariant === 'danger' ? 'danger' : ''}
                onClick={handlePrimaryClick}
                disabled={isPrimaryDisabled} // <-- 7. USE NEW COMBINED STATE
              >
                {buttonText} 
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;