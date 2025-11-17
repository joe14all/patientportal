import React from 'react';
import Modal from '../common/Modal'; // Use the generic modal
import styles from './DocumentPreviewModal.module.css';

/**
 * A modal to display a preview of an image or PDF.
 */
const DocumentPreviewModal = ({ doc, onClose }) => {
  if (!doc) {
    return null;
  }

  // Check file type
  const fileType = doc.storage.fileType;
  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf';

  // Render the correct preview element
  const renderPreview = () => {
    if (isImage) {
      return (
        <img src={doc.storage.url} alt={doc.fileName} className={styles.previewImage} />
      );
    }

    if (isPdf) {
      return (
        <embed
          src={doc.storage.url}
          type="application/pdf"
          className={styles.pdfEmbed}
          title={doc.fileName}
        />
      );
    }

    // Fallback for unsupported types
    return (
      <p className={styles.unsupportedText}>
        Previews are not available for this file type.
        <br />
        Please download the file to view it.
      </p>
    );
  };

  return (
    <Modal
      isOpen={!!doc}
      onClose={onClose}
      title={doc.fileName}
      secondaryActionText="Close"
      // Pass our custom class to make the modal wider
      modalClassName={styles.previewModalCard} 
    >
      <div className={styles.previewContainer}>
        {renderPreview()}
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;