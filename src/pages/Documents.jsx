import React, { useState, useMemo } from 'react';
import { useEngagementData } from '../contexts';
import styles from './Documents.module.css';
import { 
  IconUploadCloud, 
  IconFileText, 
  IconImage, 
  IconDownload, 
  IconTrash 
} from '../layouts/components/Icons';

const Documents = () => {
  const { 
    documents, 
    uploadDocument, 
    archiveDocument, 
    loading, 
    error 
  } = useEngagementData();

  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);

  // Handle file selection from the input
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  // Handle the upload button click
  const handleUpload = async () => {
    if (!fileToUpload) return;

    setUploading(true);
    try {
      // "Patient Upload" is a good default category
      await uploadDocument(fileToUpload, "Patient Upload");
      setFileToUpload(null); // Clear the file input
    } catch (err) {
      console.error("Upload failed", err);
      // Error is already in context
    } finally {
      setUploading(false);
    }
  };

  // Handle the delete (archive) button click
  const handleDelete = async (docId) => {
    if (window.confirm("Are you sure you want to archive this document?")) {
      try {
        await archiveDocument(docId);
      } catch (err) {
        console.error("Archive failed", err);
      }
    }
  };

  // Group documents by category for display
  const categorizedDocuments = useMemo(() => {
    const activeDocs = documents.filter(doc => doc.systemInfo.status === 'Active');
    
    return activeDocs.reduce((acc, doc) => {
      const category = doc.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {});
  }, [documents]);

  // Helper to show a file or image icon
  const getIconForDoc = (doc) => {
    if (doc.storage.fileType.startsWith('image/')) {
      return <IconImage className={styles.docIcon} />;
    }
    return <IconFileText className={styles.docIcon} />;
  };

  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.pageWrapper}>
      <h1>Documents</h1>
      <p className={styles.pageDescription}>
        Upload and manage your important documents.
      </p>

      {error && <p className="error-text">Error: {error}</p>}

      {/* --- Upload Section --- */}
      <div className={`card ${styles.uploadCard}`}>
        <IconUploadCloud className={styles.uploadIcon} />
        <label htmlFor="file-upload" className={styles.uploadLabel}>
          {fileToUpload ? `Selected: ${fileToUpload.name}` : "Click to select a file"}
        </label>
        <input 
          id="file-upload"
          type="file" 
          className={styles.uploadInput}
          onChange={handleFileChange}
        />
        {fileToUpload && (
          <button 
            onClick={handleUpload} 
            disabled={uploading || loading}
            className={styles.uploadButton}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        )}
      </div>

      {/* --- Document List Section --- */}
      {loading && documents.length === 0 && <p>Loading documents...</p>}
      
      {Object.keys(categorizedDocuments).map(category => (
        <section className={styles.docSection} key={category}>
          <h2>{category}</h2>
          <ul className={styles.docList}>
            {categorizedDocuments[category].map(doc => (
              <li className={styles.docItem} key={doc.id}>
                {getIconForDoc(doc)}
                <div className={styles.docInfo}>
                  <span className={styles.docName}>{doc.fileName}</span>
                  <span className={styles.docMeta}>
                    {new Date(doc.systemInfo.createdAt).toLocaleDateString()}
                    {' • '}
                    {formatFileSize(doc.storage.fileSize)}
                  </span>
                </div>
                <div className={styles.docActions}>
                  <a href={doc.storage.url} download={doc.fileName} className="icon-button">
                    <IconDownload />
                  </a>
                  <button 
                    onClick={() => handleDelete(doc.id)} 
                    disabled={loading}
                    className="icon-button danger"
                  >
                    <IconTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default Documents;