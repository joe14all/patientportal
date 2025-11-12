import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileMenu from './components/MobileMenu';
import styles from './MainLayout.module.css'; // Import the new CSS Module

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={styles.mainLayout}>
      <Header 
        onToggleMenu={toggleMobileMenu} 
        isMobileMenuOpen={isMobileMenuOpen} 
      />
      
      <div className={styles.container}>
        <Sidebar /> {/* This is the desktop-only sidebar */}
        
        <main className={styles.contentArea}>
          <Outlet /> {/* All protected pages render here */}
        </main>
      </div>

      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onCloseMenu={closeMobileMenu} 
      />
    </div>
  );
};

export default MainLayout;