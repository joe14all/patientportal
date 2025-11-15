import React, { useEffect } from 'react';
import { IconClose } from '../../layouts/components/Icons';
import styles from './Modal.module.css';

/**
 * A reusable, mobile-first modal component for alerts and confirmations.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {function} props.onClose - Function to call when closing the modal (overlay click or 'X' button).
 * @param {string} props.title - The text to display in the modal header.
 * @param {React.ReactNode} props.children - The content to display in the modal body (e.g., <p>Are you sure?</p>).
 * @param {string} [props.primaryActionText] - Text for the main action button (e.g., "Confirm").
 * @param {function} [props.onPrimaryAction] - Function to call when the main action button is clicked.
 * @param {string} [props.secondaryActionText] - Text for the secondary action button (e.g., "Cancel").
 * @param {function} [props.onSecondaryAction] - Function to call when the secondary button is clicked.
 * @param {string} [props.primaryActionVariant] - 'primary' (default) or 'danger'.
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
  primaryActionVariant = 'primary' // 'primary' or 'danger'
}) => {
  // Effect to handle the 'Esc' key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
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
  }, [isOpen, onClose]);

  // Prevent modal from rendering if not open
  if (!isOpen) {
    return null;
  }

  // Handle button clicks
  const handlePrimaryClick = () => {
    if (onPrimaryAction) {
      onPrimaryAction();
    }
    onClose(); // Automatically close modal after action
  };

  const handleSecondaryClick = () => {
    if (onSecondaryAction) {
      onSecondaryAction();
    }
    onClose(); // Automatically close modal after action
  };

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose} 
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
          <button type="button" className="icon-button" onClick={onClose}>
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
              >
                {secondaryActionText}
              </button>
            )}
            {primaryActionText && (
              <button 
                type="button" 
                className={primaryActionVariant === 'danger' ? 'danger' : ''}
                onClick={handlePrimaryClick}
              >
                {primaryActionText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;