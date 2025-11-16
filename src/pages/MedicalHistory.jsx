/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { usePatientData } from '../contexts';
// import { DENTAL_QUESTIONS } from '../../constants/medicalHistoryOptions';
import styles from './MedicalHistory.module.css';

// --- Import the new subcomponents ---
import AllergySection from '../components/medical-history/AllergySection';
import MedicationSection from '../components/medical-history/MedicationSection';
import ConditionSection from '../components/medical-history/ConditionSection';
import SurgerySection from '../components/medical-history/SurgerySection';
import SocialHistorySection from '../components/medical-history/SocialHistorySection';
import PhysicianCard from '../components/medical-history/PhysicianCard';
import DentalQuestionsForm from '../components/medical-history/DentalQuestionsForm';

// --- Import the common save bar ---
import StickySaveBar from '../components/common/StickySaveBar';

const MedicalHistory = () => {
  const { 
    medicalHistory, 
    updateMedicalHistory,
    addMedicalHistoryItem,
    updateMedicalHistoryItem,
    removeMedicalHistoryItem,
    loading, 
    error 
  } = usePatientData();

  // The mock data is an array, we'll edit the first (and only) one
  const currentHistory = medicalHistory?.[0];

  const [formData, setFormData] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null); // --- NEW
  const [isDirty, setIsDirty] = useState(false);

  // When data loads from context, populate the form state
  useEffect(() => {
    // Only set state if it hasn't been set before
    if (currentHistory && !originalFormData) {
      setFormData(currentHistory);
      setOriginalFormData(currentHistory); // --- NEW
      setIsDirty(false);
    }
  }, [currentHistory, originalFormData]); // Add originalFormData as a dependency

  /**
   * --- NEW HANDLER ---
   * A generic handler for all sub-components to update their
   * part of the form state.
   * e.g., handleDataChange('allergies', newAllergyObject)
   */
  const handleDataChange = (sectionKey, sectionData) => {
    setFormData(prevData => ({
      ...prevData,
      [sectionKey]: sectionData
    }));
    setIsDirty(true);
  };

  // Handle simple text area change (for General Notes)
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
      // Pass the *entire* formData object to be saved
      await updateMedicalHistory(formData.id, formData);
      setOriginalFormData(formData); // --- NEW: Update original state on save
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save medical history", err);
    }
  };

  // --- NEW: Handle Revert ---
  const handleRevert = () => {
    setFormData(originalFormData);
    setIsDirty(false);
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

  // --- Pass down all necessary props to children ---
  const sectionProps = {
    historyId: currentHistory.id,
    loading: loading,
    onChange: handleDataChange, // Pass the new generic handler
    addMedicalHistoryItem,
    updateMedicalHistoryItem,
    removeMedicalHistoryItem,
  };

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
          
          {/* --- NEW: Dental Questions --- */}
          <DentalQuestionsForm
            data={formData.specificDentalQuestions}
            onChange={(newData) => handleDataChange('specificDentalQuestions', newData)}
          />

          {/* --- NEW: Allergies Component --- */}
          <AllergySection
            data={formData.allergies}
            {...sectionProps}
          />

          {/* --- NEW: Medications Component --- */}
          <MedicationSection
            data={formData.medications}
            {...sectionProps}
          />
          
          {/* --- NEW: Surgeries Component --- */}
          <SurgerySection
            data={formData.surgeries}
            {...sectionProps}
          />
        </div>

        {/* --- Column 2 --- */}
        <div className={styles.column}>
          {/* --- NEW: Conditions Component --- */}
          <ConditionSection
            data={formData.conditions}
            {...sectionProps}
          />

          {/* --- NEW: Social History Component --- */}
          <SocialHistorySection
            data={formData.socialHistory}
            onChange={(newData) => handleDataChange('socialHistory', newData)}
          />
          
          {/* --- NEW: Primary Care Physician --- */}
          <PhysicianCard
            data={formData.primaryCarePhysician}
            onChange={(newData) => handleDataChange('primaryCarePhysician', newData)}
          />

          {/* --- General Notes (Stays in this file) --- */}
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

      {/* --- UPDATED: Pass the onRevert prop --- */}
      <StickySaveBar
        isDirty={isDirty}
        loading={loading}
        onSave={handleSave}
        onRevert={handleRevert}
      />
    </div>
  );
};

export default MedicalHistory;