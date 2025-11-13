import React from 'react';
import { useAccountData } from '../../contexts';
import styles from './ProfileSecurityForm.module.css';

const ProfileSecurityForm = ({ formData, handleChange }) => {
  // We get the user's login email from the AccountContext
  const { user } = useAccountData();

  return (
    <form className={`card ${styles.formCard}`}>
      <h2>Account Security</h2>
      
      {/* The login email is not editable */}
      <div className="form-group">
        <label htmlFor="loginEmail">Login Email</label>
        <input
          type="email"
          id="loginEmail"
          name="loginEmail"
          value={user?.email || ''} // Get from context
          disabled
        />
      </div>

      {/* The recovery phone is part of the form data */}
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
  );
};

export default ProfileSecurityForm;