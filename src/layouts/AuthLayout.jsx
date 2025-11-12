import React from 'react';
import { Outlet } from 'react-router-dom';
import './Layouts.css'; // We'll share the layout CSS

const AuthLayout = () => {
  return (
    <div className="auth-layout-container">
      {/* The Login page will render here */}
      <Outlet />
    </div>
  );
};

export default AuthLayout;