import React from 'react';
import { useEngagementData } from '../../contexts';
import { IconFileText, IconImage, IconDownload } from '../../layouts/components/Icons';
import styles from './MessageAttachment.module.css';

// Helper function (copied from your Documents.jsx)
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Renders a single message attachment (e.g., a file or image)
 * inside a chat bubble.
 *
 * @param {object} props
 * @param {object} props.attachment - The attachment object from the message post.
 * (e.g., { documentId: "...", fileName: "..." })
 */
const MessageAttachment = ({ attachment }) => {
  const { documents } = useEngagementData();

  // Find the full document object using the ID from the attachment.
  // The 'documents' list comes from the context, which holds all docs.
  const document = documents.find(d => d.id === attachment.documentId);

  // Fallback if document isn't found (e.g., still loading or archived)
  if (!document) {
    return (
      <div className={`${styles.fileAttachment} ${styles.notFound}`}>
        <IconFileText className={styles.fileIcon} />
        <div className={styles.fileInfo}>
          <strong>{attachment.fileName}</strong>
          <span>Attachment not found</span>
        </div>
      </div>
    );
  }

  const isImage = document.storage.fileType.startsWith('image/');

  // --- Render an Image Thumbnail ---
  if (isImage) {
    return (
      <a
        href={document.storage.url}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.imageAttachment}
        title={`View ${document.fileName}`}
      >
        <img 
          src={document.storage.url} 
          alt={document.fileName} 
          className={styles.imageThumbnail} 
        />
      </a>
    );
  }

  // --- Render a File Link ---
  return (
    <a
      href={document.storage.url}
      target="_blank"
      rel="noopener noreferrer"
      download={document.fileName}
      className={styles.fileAttachment}
      title={`Download ${document.fileName}`}
    >
      <IconFileText className={styles.fileIcon} />
      <div className={styles.fileInfo}>
        <strong>{document.fileName}</strong>
        <span>{formatFileSize(document.storage.fileSize)}</span>
      </div>
      <IconDownload className={styles.downloadIcon} />
    </a>
  );
};

export default MessageAttachment;