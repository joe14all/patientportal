import React, { useState } from 'react';
import { useBillingData } from '../../contexts';
import { 
  SUBSCRIBER_RELATIONSHIP, 
  PLAN_TYPES, 
  COVERAGE_PRIORITY 
} from '../../constants';
import styles from './AddInsuranceForm.module.css';

// Initial state for the insurance form
const getInitialState = () => ({
  coveragePriority: COVERAGE_PRIORITY[0],
  carrier: { name: '' },
  plan: { planName: '', planType: PLAN_TYPES[0], policyNumber: '', groupNumber: '' },
  subscriber: { relationshipToPatient: 'Self', firstName: '', lastName: '', dateOfBirth: '' }
});

/**
 * A form for adding a new insurance policy.
 * This component is intended to be used inside a Modal.
 */
const AddInsuranceForm = ({ onSuccess, onCancel }) => {
  const { addInsurancePolicy, loading } = useBillingData();
  const [formData, setFormData] = useState(getInitialState());
  const [error, setError] = useState(null);

  // --- Handler for nested state changes ---
  const handleNestedChange = (group, name, value) => {
    if (error) setError(null);
    setFormData(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [name]: value
      }
    }));
  };

  // --- Handler for top-level changes (like coveragePriority) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (error) setError(null);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError(null);

    // 1. Validate the fields that are *always* required
    if (!formData.carrier.name || !formData.plan.policyNumber) {
      setError("Please fill in all required fields (Carrier Name and Policy #).");
      return;
    }

    // 2. Conditionally validate the subscriber fields
    if (formData.subscriber.relationshipToPatient !== 'Self') {
      if (!formData.subscriber.firstName || !formData.subscriber.lastName) {
        setError("Please fill in all required fields (Carrier, Policy #, and Subscriber Name).");
        return;
      }
    }

    try {
      // Prepare the data (it's already in the correct nested structure)
      const newPolicyData = {
        ...formData,
        status: "Active", // Set new policies to Active
        patientId: "patient-uuid-001", // This would come from context
        documentIds: { front: null, back: null }, // User would upload these separately
      };

      await addInsurancePolicy(newPolicyData);
      onSuccess(); // This will close the modal

    } catch (err) {
      console.error("Failed to add insurance:", err);
      setError("Could not save this policy. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formWrapper}>

      {/* --- Policy Info --- */}
      <fieldset className={styles.fieldset}>
        <legend>Policy Details</legend>
        <div className="form-group">
          <label htmlFor="carrierName">Insurance Carrier Name</label>
          <input
            type="text"
            id="carrierName"
            name="name"
            value={formData.carrier.name}
            onChange={(e) => handleNestedChange('carrier', e.target.name, e.target.value)}
            disabled={loading}
            placeholder="e.g., Delta Dental"
            required
          />
        </div>
        
        {/* --- THIS GRID IS MODIFIED --- */}
        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="coveragePriority">Coverage Priority</label>
            <select
              id="coveragePriority"
              name="coveragePriority"
              value={formData.coveragePriority}
              onChange={handleChange} // <-- FIX: Using handleChange
              className={styles.select}
              disabled={loading}
            >
              {COVERAGE_PRIORITY.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="planType">Plan Type</label>
            <select
              id="planType"
              name="planType"
              value={formData.plan.planType}
              onChange={(e) => handleNestedChange('plan', e.target.name, e.target.value)}
              className={styles.select}
              disabled={loading}
            >
              {PLAN_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* --- THIS FIELD IS MOVED (Full Width) --- */}
        <div className="form-group">
          <label htmlFor="policyNumber">Policy / Member ID</label>
          <input
            type="text"
            id="policyNumber"
            name="policyNumber"
            value={formData.plan.policyNumber}
            onChange={(e) => handleNestedChange('plan', e.target.name, e.target.value)}
            disabled={loading}
            required
          />
        </div>

        {/* --- THIS GRID IS MODIFIED --- */}
        <div className={styles.grid}>
          <div className="form-group">
            <label htmlFor="planName">Plan Name (Optional)</label>
            <input
              type="text"
              id="planName"
              name="planName"
              value={formData.plan.planName}
              onChange={(e) => handleNestedChange('plan', e.target.name, e.target.value)}
              disabled={loading}
              placeholder="e.g., PPO 2000"
            />
          </div>
          <div className="form-group">
            <label htmlFor="groupNumber">Group Number (Optional)</label>
            <input
              type="text"
              id="groupNumber"
              name="groupNumber"
              value={formData.plan.groupNumber}
              onChange={(e) => handleNestedChange('plan', e.target.name, e.target.value)}
              disabled={loading}
            />
          </div>
        </div>
      </fieldset>

      {/* --- Subscriber Info --- */}
      <fieldset className={styles.fieldset}>
        <legend>Subscriber Information</legend>
        <div className="form-group">
          <label htmlFor="relationshipToPatient">This policy belongs to:</label>
          <select
            id="relationshipToPatient"
            name="relationshipToPatient"
            value={formData.subscriber.relationshipToPatient}
            onChange={(e) => handleNestedChange('subscriber', e.target.name, e.target.value)}
            className={styles.select}
            disabled={loading}
          >
            {SUBSCRIBER_RELATIONSHIP.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        {/* Show subscriber fields only if it's not the patient themself */}
        {formData.subscriber.relationshipToPatient !== 'Self' && (
          <>
            <div className={styles.grid}>
              <div className="form-group">
                <label htmlFor="firstName">Subscriber First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.subscriber.firstName}
                  onChange={(e) => handleNestedChange('subscriber', e.target.name, e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Subscriber Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.subscriber.lastName}
                  onChange={(e) => handleNestedChange('subscriber', e.target.name, e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Subscriber Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.subscriber.dateOfBirth}
                onChange={(e) => handleNestedChange('subscriber', e.target.name, e.target.value)}
                disabled={loading}
              />
            </div>
          </>
        )}
      </fieldset>

      {/* --- Error Display --- */}
      {error && (
        <p className={styles.errorText}>{error}</p>
      )}

      {/* --- Actions --- */}
      <div className={styles.modalActions}>
        <button 
          type="button" 
          className="secondary" 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Insurance'}
        </button>
      </div>
    </form>
  );
};

export default AddInsuranceForm;