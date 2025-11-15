import React from 'react';
import { DENTAL_QUESTIONS } from '../../constants/medicalHistoryOptions';
import styles from './DentalQuestionsForm.module.css';

/**
 * Renders the "Specific Dental Questions" section of the form.
 * This is a controlled component that gets its data and handler from the parent.
 */
const DentalQuestionsForm = ({ data, onChange }) => {
  // Generic handler to update the parent's state
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const newValue = type === 'checkbox' ? checked : value;

    // Call the parent's onChange handler
    onChange({
      ...data,
      [name]: newValue,
    });
  };

  return (
    <section className="card">
      <h2>Dental Health Questions</h2>
      <p className={styles.helpText}>
        This information helps us ensure your safety during dental treatment.
      </p>
      
      <div className={styles.formContainer}>
        {DENTAL_QUESTIONS.map(question => {
          // Check if this question depends on another
          if (question.condition && !data[question.condition]) {
            return null; // Don't render if condition is not met
          }

          if (question.type === 'boolean') {
            return (
              <div className={styles.checkboxGroup} key={question.id}>
                <input
                  type="checkbox"
                  id={question.id}
                  name={question.id}
                  checked={!!data[question.id]} // Use !! to ensure boolean value
                  onChange={handleChange}
                />
                <label htmlFor={question.id}>{question.label}</label>
              </div>
            );
          }
          
          if (question.type === 'date') {
            return (
              <div className={`form-group ${styles.dateInput}`} key={question.id}>
                <label htmlFor={question.id}>{question.label}</label>
                <input
                  type="date"
                  id={question.id}
                  name={question.id}
                  value={data[question.id] || ''} // Handle null/undefined
                  onChange={handleChange}
                />
              </div>
            );
          }

          return null;
        })}
      </div>
    </section>
  );
};

export default DentalQuestionsForm;