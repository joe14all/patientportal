import React, { useState } from 'react';
import { useEngagementData } from '../../contexts';
import FileUploadButton from '../common/FileUploadButton';
import styles from './NewMessageForm.module.css';

/**
 * A self-contained form component for composing a new message.
 * It handles its own state, file attachments, and submission.
 *
 * @param {object} props
 * @param {function} props.onClose - Function to call to close/hide this form.
 */
const NewMessageForm = ({ onClose }) => {
  // --- Component State ---
  const [category, setCategory] = useState('Clinical'); // Default category
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState(null); // Holds the File object
  const [error, setError] = useState(null);

  // --- Context Hooks ---
  const { createNewThread, uploadDocument, loading } = useEngagementData();

  // --- Event Handlers ---

  /**
   * Clears error and updates state.
   */
  const handleChange = (setter) => (e) => {
    if (error) setError(null);
    setter(e.target.value);
  };

  /**
   * Stores the selected file in state.
   */
  const handleFileSelect = (file) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit (example)
      setError('File is too large (max 10MB).');
      return;
    }
    if (error) setError(null);
    setAttachment(file);
  };

  /**
   * Clears the selected file from state.
   */
  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  /**
   * Handles the form submission.
   * 1. Validates input
   * 2. Uploads file (if any)
   * 3. Creates new message thread
   * 4. Calls onClose on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // 1. Validate
    if (!category || !subject.trim() || !body.trim()) {
      setError('Please select a category and fill out the subject and message.');
      return;
    }

    try {
      let attachmentsArray = [];
      
      // 2. Upload file if it exists
      if (attachment) {
        // "Message Attachment" is a good category for the Documents page
        const newDoc = await uploadDocument(attachment, "Message Attachment");
        attachmentsArray.push({
          documentId: newDoc.id,
          fileName: newDoc.fileName,
        });
      }

      // 3. Create the thread
      await createNewThread(subject, category, body, attachmentsArray);
      
      // 4. Success: reset and close
      onClose();
      // No need to reset local state, as the component will be unmounted
    
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Sorry, we couldn't send your message. Please try again.");
    }
  };

  return (
    <div className={`card ${styles.composeCard}`}>
      <form onSubmit={handleSubmit}>
        <h2>New Message</h2>
        <p className={styles.helpText}>
          Your message will be sent to our care team. For emergencies, please call 911.
        </p>

        {/* --- Category Dropdown --- */}
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={handleChange(setCategory)}
          >
            <option value="Clinical">Clinical Question</option>
            <option value="Billing">Billing Question</option>
            <option value="Scheduling">Scheduling Request</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* --- Subject Input --- */}
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={subject}
            onChange={handleChange(setSubject)}
            placeholder="e.g., Question about my treatment"
          />
        </div>

        {/* --- Body Textarea --- */}
        <div className="form-group">
          <label htmlFor="body">Message</label>
          <textarea
            id="body"
            name="body"
            value={body}
            onChange={handleChange(setBody)}
            rows="5"
            placeholder="Hi, I had a question about..."
          ></textarea>
        </div>

        {/* --- Attachment Display --- */}
        {attachment && (
          <div className={styles.attachmentInfo}>
            <span>{attachment.name}</span>
            <button
              type="button"
              className={styles.removeAttachmentButton}
              onClick={handleRemoveAttachment}
              title="Remove attachment"
            >
              &times;
            </button>
          </div>
        )}

        {/* --- Error Display --- */}
        {error && (
          <p className={styles.errorText}>{error}</p>
        )}

        {/* --- Form Actions --- */}
        <div className={styles.composeActions}>
          <div className={styles.uploadButtonWrapper}>
            <FileUploadButton 
              onFileSelect={handleFileSelect} 
              disabled={loading || !!attachment}
            />
          </div>
          <button
            type="button"
            className="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewMessageForm;