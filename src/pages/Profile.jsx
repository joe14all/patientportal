import React, { useState, useEffect } from 'react';
import { usePatientData, useAccountData } from '../contexts';
import { IconProfile } from '../layouts/components/Icons';
import styles from './Profile.module.css';

const Profile = () => {
  // Get data and actions from two different contexts
  const { 
    patient, 
    updatePatientDetails, 
    loading: patientLoading 
  } = usePatientData();
  
  const { 
    user, 
    loginHistory, 
    updateUserPreferences, 
    updateRecoveryPhone,
    loading: accountLoading 
  } = useAccountData();

  const [formData, setFormData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);

  // When data loads from contexts, combine it into one form state
  useEffect(() => {
    if (patient && user) {
      setFormData({
        // Patient data
        preferredName: patient.preferredName,
        email: patient.contact.emails.find(e => e.isPrimary)?.address || '',
        phone: patient.contact.phones.find(p => p.isPrimary)?.number || '',
        addressLine1: patient.contact.addresses.find(a => a.isPrimary)?.line[0] || '',
        city: patient.contact.addresses.find(a => a.isPrimary)?.city || '',
        state: patient.contact.addresses.find(a => a.isPrimary)?.state || '',
        postalCode: patient.contact.addresses.find(a => a.isPrimary)?.postalCode || '',
        
        // Account data
        recoveryPhone: user.contact.recoveryPhone,
        language: user.preferences.language,
        notifications: user.preferences.notifications,
      });
      setIsDirty(false);
    }
  }, [patient, user]);

  // Generic change handler for top-level fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested notification checkboxes
    if (name.startsWith('notify_')) {
      const key = name.split('_')[1]; // e.g., "appointmentReminders"
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [key]: checked,
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    setIsDirty(true);
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      // 1. Update Patient Details
      await updatePatientDetails({
        preferredName: formData.preferredName,
        contact: {
          ...patient.contact, // Preserve existing data
          emails: [{ address: formData.email, isPrimary: true, isVerified: false }],
          phones: [{ number: formData.phone, type: "Mobile", isPrimary: true, allowSms: true }],
          addresses: [{
            use: "Home",
            isPrimary: true,
            line: [formData.addressLine1],
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: "US"
          }]
        }
      });

      // 2. Update Account Preferences
      await updateUserPreferences({
        language: formData.language,
        notifications: formData.notifications
      });

      // 3. Update Account Recovery Phone
      await updateRecoveryPhone(formData.recoveryPhone);

      setIsDirty(false); // Reset dirty state on success
    } catch (err) {
      console.error("Failed to save profile", err);
      // Error is handled in the respective contexts
    }
  };

  const loading = patientLoading || accountLoading;
  
  if (loading && !formData) {
    return <p>Loading profile...</p>;
  }
  
  if (!formData) {
    return <p>Could not load profile data.</p>;
  }

  return (
    <div className={styles.pageWrapper}>
      <h1>Profile & Settings</h1>
      
      <div className={styles.profileLayout}>
        {/* --- Column 1: Profile & Contact --- */}
        <div className={styles.column}>
          <div className={`card ${styles.avatarCard}`}>
            <div className={styles.avatar}>
              <IconProfile />
            </div>
            <h2>{patient.legalName.fullText}</h2>
            <p>DOB: {patient.dateOfBirth}</p>
          </div>

          <form className="card">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label htmlFor="preferredName">Preferred Name</label>
              <input 
                type="text" 
                id="preferredName"
                name="preferredName"
                value={formData.preferredName}
                onChange={handleChange}
              />
            </div>
            
            <h2>Contact Information</h2>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Mobile Phone</label>
              <input 
                type="tel" 
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="addressLine1">Address</label>
              <input 
                type="text" 
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
              />
            </div>
            {/* Add City/State/Zip... */}
          </form>
        </div>
        
        {/* --- Column 2: Account & Security --- */}
        <div className={styles.column}>
          <form className="card">
            <h2>Account Security</h2>
            <div className="form-group">
              <label htmlFor="email">Login Email</label>
              <input 
                type="email" 
                id="loginEmail"
                name="loginEmail"
                value={user.email}
                disabled 
              />
            </div>
            <div className="form-group">
              <label htmlFor="recoveryPhone">Recovery Phone</label>
              <input 
                type="tel" 
                id="recoveryPhone"
                name="recoveryPhone"
                value={formData.recoveryPhone}
                onChange={handleChange}
              />
            </div>
          </form>

          <form className="card">
            <h2>Preferences</h2>
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
            
            <h3>Notifications</h3>
            <div className="form-group">
              <input 
                type="checkbox" 
                id="notify_appointmentReminders"
                name="notify_appointmentReminders"
                checked={formData.notifications.appointmentReminders}
                onChange={handleChange}
              />
              <label htmlFor="notify_appointmentReminders">Appointment Reminders</label>
            </div>
            <div className="form-group">
              <input 
                type="checkbox" 
                id="notify_newMessageAlerts"
                name="notify_newMessageAlerts"
                checked={formData.notifications.newMessageAlerts}
                onChange={handleChange}
              />
              <label htmlFor="notify_newMessageAlerts">New Message Alerts</label>
            </div>
            <div className="form-group">
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

          <section className={`card ${styles.loginHistoryCard}`}>
            <h2>Login History</h2>
            <ul className={styles.loginHistoryList}>
              {loginHistory.slice(0, 3).map(item => (
                <li className={styles.loginHistoryItem} key={item.id}>
                  <strong>{new Date(item.timestamp).toLocaleString()}</strong>
                  <span className={item.status === 'Success' ? styles.success : styles.failed}>
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
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

export default Profile;