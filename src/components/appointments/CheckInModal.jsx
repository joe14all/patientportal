import React, { useState, useMemo } from 'react';
import Modal from '../common/Modal';
import { useClinicalData } from '../../contexts';
import { QUESTION_TYPES } from '../../constants';
import styles from './CheckInModal.module.css';

const CheckInModal = ({ isOpen, onClose, appointment }) => {
  const { checkInQuestions, checkInAppointment, loading } = useClinicalData();
  
  // State to store answers: { "q-id": "Yes", ... }
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers ---

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Call the context function we created earlier
      await checkInAppointment(appointment.id, answers);
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Check-in failed", err);
      // Modal handles error display via alert or custom UI
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Validation: Check if all required questions are answered ---
  const isFormValid = useMemo(() => {
    return checkInQuestions.every(q => {
      if (!q.required) return true;
      // Check if conditional logic applies (if parent question answer != condition, skip validation)
      if (q.condition) {
        const parentAnswer = answers[q.condition.questionId];
        if (parentAnswer !== q.condition.value) return true; // Condition not met, so not required
      }
      return !!answers[q.id]; // Must have an answer
    });
  }, [checkInQuestions, answers]);


  // --- Render Helper for Question Types ---
  const renderQuestionInput = (q) => {
    switch (q.type) {
      case QUESTION_TYPES.YES_NO:
        return (
          <div className={styles.radioGroup}>
            <label className={`${styles.radioLabel} ${answers[q.id] === 'Yes' ? styles.selected : ''}`}>
              <input 
                type="radio" 
                name={q.id} 
                value="Yes" 
                checked={answers[q.id] === 'Yes'}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              />
              Yes
            </label>
            <label className={`${styles.radioLabel} ${answers[q.id] === 'No' ? styles.selected : ''}`}>
              <input 
                type="radio" 
                name={q.id} 
                value="No" 
                checked={answers[q.id] === 'No'}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              />
              No
            </label>
          </div>
        );
        
      case QUESTION_TYPES.TEXT:
        return (
          <textarea
            className={styles.textInput}
            rows="2"
            placeholder="Please describe..."
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
          />
        );

      case QUESTION_TYPES.MULTI_CHOICE:
        return (
          <select 
            className={styles.selectInput}
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
          >
            <option value="" disabled>Select an option...</option>
            {q.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
        
      default:
        return null;
    }
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Self Check-In"
      primaryActionText={isSubmitting ? "Checking In..." : "Confirm & Check In"}
      onPrimaryAction={handleSubmit}
      secondaryActionText="Cancel"
      isLoading={loading || isSubmitting}
      primaryActionDisabled={!isFormValid}
    >
      <div className={styles.intro}>
        <p>You are checking in for your <strong>{appointment.appointmentType}</strong>.</p>
        <p>Please answer the following safety questions to proceed.</p>
      </div>

      <div className={styles.questionList}>
        {checkInQuestions.map(q => {
          // Handle Conditional Logic: Hide question if condition not met
          if (q.condition) {
            const parentAnswer = answers[q.condition.questionId];
            if (parentAnswer !== q.condition.value) return null;
          }

          return (
            <div key={q.id} className={styles.questionItem}>
              <p className={styles.questionText}>
                {q.text} {q.required && <span className={styles.required}>*</span>}
              </p>
              {renderQuestionInput(q)}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default CheckInModal;