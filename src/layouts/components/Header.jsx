import React from 'react';
import { useAccountData, useTheme } from '../../contexts';
import { IconHamburger, IconClose } from './Icons';
import styles from './Header.module.css';

const Header = ({ onToggleMenu, isMobileMenuOpen }) => {
  const { logout } = useAccountData();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h3>Patient Portal</h3>
      </div>

      {/* --- Mobile Menu Toggle --- */}
      <button className={styles.hamburgerBtn} onClick={onToggleMenu}>
        {isMobileMenuOpen ? <IconClose /> : <IconHamburger />}
      </button>

      {/* --- Desktop User Menu --- */}
      <div className={styles.desktopMenu}>
        <button onClick={toggleTheme} className="secondary" style={{ marginRight: '1rem' }}>
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        <button onClick={logout}>
          Log Out
        </button>
      </div>
    </header>
  );
};

export default Header;