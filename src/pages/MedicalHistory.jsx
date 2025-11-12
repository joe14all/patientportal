/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { usePatientData } from '../contexts';
import styles from './MedicalHistory.module.css';

// Helper component for list items
const HistoryItem = ({ item, onRemove }) => (
  <li className={styles.historyItem}>
    <div>
      <strong>{item.agent || item.name || item.type || 'Unknown'}</strong>
      {item.reaction && <span> - {item.reaction}</span>}
      {item.dosage && <span> - {item.dosage}</span>}
      {item.reason && <span> ({item.reason})</span>}
      {item.year && <span> - {item.year}</span>}
    </div>
    {/* 'onRemove' would be implemented in a full "edit" mode */}
    {/* <button onClick={onRemove} className="icon-button danger">&times;</button> */}
  </li>
);

const MedicalHistory = () => {
  const { 
    medicalHistory, 
    updateMedicalHistory, 
    loading, 
    error 
  } = usePatientData();

  // The mock data is an array, we'll edit the first (and only) one
  const currentHistory = medicalHistory?.[0];

  const [formData, setFormData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // When data loads from context, populate the form state
  useEffect(() => {
    if (currentHistory) {
      setFormData(currentHistory);
    }
  }, [currentHistory]);

  // Handle changes to nested form fields
  // e.g., handleFieldChange('allergies', 'noKnownDrugAllergies', true)
  const handleFieldChange = (section, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value
      }
    }));
    setIsDirty(true);
  };

  // Handle simple text area change
  const handleNotesChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      generalNotes: e.target.value
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!formData) return;
    
    try {
      await updateMedicalHistory(formData.id, formData);
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save medical history", err);
    }
  };

  if (loading && !formData) {
    return <p>Loading medical history...</p>;
  }

  if (error) {
    return <p className="error-text">Error loading medical history: {error}</p>;
  }
  
  if (!formData) {
    return <p>No medical history found.</p>;
  }

  return (
    <div className={styles.pageWrapper}>
      <h1>Medical History</h1>
      <p className={styles.pageDescription}>
        Please review and update your medical information. This is critical for your safety.
      </p>

      {/* --- Main Layout Grid --- */}
      <div className={styles.historyLayout}>

        {/* --- Column 1 --- */}
        <div className={styles.column}>
          {/* Allergies */}
          <section className="card">
            <h2>Allergies</h2>
            <div className="form-group">
              <input 
                type="checkbox" 
                id="noDrugAllergies"
                checked={formData.allergies.noKnownDrugAllergies}
                onChange={(e) => handleFieldChange('allergies', 'noKnownDrugAllergies', e.target.checked)}
              />
              <label htmlFor="noDrugAllergies">No Known Drug Allergies</label>
            </div>
            {!formData.allergies.noKnownDrugAllergies && (
              <ul className={styles.historyList}>
                {formData.allergies.items.filter(i => i.type === 'Drug').map(item => (
                  <HistoryItem key={item.id} item={item} />
                ))}
              </ul>
            )}
            {/* Add inputs for other allergy types... */}
          </section>

          {/* Medications */}
          <section className="card">
            <h2>Medications</h2>
            <div className="form-group">
              <input 
                type="checkbox" 
                id="noMeds"
                checked={formData.medications.noCurrentMedications}
                onChange={(e) => handleFieldChange('medications', 'noCurrentMedications', e.target.checked)}
              />
              <label htmlFor="noMeds">No Current Medications</label>
            </div>
            {!formData.medications.noCurrentMedications && (
              <ul className={styles.historyList}>
                {formData.medications.items.map(item => (
                  <HistoryItem key={item.id} item={item} />
                ))}
              </ul>
            )}
          </section>

          {/* Surgeries */}
          <section className="card">
            <h2>Surgeries & Hospitalizations</h2>
            <ul className={styles.historyList}>
              {formData.surgeries.items.map(item => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </ul>
          </section>
        </div>

        {/* --- Column 2 --- */}
        <div className={styles.column}>
          {/* Conditions */}
          <section className="card">
            <h2>Medical Conditions</h2>
            <ul className={styles.historyList}>
              {formData.conditions.items.map(item => (
                <HistoryItem key={item.id} item={item} />
              ))}
            </ul>
          </section>

          {/* Social History */}
          <section className="card">
            <h2>Social History</h2>
            <ul className={styles.historyList}>
              {formData.socialHistory.map(item => (
                <HistoryItem key={item.type} item={item} />
              ))}
            </ul>
          </section>

          {/* General Notes */}
          <section className="card">
            <h2>General Notes</h2>
            <p className={styles.notesHelp}>
              Anything else we should know? (e.g., dental anxiety)
            </p>
            <textarea
              value={formData.generalNotes}
              onChange={handleNotesChange}
              rows="4"
            ></textarea>
          </section>
        </div>
      </div>

      {/* --- Sticky Save Bar --- */}
      {isDirty && (
        <div className={styles.saveBar}>
          <p>You have unsaved changes.</p>
          <button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MedicalHistory;