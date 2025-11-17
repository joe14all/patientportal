import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { useAccountData, usePatientData } from '../../contexts';
import Modal from '../../components/common/Modal';
import { 
  IconDashboard, 
  IconAppointments,
  IconMessages,
  IconBilling,
  IconDocuments,
  IconProfile,
  IconMedicalHistory,
  IconTreatmentPlan,
  IconLogout,
  IconUser // --- ADD IconUser ---
} from './Icons';
import styles from './MobileMenu.module.css';

// --- NEW: Add the same helper function ---
const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name[0] || '').toUpperCase();
};

const MobileMenu = ({ isOpen, onCloseMenu }) => {
  const { logout } = useAccountData();
  const { patient } = usePatientData(); 
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // --- NEW: Get avatar data ---
  const initials = getInitials(patient?.preferredName);
  const profileImage = patient?.systemInfo?.profileImageUrl;

  const handleNavClick = () => {
    onCloseMenu();
  };

  return (
    <>
      <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`}>
        
        {/* --- THIS IS THE UPDATED HEADER --- */}
        <div className={styles.menuHeader}>
          <div className={styles.avatar}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" className={styles.avatarImage} />
            ) : (
              initials ? initials : <IconUser />
            )}
          </div>
          <div className={styles.userInfo}>
            <strong>{patient?.preferredName || 'Patient'}</strong>
            <span>{patient?.contact?.emails?.[0]?.address || 'No email on file'}</span>
          </div>
        </div>

        <nav>
          {/* ... (rest of the NavLink list) ... */}
          <ul className={styles.navList}>
            <li>
              <NavLink 
                to="/" 
                end
                onClick={handleNavClick}
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }>
                <IconDashboard />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/appointments" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }>
                <IconAppointments />
                Appointments
              </NavLink>
            </li>
            
            {/* --- LINKS --- */}
            <li>
              <NavLink 
                to="/messages" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }>
                <IconMessages />
                Messages
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/billing" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }>
                <IconBilling />
                Billing
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/plans" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }>
                <IconTreatmentPlan />
                Treatment Plans
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/documents" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }>
                <IconDocuments />
                Documents
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/history" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }>
                <IconMedicalHistory />
                Medical History
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/profile" 
                onClick={handleNavClick}
                className={({ isActive }) => 
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }>
                <IconProfile />
                Profile
              </NavLink>
            </li>
          </ul>
        </nav>


        <div className={styles.footer}>
          {/* ... (logout button) ... */}
          <button 
            onClick={() => setIsLogoutModalOpen(true)} 
            className={styles.logoutButton}
          >
            <IconLogout />
            Log Out
          </button>
        </div>
      </div>

      {/* ... (logout modal) ... */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Log Out"
        primaryActionText="Log Out"
        primaryActionVariant="danger"
        onPrimaryAction={logout}
        secondaryActionText="Cancel"
      >
        <p>Are you sure you want to log out of the patient portal?</p>
      </Modal>
    </>
  );
};

export default MobileMenu;