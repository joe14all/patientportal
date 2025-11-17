import React from 'react';
// --- 1. RE-IMPORT IconEye ---
import { IconFileText, IconImage, IconDownload, IconTrash, IconEye } from '../../layouts/components/Icons';
import styles from './DocumentItem.module.css';

// Helper to format file size
const formatFileSize = (bytes) => {
// ... (existing helper code) ...
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to show a file or image icon
const getIconForDoc = (doc) => {
// ... (existing helper code) ...
  if (doc.storage.fileType.startsWith('image/')) {
    return <IconImage />;
  }
  return <IconFileText />;
};

/**
 * Renders a single row in the document list.
 */
const DocumentItem = ({ doc, onArchive, onPreview, loading }) => {
  const isImage = doc.storage.fileType.startsWith('image/');
  const isPdf = doc.storage.fileType === 'application/pdf';
  const canPreview = isImage || isPdf;

  // --- 2. Remove the main click handler ---

  return (
    <li className={styles.docItem}>
      <div className={styles.docIcon}>
        {getIconForDoc(doc)}
      </div>
      
      {/* --- 3. REMOVE clickable logic from docInfo --- */}
      <div 
        className={styles.docInfo} 
        title={doc.fileName}
      >
        <span className={styles.docName}>{doc.fileName}</span>
        <span className={styles.docMeta}>
          {new Date(doc.systemInfo.createdAt).toLocaleDateString()}
          {' • '}
          {formatFileSize(doc.storage.fileSize)}
        </span>
      </div>
      
      <div className={styles.docActions}>
        {/* --- 4. ADD IconEye button BACK --- */}
        {canPreview && (
          <button
            onClick={() => onPreview(doc)}
            disabled={loading}
            className="icon-button"
            title="Preview file"
          >
            <IconEye />
          </button>
        )}
        <a 
          href={doc.storage.url} 
          download={doc.fileName} 
          className="icon-button"
          title="Download file"
          // --- 5. Remove stopPropagation ---
        >
          <IconDownload />
        </a>
        <button
          onClick={() => onArchive(doc.id)}
          disabled={loading}
          className="icon-button danger"
          title="Archive file"
          // --- 6. Remove stopPropagation ---
        >
          <IconTrash />
        </button>
      </div>
    </li>
  );
};

export default DocumentItem;