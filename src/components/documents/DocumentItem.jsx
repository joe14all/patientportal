import React from 'react';
import { 
  IconFileText, 
  IconImage, 
  IconDownload, 
  IconTrash, 
  IconEye, 
  IconEdit,
  IconRefresh 
} from '../../layouts/components/Icons';
import { DOCUMENT_CONTEXT_TYPES } from '../../constants';
import styles from './DocumentItem.module.css';

// Helper to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper to show a file or image icon
const getIconForDoc = (doc) => {
  if (doc.storage.fileType.startsWith('image/')) {
    return <IconImage />;
  }
  return <IconFileText />;
};

const DocumentItem = ({ 
  doc, 
  onArchive, 
  onRestore, 
  onPreview, 
  onRename, 
  loading, 
  isArchived 
}) => {
  const isImage = doc.storage.fileType.startsWith('image/');
  const isPdf = doc.storage.fileType === 'application/pdf';
  const canPreview = isImage || isPdf;

  // Resolve the friendly label for the context (if any)
  // e.g. "Invoice" -> "Billing Record"
  const contextLabel = doc.linkContext 
    ? DOCUMENT_CONTEXT_TYPES[doc.linkContext.type] 
    : null;

  return (
    <li className={`${styles.docItem} ${isArchived ? styles.archivedItem : ''}`}>
      <div className={styles.docIcon}>
        {getIconForDoc(doc)}
      </div>
      
      <div className={styles.docInfo} title={doc.fileName}>
        <span className={styles.docName}>{doc.fileName}</span>
        
        {/* Metadata Row */}
        <div className={styles.metaRow}>
          <span className={styles.docMeta}>
            {new Date(doc.systemInfo.createdAt).toLocaleDateString()}
            {' • '}
            {formatFileSize(doc.storage.fileSize)}
          </span>
          
          {/* 1. Context Badge (System Link) */}
          {contextLabel && (
            <span className={styles.contextBadge}>
              {contextLabel}
            </span>
          )}

          {/* 2. User Tags (Manual Tags) */}
          {doc.tags && doc.tags.length > 0 && (
            <div className={styles.tagGroup}>
              {doc.tags.map((tag, index) => (
                <span key={index} className={styles.userTag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.docActions}>
        {/* Rename (Edit) */}
        <button
          onClick={() => onRename(doc)}
          disabled={loading}
          className="icon-button"
          title="Rename or Tag file"
        >
          <IconEdit />
        </button>

        {/* Preview */}
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
        
        {/* Download */}
        <a 
          href={doc.storage.url} 
          download={doc.fileName} 
          className="icon-button"
          title="Download file"
        >
          <IconDownload />
        </a>

        {/* Archive OR Restore */}
        {isArchived ? (
          <button
            onClick={() => onRestore(doc.id)}
            disabled={loading}
            className="icon-button"
            title="Restore document"
            style={{ color: 'var(--success-500)' }}
          >
            <IconRefresh />
          </button>
        ) : (
          <button
            onClick={() => onArchive(doc.id)}
            disabled={loading}
            className="icon-button danger"
            title="Archive file"
          >
            <IconTrash />
          </button>
        )}
      </div>
    </li>
  );
};

export default DocumentItem;