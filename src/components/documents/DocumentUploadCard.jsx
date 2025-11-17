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
  const [uploadCategory, setUploadCategory] = useState(DOCUMENT_CATEGORIES[0]);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // --- Client-side validation ---
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File is too large (max 10MB).');
        setFileToUpload(null);
        return;
      }
      setFileToUpload(file);
    }
  };

  const handleSubmit = async () => {
    if (!fileToUpload) {
      setError('Please select a file first.');
      return;
    }

    setError(null);
    try {
      // Pass the file and category up to the parent page
      await onUpload(fileToUpload, uploadCategory);
      setFileToUpload(null); // Clear selection on success
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    }
  };

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
            accept="image/*, application/pdf" // Add file type restriction
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
            disabled={!fileToUpload || loading}
          >
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
          disabled={loading}
          className={styles.uploadButton}
        >
          {loading ? 'Uploading...' : 'Upload File'}
        </button>
      )}
    </div>
  );
};

export default DocumentUploadCard;