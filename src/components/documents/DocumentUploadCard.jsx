import React, { useState } from 'react';
import { IconUploadCloud } from '../../layouts/components/Icons';
import { DOCUMENT_CATEGORIES } from '../../constants';
import styles from './DocumentUploadCard.module.css';

/**
 * A component for the "Upload File" card on the Documents page.
 * It manages the file selection, category selection, and upload submission.
 */
const DocumentUploadCard = ({ onUpload, loading }) => {
  const [fileToUpload, setFileToUpload] = useState(null);
  // --- CHANGE 1: Start with no category selected ---
  const [uploadCategory, setUploadCategory] = useState(''); 
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File is too large (max 10MB).');
        setFileToUpload(null);
        return;
      }
      setFileToUpload(file);
    }
  };

  const handleSubmit = async () => {
    // --- CHANGE 2: Add category validation ---
    if (!fileToUpload) {
      setError('Please select a file first.');
      return;
    }
    if (!uploadCategory) {
      setError('Please select a category first.');
      return;
    }
    // ----------------------------------------

    setError(null);
    try {
      await onUpload(fileToUpload, uploadCategory);
      setFileToUpload(null); // Clear selection on success
      setUploadCategory(''); // Reset category on success
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    }
  };
  
  // --- CHANGE 3: Determine if upload button should be disabled ---
  const canUpload = fileToUpload && uploadCategory && !loading;

  return (
    <div className={`card ${styles.uploadCard}`}>
      <IconUploadCloud className={styles.uploadIcon} />

      <div className={styles.uploadForm}>
        {/* --- File Input --- */}
        <div className="form-group">
          <label htmlFor="file-upload" className={styles.uploadLabel}>
            {fileToUpload ? `Selected: ${fileToUpload.name}` : "Click to select a file"}
          </label>
          <input
            id="file-upload"
            type="file"
            className={styles.uploadInput}
            onChange={handleFileChange}
            accept="image/*, application/pdf"
            disabled={loading} // Only disable if loading
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
            // --- CHANGE 4: Only disable while loading ---
            disabled={loading} 
          >
            {/* --- CHANGE 5: Add a placeholder option --- */}
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
      {/* --- CHANGE 6: Show button if file is selected, but use `canUpload` for disabled state --- */}
      {fileToUpload && (
        <button
          onClick={handleSubmit}
          disabled={!canUpload} // Use combined state
          className={styles.uploadButton}
        >
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      )}
    </div>
  );
};

export default DocumentUploadCard;