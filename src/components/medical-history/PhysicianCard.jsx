import React from 'react';
import styles from './PhysicianCard.module.css';

/**
 * A simple form card for editing the patient's Primary Care Physician.
 */
const PhysicianCard = ({ data, onChange }) => {
  // This is a controlled component.
  // We'll create a local change handler that reports
  // any edits up to the parent `MedicalHistory` component.
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Call the parent's generic onChange handler,
    // passing it the new, updated physician object.
    onChange({
      ...data,
      [name]: value,
    });
  };

  return (
    <section className="card">
      <h2>Primary Care Physician</h2>
      <div className={styles.formGrid}>
        <div className="form-group">
          <label htmlFor="pcpName">Physician Name</label>
          <input
            type="text"
            id="pcpName"
            name="name"
            value={data.name || ''}
            onChange={handleChange}
            placeholder="Dr. Emily Smith"
          />
        </div>
        <div className="form-group">
          <label htmlFor="pcpPhone">Phone Number</label>
          <input
            type="tel"
            id="pcpPhone"
            name="phone"
            value={data.phone || ''}
            onChange={handleChange}
            placeholder="+15558889999"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="pcpAddress">Address (Optional)</label>
        <input
          type="text"
          id="pcpAddress"
          name="address"
          value={data.address || ''}
          onChange={handleChange}
          placeholder="123 Medical Plaza, Anytown"
        />
      </div>
    </section>
  );
};

export default PhysicianCard;