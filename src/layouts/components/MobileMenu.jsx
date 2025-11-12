import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAccountData, useTheme } from '../../contexts';
import { IconDashboard, IconAppointments } from './Icons';
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
          {/* Add more links here */}
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