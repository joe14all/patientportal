import React from 'react';
// --- NEW: Import the local icon files ---
import googleCalendarIcon from '../../assets/Icons/google-calendar.png';
import appleCalendarIcon from '../../assets/Icons/calendar.png';

import styles from './ProfileSyncing.module.css';

const ProfileSyncing = () => {
  // Placeholder handler for the buttons
  const handleSyncClick = (calendarType) => {
    alert(`"${calendarType} Sync" is not implemented yet.`);
  };

  return (
    <section className={`card ${styles.syncCard}`}>
      <h2>Calendar Sync</h2>
      <p className={styles.helpText}>
        Connect your personal calendar to automatically sync your appointments.
      </p>

      <div className={styles.buttonList}>
        <button 
          className={styles.syncButton} 
          onClick={() => handleSyncClick('Google Calendar')}
        >
          {/* --- UPDATED: Use the imported variable --- */}
          <img 
            src={googleCalendarIcon} 
            alt="Google Calendar" 
            className={styles.icon} 
          />
          <span>Connect Google Calendar</span>
        </button>
        
        <button 
          className={styles.syncButton} 
          onClick={() => handleSyncClick('Apple Calendar')}
        >
          {/* --- UPDATED: Use the imported variable --- */}
          <img 
            src={appleCalendarIcon} 
            alt="Apple Calendar" 
            className={styles.icon} 
          />
          <span>Connect Apple Calendar</span>
        </button>
      </div>
    </section>
  );
};

export default ProfileSyncing;