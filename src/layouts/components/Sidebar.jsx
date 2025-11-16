import React, { useState } from 'react'; // 1. Import useState
import { NavLink } from 'react-router-dom';
import { useAccountData, useTheme } from '../../contexts'; 
import Modal from '../../components/common/Modal'; // 2. Import the Modal component
import { 
  IconDashboard, 
  IconAppointments,
  IconMessages,
  IconBilling,
  IconDocuments,
  IconProfile,
  IconMedicalHistory,
  IconTreatmentPlan,
  IconSun,        
  IconMoon,
  IconLogout 
} from './Icons';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { logout } = useAccountData(); 
  const { theme, toggleTheme } = useTheme();

  // 3. Add state to control the modal
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    // 4. Wrap the component in a React Fragment
    <>
      <nav className={styles.sidebar}>
        <ul className={styles.navList}>
          {/* --- All your NavLinks remain here --- */}
          <li>
            <NavLink to="/" end className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }>
              <IconDashboard />
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/appointments" className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }>
              <IconAppointments />
              Appointments
            </NavLink>
          </li>
          <li>
            <NavLink to="/messages" className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }>
              <IconMessages />
              Messages
            </NavLink>
          </li>
          <li>
            <NavLink to="/billing" className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }>
              <IconBilling />
              Billing
            </NavLink>
          </li>
          <li>
            <NavLink to="/plans" className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }>
              <IconTreatmentPlan />
              Treatment Plans
            </NavLink>
          </li>
          <li>
            <NavLink to="/documents" className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }>
              <IconDocuments />
              Documents
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }>
              <IconMedicalHistory />
              Medical History
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={({ isActive }) => 
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }>
              <IconProfile />
              Profile
            </NavLink>
          </li>
        </ul>

        {/* --- Footer section for buttons --- */}
        <div className={styles.sidebarFooter}>
          <button 
            className={styles.menuButton} 
            onClick={toggleTheme}
          >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
          <button 
            className={`${styles.menuButton} ${styles.logoutButton}`}
            onClick={() => setIsLogoutModalOpen(true)} // 5. Update onClick to open modal
          >
            <IconLogout />
            Log Out
          </button>
        </div>
      </nav>

      {/* 6. Add the Modal component */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Log Out"
        primaryActionText="Log Out"
        primaryActionVariant="danger"
        onPrimaryAction={logout} // Call the logout function on confirm
        secondaryActionText="Cancel"
      >
        <p>Are you sure you want to log out of the patient portal?</p>
      </Modal>
    </>
  );
};

export default Sidebar;