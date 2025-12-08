import React, { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileMenu from './components/MobileMenu';
import QuickActions from '../components/common/QuickActions';
import LiveChat from '../components/chat/LiveChat';
import { useEngagementData, useClinicalData } from '../contexts';
import styles from './MainLayout.module.css'; // Import the new CSS Module

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messageThreads } = useEngagementData();
  const { appointments } = useClinicalData();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Calculate badge counts for quick actions
  const unreadCount = useMemo(() => {
    return messageThreads.filter(t => !t.readStatus.isReadByPatient).length;
  }, [messageThreads]);

  const upcomingApptCount = useMemo(() => {
    const now = new Date();
    return appointments.filter(a => 
      new Date(a.startDateTime) > now && 
      a.status === 'Confirmed'
    ).length;
  }, [appointments]);

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

      {/* Mobile Quick Actions Bar */}
      <QuickActions 
        unreadCount={unreadCount}
        upcomingApptCount={upcomingApptCount}
      />

      {/* Live Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className={styles.chatButton}
        aria-label="Open chat support"
      >
        💬
      </button>

      {/* Live Chat Window */}
      <LiveChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default MainLayout;