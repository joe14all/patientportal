import React, { useState, useMemo, useCallback } from 'react';
import { useEngagementData } from '../contexts';
import styles from './Documents.module.css';

// --- 1. Import all the new components ---
import DocumentUploadCard from '../components/documents/DocumentUploadCard';
import DocumentList from '../components/documents/DocumentList';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';
// (Icons are no longer needed here)

const Documents = () => {
  const { 
    documents, 
    uploadDocument, 
    archiveDocument, 
    loading, 
    error 
  } = useEngagementData();

  // --- 2. State for preview modal ---
  const [previewDoc, setPreviewDoc] = useState(null);

  // --- 3. Handlers are simplified and passed down ---
  const handleUpload = useCallback(async (file, category) => {
    // The component's internal state handles loading
    await uploadDocument(file, category);
  }, [uploadDocument]); // Add dependency

  const handleDelete = useCallback(async (docId) => {
    if (window.confirm("Are you sure you want to archive this document?")) {
      try {
        await archiveDocument(docId);
      } catch (err) {
        console.error("Archive failed", err);
      }
    }
  }, [archiveDocument]); // Add dependency

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
  };

  const handleClosePreview = () => {
    setPreviewDoc(null);
  };

  // --- 4. Data processing remains the same ---
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


  return (
    <div className={styles.pageWrapper}>
      <h1>Documents</h1>
      <p className={styles.pageDescription}>
        Upload and manage your important documents.
      </p>

      {error && <p className="error-text">Error: {error}</p>}

      {/* --- 5. Render the new components --- */}
      
      <DocumentUploadCard 
        onUpload={handleUpload}
        loading={loading}
      />

      {loading && documents.length === 0 && <p>Loading documents...</p>}
      
      <DocumentList
        categorizedDocuments={categorizedDocuments}
        onArchive={handleDelete}
        onPreview={handlePreview}
        loading={loading}
      />

      <DocumentPreviewModal
        doc={previewDoc}
        onClose={handleClosePreview}
      />
    </div>
  );
};

export default Documents;