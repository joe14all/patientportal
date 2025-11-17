import React from 'react';
import { Link } from 'react-router-dom';
import { usePatientData } from '../../contexts';
import { IconHamburger, IconClose, IconUser } from './Icons'; // IconUser is no longer used here, but we can leave the import
import styles from './Header.module.css';

// Helper function to get initials from a name
const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] || '').toUpperCase();
};

const Header = ({ onToggleMenu, isMobileMenuOpen }) => {
  const { patient } = usePatientData();

  const initials = getInitials(patient?.preferredName);
  const profileImage = patient?.systemInfo?.profileImageUrl;

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">
          <h3>Patient Portal</h3>
        </Link>
      </div>

      {/* --- Mobile Menu Toggle --- */}
      <button className={styles.hamburgerBtn} onClick={onToggleMenu}>
        {isMobileMenuOpen ? <IconClose /> : <IconHamburger />}
      </button>

      {/* --- Desktop User Menu --- */}
      <div className={styles.desktopMenuWrapper}>
        <Link to="/profile" className={styles.avatarButton}>
          {/* --- THIS IS THE UPDATED LOGIC --- */}
          {profileImage ? (
            <img 
              src={profileImage} 
              alt="Profile" 
              className={styles.avatarImage} 
            />
          ) : (
            // Default to initials, even if it's an empty string
            initials
          )}
        </Link>

        {/* This informational menu appears on hover */}
        <div className={styles.userMenuDropdown}>
          <strong>{patient?.preferredName || 'Patient'}</strong>
          <span className={styles.dropdownEmail}>{patient?.contact.emails?.[0]?.address}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;