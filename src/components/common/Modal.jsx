import React, { useEffect, useState } from 'react'; // 1. Add useState
import { IconClose } from '../../layouts/components/Icons';
import styles from './Modal.module.css';

/**
 * A reusable, mobile-first modal component for alerts and confirmations.
 *
 * ... (all prop comments remain the same) ...
 * @param {boolean} [props.isLoading] - Disables all buttons and close actions (global loading).
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
}) => {
  // --- 2. ADD INTERNAL LOADING STATE ---
  const [isProcessing, setIsProcessing] = useState(false);

  // --- 3. RESET INTERNAL STATE WHEN MODAL IS CLOSED/OPENED ---
  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false); // Reset on open
    }
  }, [isOpen]);

  // --- 4. UPDATE ESCAPE KEY HANDLER ---
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (isLoading || isProcessing) return; // <-- Use both
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, isLoading, isProcessing]); // <-- Add all deps

  // Prevent modal from rendering if not open
  if (!isOpen) {
    return null;
  }

  // --- 5. UPDATE CLICK HANDLERS ---
  const handlePrimaryClick = async () => {
    setIsProcessing(true); // <-- Set internal state *immediately*
    if (onPrimaryAction) {
      try {
        await onPrimaryAction();
        // Action succeeded, close the modal
        onClose();
      } catch (e) {
        console.error("Modal primary action failed:", e);
        // Don't close the modal if the action failed
        setIsProcessing(false); // Re-enable button
        return; // Stop execution
      }
    } else {
      // If no action, just close
      onClose();
    }
    // We only want to setIsProcessing(false) if an error occurs
  };

  const handleSecondaryClick = () => {
    // Secondary action (like "Cancel") should not be async
    if (onSecondaryAction) {
      onSecondaryAction();
    }
    onClose();
  };

  const handleOverlayClick = () => {
    if (isLoading || isProcessing) return; // <-- Use both
    onClose();
  };

  // --- 6. COMBINE LOADING STATES FOR 'disabled' ---
  const isDisabled = isLoading || isProcessing;
  
  // Determine button text based on loading state
  let buttonText = primaryActionText;
  if (isProcessing) {
    buttonText = "Processing...";
  } else if (isLoading) {
    // Use more specific text if available
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
        className={`card ${styles.modalCard}`} 
        onClick={(e) => e.stopPropagation()} // Prevent overlay click when clicking card
      >
        {/* --- Modal Header --- */}
        <div className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {title}
          </h2>
          <button 
            type="button" 
            className="icon-button" 
            onClick={handleOverlayClick} 
            disabled={isDisabled} // <-- Use combined state
          >
            <IconClose />
          </button>
        </div>

        {/* --- Modal Body --- */}
        <div className={styles.modalBody}>
          {children}
        </div>

        {/* --- Modal Footer (Actions) --- */}
        {(primaryActionText || secondaryActionText) && (
          <div className={styles.modalFooter}>
            {secondaryActionText && (
              <button 
                type="button" 
                className="secondary" 
                onClick={handleSecondaryClick}
                disabled={isDisabled} // <-- Use combined state
              >
                {secondaryActionText}
              </button>
            )}
            {primaryActionText && (
              <button 
                type="button" 
                className={primaryActionVariant === 'danger' ? 'danger' : ''}
                onClick={handlePrimaryClick}
                disabled={isDisabled} // <-- Use combined state
              >
                {/* --- 7. UPDATE TEXT --- */}
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