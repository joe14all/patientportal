import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAccountData, useTheme } from '../../contexts';
import { 
  IconDashboard, 
  IconAppointments,
  IconMessages,
  IconBilling,
  IconDocuments,
  IconProfile,
  IconMedicalHistory,
  IconTreatmentPlan // 1. Import the new icon
} from './Icons';
import styles from './MobileMenu.module.css';

const MobileMenu = ({ isOpen, onCloseMenu }) => {
  const { logout } = useAccountData();
  const { theme, toggleTheme } = useTheme();

  // We wrap the NavLink onClick to close the menu
  const handleNavClick = () => {
    onCloseMenu();
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`}>
      <nav>
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

          {/* 2. Add the new NavLink for Treatment Plans */}
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

      {/* Footer for theme toggle and logout */}
      <div className={styles.footer}>
        <button onClick={toggleTheme} className="secondary">
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
        <button onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default MobileMenu;