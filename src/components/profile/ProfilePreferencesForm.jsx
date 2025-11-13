import React from 'react';
import styles from './ProfilePreferencesForm.module.css';

const ProfilePreferencesForm = ({ formData, handleChange }) => {
  return (
    <form className={`card ${styles.formCard}`}>
      <h2>Preferences</h2>
      
      {/* --- Language Selection --- */}
      <div className="form-group">
        <label htmlFor="language">Language</label>
        <select
          id="language"
          name="language"
          value={formData.language}
          onChange={handleChange}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </div>

      {/* --- Notification Checkboxes --- */}
      <h3>Notifications</h3>
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="notify_appointmentReminders"
          name="notify_appointmentReminders"
          checked={formData.notifications.appointmentReminders}
          onChange={handleChange}
        />
        <label htmlFor="notify_appointmentReminders">Appointment Reminders</label>
      </div>
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="notify_newMessageAlerts"
          name="notify_newMessageAlerts"
          checked={formData.notifications.newMessageAlerts}
          onChange={handleChange}
        />
        <label htmlFor="notify_newMessageAlerts">New Message Alerts</label>
      </div>
      <div className={styles.checkboxGroup}>
        <input
          type="checkbox"
          id="notify_billingAlerts"
          name="notify_billingAlerts"
          checked={formData.notifications.billingAlerts}
          onChange={handleChange}
        />
        <label htmlFor="notify_billingAlerts">Billing Alerts</label>
      </div>
    </form>
  );
};

export default ProfilePreferencesForm;