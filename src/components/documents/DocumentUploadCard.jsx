import React, { useState, useCallback } from 'react';
import { IconUploadCloud } from '../../layouts/components/Icons';
import { DOCUMENT_CATEGORIES } from '../../constants';
import styles from './DocumentUploadCard.module.css';

/**
 * A component for the "Upload File" card on the Documents page.
 * Now supports Drag & Drop.
 */
const DocumentUploadCard = ({ onUpload, loading }) => {
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadCategory, setUploadCategory] = useState(''); 
  const [error, setError] = useState(null);
  
  // --- NEW: State for drag visual cues ---
  const [isDragActive, setIsDragActive] = useState(false);

  // --- NEW: Centralized file validation logic ---
  const processFile = (file) => {
    setError(null);
    if (!file) return;

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) { 
      setError('File is too large (max 10MB).');
      setFileToUpload(null);
      return;
    }
    
    setFileToUpload(file);
  };

  // --- Handlers for Input Click ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // --- NEW: Handlers for Drag & Drop ---
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) setIsDragActive(true);
  }, [loading]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (loading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [loading]);

  const handleSubmit = async () => {
    if (!fileToUpload) {
      setError('Please select a file first.');
      return;
    }
    if (!uploadCategory) {
      setError('Please select a category first.');
      return;
    }

    setError(null);
    try {
      await onUpload(fileToUpload, uploadCategory);
      setFileToUpload(null);
      setUploadCategory(''); 
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    }
  };
  
  const canUpload = fileToUpload && uploadCategory && !loading;

  return (
    <div 
      // Apply active class when dragging
      className={`${styles.uploadCard} ${isDragActive ? styles.dragActive : ''}`}
      // Attach Drag Handlers to the main container
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <IconUploadCloud className={styles.uploadIcon} />

      <div className={styles.uploadForm}>
        {/* --- File Input --- */}
        <div className="form-group">
          <label htmlFor="file-upload" className={styles.uploadLabel}>
            {fileToUpload 
              ? `Selected: ${fileToUpload.name}` 
              : (isDragActive ? "Drop file here..." : "Click to select or drag file here")
            }
          </label>
          <input
            id="file-upload"
            type="file"
            className={styles.uploadInput}
            onChange={handleFileChange}
            accept="image/*, application/pdf"
            disabled={loading}
          />
        </div>

        {/* --- Category Select --- */}
        <div className="form-group">
          <label htmlFor="file-category" className={styles.categoryLabel}>
            Select a category
          </label>
          <select
            id="file-category"
            className={styles.uploadSelect}
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value)}
            disabled={loading} 
          >
            <option value="" disabled>Choose a category...</option>
            {DOCUMENT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Error Display --- */}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* --- Upload Button --- */}
      {fileToUpload && (
        <button
          onClick={handleSubmit}
          disabled={!canUpload}
          className={styles.uploadButton}
        >
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      )}
    </div>
  );
};

export default DocumentUploadCard;