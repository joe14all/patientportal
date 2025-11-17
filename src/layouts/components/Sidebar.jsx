import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAccountData } from '../../contexts'; 
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

  IconLogout 
} from './Icons';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const { logout } = useAccountData(); 

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
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

    
        <div className={styles.sidebarFooter}>
          <button 
            className={`${styles.menuButton} ${styles.logoutButton}`}
            onClick={() => setIsLogoutModalOpen(true)} 
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