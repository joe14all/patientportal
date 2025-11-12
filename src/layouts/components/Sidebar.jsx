import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  IconDashboard, 
  IconAppointments,
  IconMessages,
  IconBilling,
  IconDocuments,
  IconProfile,
  IconMedicalHistory
} from './Icons';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <nav className={styles.sidebar}>
      <ul className={styles.navList}>
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
        
        {/* --- NEW LINKS --- */}
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
    </nav>
  );
};

export default Sidebar;