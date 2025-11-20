import React, { useState, useMemo, useCallback } from 'react';
import { useEngagementData } from '../contexts';
import styles from './Documents.module.css';

// --- 1. Import components ---
import DocumentUploadCard from '../components/documents/DocumentUploadCard';
import DocumentList from '../components/documents/DocumentList';
import DocumentPreviewModal from '../components/documents/DocumentPreviewModal';
import DocumentFilters from '../components/documents/DocumentFilters';
import DocumentRenameModal from '../components/documents/DocumentRenameModal';
import DownloadableForms from '../components/documents/DownloadableForms'; 

const Documents = () => {
  const { 
    documents, 
    uploadDocument, 
    archiveDocument,
    restoreDocument, // <-- New from context
    updateDocument,  // <-- New from context (for renaming)
    loading, 
    error 
  } = useEngagementData();

  // --- 2. State for Modals ---
  const [previewDoc, setPreviewDoc] = useState(null);
  const [renamingDoc, setRenamingDoc] = useState(null); // For rename modal

  // --- 3. State for Filters/Sorting ---
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date_desc'); // Default: Newest first
  const [showArchived, setShowArchived] = useState(false);   // Default: Show Active

  // --- 4. Handlers ---

  const handleUpload = useCallback(async (file, category) => {
    await uploadDocument(file, category);
  }, [uploadDocument]);

  const handleFormUpload = useCallback(async (file, formDef) => {
    if (!file || !formDef) return;

    try {
      // 1. Define the "Context" so the system knows this file belongs to this form
      const linkContext = {
        type: 'FormDefinition',
        id: formDef.id,
        description: formDef.title
      };
      
      // 2. Use the form's default category
      const category = formDef.defaultCategory || 'Consent Form';

      // 3. Upload
      await uploadDocument(file, category, linkContext);
      
      // The list will auto-update because 'documents' context will change
    } catch (err) {
      console.error("Form upload failed", err);
      // Ideally set an error state here to show a toast
    }
  }, [uploadDocument]);

  const handleDelete = useCallback(async (docId) => {
    if (window.confirm("Are you sure you want to archive this document?")) {
      try {
        await archiveDocument(docId);
      } catch (err) {
        console.error("Archive failed", err);
      }
    }
  }, [archiveDocument]);

  const handleRestore = useCallback(async (docId) => {
    if (window.confirm("Restore this document to your active list?")) {
      try {
        await restoreDocument(docId);
      } catch (err) {
        console.error("Restore failed", err);
      }
    }
  }, [restoreDocument]);

  const handleRename = (doc) => {
    setRenamingDoc(doc);
  };

  const handleSaveRename = async (docId, updates) => { // Changed 'newName' to 'updates'
  try {
    // 'updates' is now { fileName: "...", tags: [...] }
    // This matches exactly what updateDocument expects!
    await updateDocument(docId, updates);
    setRenamingDoc(null);
  } catch (err) {
    console.error("Rename failed", err);
  }
};

  // --- 5. Filtering & Sorting Logic ---
  const processedDocuments = useMemo(() => {
    // A. Filter by Status (Active vs Archived)
    let result = documents.filter(doc => 
      showArchived 
        ? doc.systemInfo.status === 'Archived' 
        : doc.systemInfo.status === 'Active'
    );

    // B. Filter by Search Query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(doc => 
        doc.fileName.toLowerCase().includes(lowerQuery) ||
        doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        doc.category.toLowerCase().includes(lowerQuery)
      );
    }

    // C. Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'date_desc':
          return new Date(b.systemInfo.createdAt) - new Date(a.systemInfo.createdAt);
        case 'date_asc':
          return new Date(a.systemInfo.createdAt) - new Date(b.systemInfo.createdAt);
        case 'name_asc':
          return a.fileName.localeCompare(b.fileName);
        case 'name_desc':
          return b.fileName.localeCompare(a.fileName);
        default:
          return 0;
      }
    });

    // D. Group by Category
    return result.reduce((acc, doc) => {
      const category = doc.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {});
  }, [documents, showArchived, searchQuery, sortOption]);


  return (
    <div className={styles.pageWrapper}>
      <h1>Documents</h1>
      <p className={styles.pageDescription}>
        Upload and manage your important documents.
      </p>

      {error && <p className="error-text">Error: {error}</p>}
      {/*  Download Section */}
      <DownloadableForms 
        onFormUpload={handleFormUpload}
        loading={loading}
      />

      {/* --- Filters & Upload --- */}
      <DocumentUploadCard 
        onUpload={handleUpload}
        loading={loading}
      />

      <DocumentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
        showArchived={showArchived}
        onToggleArchived={setShowArchived}
      />

      {/* --- Document List --- */}
      {loading && documents.length === 0 ? (
        <p>Loading documents...</p>
      ) : (
        <DocumentList
          categorizedDocuments={processedDocuments}
          onArchive={handleDelete}
          onRestore={handleRestore} // Pass restore handler
          onPreview={setPreviewDoc} // Simple setter works here
          onRename={handleRename}   // Pass rename handler
          loading={loading}
          isShowingArchived={showArchived} // Let list know context
        />
      )}

      {/* --- Modals --- */}
      <DocumentPreviewModal
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
      />

      <DocumentRenameModal
        isOpen={!!renamingDoc}
        doc={renamingDoc}
        onClose={() => setRenamingDoc(null)}
        onSave={handleSaveRename}
        loading={loading}
      />
    </div>
  );
};

export default Documents;