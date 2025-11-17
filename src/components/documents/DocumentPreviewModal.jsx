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

  const isImage = doc.storage.fileType.startsWith('image/');

  return (
    <Modal
      isOpen={!!doc}
      onClose={onClose}
      title={doc.fileName}
      // No actions, just a "Close" button
      secondaryActionText="Close"
    >
      <div className={styles.previewContainer}>
        {isImage ? (
          <img src={doc.storage.url} alt={doc.fileName} className={styles.previewImage} />
        ) : (
          <p className={styles.unsupportedText}>
            PDF previews are not yet supported.
            Please download the file to view it.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;