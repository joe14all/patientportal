import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import styles from './HistoryItemModal.module.css';

// Get the default empty state for a new item
const getEmptyForm = (itemType) => {
  switch (itemType) {
    case 'allergies':
      return { agent: '', reaction: '', type: 'Drug' };
    case 'medications':
      return { name: '', dosage: '', reason: '' };
    case 'surgeries':
      return { type: '', year: '' };
    case 'conditions':
      return { name: '', status: 'Active' };
    default:
      return {};
  }
};

/**
 * A reusable modal for adding or editing a medical history item.
 */
const HistoryItemModal = ({ isOpen, onClose, onSave, itemToEdit, itemType, loading }) => {
  const [form, setForm] = useState(getEmptyForm(itemType));

  // When the modal opens, check if we are editing an existing
  // item or creating a new one.
  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        setForm(itemToEdit); // We are editing
      } else {
        setForm(getEmptyForm(itemType)); // We are adding new
      }
    }
  }, [isOpen, itemToEdit, itemType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(form);
  };

  const isEditing = !!itemToEdit;
  let title = '';
  let fields = null;

  // Dynamically render the correct form fields based on itemType
  switch (itemType) {
    case 'allergies':
      title = isEditing ? 'Edit Allergy' : 'Add Allergy';
      fields = (
        <>
          <div className="form-group">
            <label htmlFor="agent">Allergy (Substance)</label>
            <input type="text" id="agent" name="agent" value={form.agent || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="reaction">Reaction</label>
            <input type="text" id="reaction" name="reaction" value={form.reaction || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="type">Allergy Type</label>
            <select id="type" name="type" value={form.type || 'Drug'} onChange={handleChange} className={styles.select}>
              <option value="Drug">Drug</option>
              <option value="Food">Food</option>
              <option value="Environmental">Environmental</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </>
      );
      break;

    case 'medications':
      title = isEditing ? 'Edit Medication' : 'Add Medication';
      fields = (
        <>
          <div className="form-group">
            <label htmlFor="name">Medication Name</label>
            <input type="text" id="name" name="name" value={form.name || ''} onChange={handleChange} />
          </div>
          <div className={styles.grid}>
            <div className="form-group">
              <label htmlFor="dosage">Dosage</label>
              <input type="text" id="dosage" name="dosage" value={form.dosage || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="reason">Reason for taking</label>
              <input type="text" id="reason" name="reason" value={form.reason || ''} onChange={handleChange} />
            </div>
          </div>
        </>
      );
      break;
    
    // --- FIX: ADDED MISSING 'surgeries' CASE ---
    case 'surgeries':
      title = isEditing ? 'Edit Surgery / Hospitalization' : 'Add Surgery / Hospitalization';
      fields = (
        <>
          <div className="form-group">
            <label htmlFor="type">Surgery / Hospitalization Type</label>
            <input type="text" id="type" name="type" value={form.type || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="year">Year</label>
            <input type="text" id="year" name="year" value={form.year || ''} onChange={handleChange} maxLength="4" />
          </div>
        </>
      );
      break;

    // --- FIX: ADDED MISSING 'conditions' CASE ---
    case 'conditions':
      title = isEditing ? 'Edit Medical Condition' : 'Add Medical Condition';
      fields = (
        <>
          <div className="form-group">
            <label htmlFor="name">Condition Name</label>
            <input type="text" id="name" name="name" value={form.name || ''} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={form.status || 'Active'} onChange={handleChange} className={styles.select}>
              <option value="Active">Active</option>
              <option value="Past">Past</option>
              <option value="Family History">Family History</option>
            </select>
          </div>
        </>
      );
      break;

    default:
      title = 'Edit Item';
      fields = <p>This item type is not recognized: {itemType}</p>;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      primaryActionText={loading ? 'Saving...' : 'Save'}
      onPrimaryAction={handleSave}
      secondaryActionText="Cancel"
    >
      <div className={styles.formWrapper}>
        {fields}
      </div>
    </Modal>
  );
};

export default HistoryItemModal;