import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './QuickActions.module.css';

/**
 * Mobile Quick Actions Bar
 * Apple-inspired design with focused actions for mobile users
 * Provides one-tap access to most critical patient actions
 */
const QuickActions = ({ unreadCount = 0, upcomingApptCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const actions = [
    {
      id: 'home',
      icon: '🏠',
      label: 'Home',
      path: '/',
      badge: null
    },
    {
      id: 'appointments',
      icon: '📅',
      label: 'Book',
      path: '/appointments',
      badge: upcomingApptCount > 0 ? upcomingApptCount : null
    },
    {
      id: 'messages',
      icon: '💬',
      label: 'Chat',
      path: '/messages',
      badge: unreadCount > 0 ? unreadCount : null
    },
    {
      id: 'education',
      icon: '📚',
      label: 'Learn',
      path: '/education',
      badge: null
    },
    {
      id: 'profile',
      icon: '👤',
      label: 'Profile',
      path: '/profile',
      badge: null
    }
  ];

  return (
    <div className={styles.quickActionsBar}>
      <div className={styles.quickActionsContent}>
        {actions.map((action) => {
          const isActive = location.pathname === action.path || 
                          (action.path === '/' && location.pathname === '/');
          return (
            <button
              key={action.id}
              className={`${styles.actionButton} ${isActive ? styles.active : ''}`}
              onClick={() => navigate(action.path)}
              aria-label={action.label}
            >
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{action.icon}</span>
                {action.badge && (
                  <span className={styles.badge}>{action.badge}</span>
                )}
              </div>
              <span className={styles.actionLabel}>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
