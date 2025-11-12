/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useAccountData } from './AccountContext'; // We need this to read/save the user's preference

// 1. Create the context
const ThemeContext = createContext(null);

// 3. Create the Provider component
export const ThemeProvider = ({ children }) => {
  // Get user data and the function to update it
  // We use `loading` to prevent a flash of the wrong theme on initial load
  const { user, updateUserPreferences, loading: accountLoading } = useAccountData();
  
  // Helper to get the system's preferred theme
  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light'; // Default for server-side
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // State to hold the current theme
  const [theme, setTheme] = useState(getSystemTheme);

  // Effect 1: Sync theme from user's saved preference
  // This runs when the user loads or logs in
  useEffect(() => {
    // Check for the user's preference from the mock data
    const userTheme = user?.preferences?.theme;
    if (userTheme) {
      setTheme(userTheme);
    } else if (!accountLoading) {
      // If no user is logged in, fall back to system theme
      setTheme(getSystemTheme());
    }
  }, [user, accountLoading]); // Re-run if user logs in/out

  // Effect 2: Apply the theme to the <body> tag
  useEffect(() => {
    const body = window.document.body;
    body.className = ''; // Clear existing classes
    body.classList.add(theme); // Add 'light' or 'dark'
  }, [theme]); // Run whenever theme changes

  // Function to toggle the theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    
    // If the user is logged in, save this preference to their account
    // This calls the function from AccountContext!
    if (user) {
      updateUserPreferences({ theme: newTheme }); //
    }
  }, [theme, user, updateUserPreferences]);

  // The value to pass to consuming components
  const value = useMemo(() => ({
    theme,
    toggleTheme,
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// 2. Create the custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};