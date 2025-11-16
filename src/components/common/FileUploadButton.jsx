import React, { useRef } from 'react';
import { IconPaperclip } from '../../layouts/components/Icons';
import styles from './FileUploadButton.module.css';



/**
 * A reusable, styled button that wraps a hidden file input.
 * It's rendered as an icon-only button by default.
 *
 * @param {object} props
 * @param {function(File)} props.onFileSelect - Callback when a file is selected.
 * @param {string} [props.accept] - The 'accept' attribute for the file input (e.g., "image/*").
 * @param {boolean} [props.disabled] - Disables the button.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {React.ReactNode} [props.children] - Custom content for the button (overrides default icon).
 */
const FileUploadButton = ({ 
  onFileSelect, 
  accept, 
  disabled, 
  className, 
  children 
}) => {
  const inputRef = useRef(null);

  // When the visible button is clicked, it triggers the hidden file input
  const handleButtonClick = () => {
    inputRef.current.click();
  };

  // When a file is selected in the hidden input, this handler is called
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
    
    // IMPORTANT: Reset the input's value.
    // This allows the user to select the same file again if they
    // remove it and then want to re-add it.
    e.target.value = null; 
  };

  return (
    <>
      <button
        type="button"
        // Apply local styles and any class passed from the parent
        className={`${styles.uploadButton} ${className || ''}`}
        onClick={handleButtonClick}
        disabled={disabled}
        aria-label="Attach file"
      >
        {/* Allow parent to pass in text/icon, or default to paperclip */}
        {children || <IconPaperclip />}
      </button>
      
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        className={styles.hiddenInput} // Style to hide it
        accept={accept}
        disabled={disabled}
        aria-hidden="true" // Hide from screen readers
        tabIndex="-1" // Remove from keyboard navigation
      />
    </>
  );
};

export default FileUploadButton;