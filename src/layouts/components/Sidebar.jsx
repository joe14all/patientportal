import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconDashboard, IconAppointments } from './Icons';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <nav className={styles.sidebar}>
      <ul className={styles.navList}>
        <li>
          <NavLink to="/" className={({ isActive }) => 
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
        {/* Add more links here (Billing, Messages) */}
      </ul>
    </nav>
  );
};

export default Sidebar;