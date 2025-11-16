import React from 'react';
import { Link } from 'react-router-dom';
import { usePatientData } from '../../contexts'; // 1. Remove Account and Theme hooks
import { IconHamburger, IconClose, IconUser } from './Icons';
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
  const { patient } = usePatientData(); // 2. Keep patient data for initials

  // Get initials from preferredName, fallback to an icon
  const initials = getInitials(patient?.preferredName);

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

      {/* --- 3. SIMPLIFIED Desktop User Menu --- */}
      <div className={styles.desktopMenuWrapper}>
        {/* The avatar is now a direct link to the profile */}
        <Link to="/profile" className={styles.avatarButton}>
          {initials ? initials : <IconUser />}
        </Link>

        {/* This informational menu appears on hover */}
        <div className={styles.userMenuDropdown}>
          <strong>{patient?.preferredName || 'Patient'}</strong>
          <span className={styles.dropdownEmail}>{patient?.contact.emails[0].address}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;