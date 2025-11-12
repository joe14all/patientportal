/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; // Import the initial mock data

// 1. Create the context
export const AccountContext = createContext(null);

// 3. Create the Provider component
// This component will hold the state and all the CRUD functions
export const AccountProvider = ({ children }) => {
  // --- State ---
  const [user, setUser] = useState(mockApi.account.users);
  const [loginHistory, setLoginHistory] = useState(mockApi.account.loginHistory);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to logged out
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Helper for simulated API calls ---
  const simulateApi = (callback, delay = 500) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setError(null);
      setTimeout(() => {
        try {
          const result = callback();
          resolve(result);
        } catch (err) {
          setError(err.message);
          reject(err);
        } finally {
          setLoading(false);
        }
      }, delay);
    });
  };

  // --- Account-Related Functions ---

  /**
   * (CREATE/UPDATE) Simulates a user login.
   * On success, sets auth status and adds a new login history record.
   */
  const login = useCallback(async (email, password) => {
    await simulateApi(() => {
      // In a real app, you'd check password hash. Here we just check email.
      if (email === user.email) {
        setIsAuthenticated(true);
        // Add a "Success" record to login history
        const newHistoryRecord = {
          id: `login-uuid-${Date.now()}`,
          userId: user.id,
          timestamp: new Date().toISOString(),
          ipAddress: "75.128.10.1", // Mocked
          userAgent: "Mocked Browser",
          status: "Success"
        };
        setLoginHistory(prevHistory => [newHistoryRecord, ...prevHistory]);
      } else {
        // Add a "Failed" record
        const newHistoryRecord = {
          id: `login-uuid-${Date.now()}`,
          userId: "unknown",
          timestamp: new Date().toISOString(),
          ipAddress: "75.128.10.1",
          userAgent: "Mocked Browser",
          status: "Failed_Password"
        };
        setLoginHistory(prevHistory => [newHistoryRecord, ...prevHistory]);
        throw new Error("Invalid email or password");
      }
    });
  }, [user]); // Add `user` as dependency

  /**
   * (UPDATE) Simulates a user logout.
   */
  const logout = useCallback(() => {
    setIsAuthenticated(false);
    // You could also add a "logout" event to history if needed
  }, []);

  /**
   * (UPDATE) Updates user preferences (e.g., theme, language).
   * This is a great example of an "UPDATE" function.
   */
  const updateUserPreferences = useCallback(async (newPreferences) => {
    await simulateApi(() => {
      setUser(prevUser => ({
        ...prevUser,
        preferences: {
          ...prevUser.preferences,
          ...newPreferences, // Merge new preferences
        },
      }));
    });
  }, []);

  /**
   * (UPDATE) Updates the user's recovery phone.
   */
  const updateRecoveryPhone = useCallback(async (newPhone) => {
    await simulateApi(() => {
      setUser(prevUser => ({
        ...prevUser,
        contact: {
          ...prevUser.contact,
          recoveryPhone: newPhone,
        },
      }));
    });
  }, []);

  // --- Value ---
  // Memoize the context value to prevent unnecessary re-renders
  // This object is what components will get from the hook
  const value = useMemo(() => ({
    // State (READ)
    user,
    loginHistory,
    isAuthenticated,
    loading,
    error,
    
    // Functions (CREATE, UPDATE, DELETE)
    login,
    logout,
    updateUserPreferences,
    updateRecoveryPhone,
    // Add other functions like:
    // updateUserProfile,
    // changePassword,
  }), [
    user, 
    loginHistory, 
    isAuthenticated, 
    loading, 
    error, 
    login, 
    logout, 
    updateUserPreferences, 
    updateRecoveryPhone
  ]);

  // --- Render ---
  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
};

// 2. Create the custom hook
// This remains the same, but it will now return the rich `value` object
export const useAccountData = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccountData must be used within an AccountProvider');
  }
  return context;
};