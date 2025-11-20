import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import styles from './DocumentRenameModal.module.css';

const DocumentRenameModal = ({ isOpen, onClose, onSave, doc, loading }) => {
  const [newName, setNewName] = useState('');
  
  // --- NEW: State for Tags ---
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Pre-fill inputs when the modal opens
  useEffect(() => {
    if (doc) {
      setNewName(doc.fileName);
      // Initialize tags from the document, or empty array if none
      setTags(doc.tags || []); 
    }
  }, [doc]);

  // --- NEW: Handle Adding Tags ---
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent submitting the whole form
      const val = tagInput.trim();
      // Only add if not empty and not already in the list
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  // --- NEW: Handle Removing Tags ---
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      // --- UPDATED: Pass an object with ALL updates ---
      onSave(doc.id, { 
        fileName: newName, 
        tags: tags 
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Document Details" 
      primaryActionText={loading ? "Saving..." : "Save"}
      onPrimaryAction={handleSubmit}
      secondaryActionText="Cancel"
      isLoading={loading}
    >
      <form id="rename-form" onSubmit={handleSubmit} className={styles.form}>
        
        {/* --- File Name Input --- */}
        <div className="form-group">
          <label htmlFor="fileName">File Name</label>
          <input
            type="text"
            id="fileName"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={styles.input}
            // Only auto-focus if we aren't messing with tags
            autoFocus={!tags.length} 
          />
        </div>

        {/* --- NEW: Tags Input Section --- */}
        <div className="form-group">
          <label htmlFor="docTags">Tags</label>
          <input
            type="text"
            id="docTags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type tag and press Enter..."
            className={styles.input}
          />
          <p className={styles.helpText}>
            Press <strong>Enter</strong> to add a tag.
          </p>

          {/* --- Visual Tag List --- */}
          <div className={styles.tagList}>
            {tags.map((tag, index) => (
              <span key={index} className={styles.tagPill}>
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className={styles.removeTagBtn}
                  title="Remove tag"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

      </form>
    </Modal>
  );
};

export default DocumentRenameModal;