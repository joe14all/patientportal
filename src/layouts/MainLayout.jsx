import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAccountData, useTheme } from '../contexts';
import './Layouts.css'; // We'll add this file for layout-specific styles

const MainLayout = () => {
  const { logout } = useAccountData();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="layout-container">
      <header className="main-header">
        <div className="logo-area">
          <h3>Patient Portal</h3>
        </div>
        <nav className="main-nav">
          <Link to="/">Dashboard</Link>
          <Link to="/appointments">Appointments</Link>
          {/* Add more links here: /billing, /messages, etc. */}
        </nav>
        <div className="user-menu">
          <button onClick={toggleTheme} className="secondary" style={{ marginRight: '1rem' }}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
          <button onClick={logout}>
            Log Out
          </button>
        </div>
      </header>
      <main className="content-area">
        {/* All protected pages will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;