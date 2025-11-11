import React, { createContext, useContext, useState, useEffect } from 'react';
// Corrected the import path to be explicit
import { mockApi } from '../_mock/index.js';

// 1. Create the context
const AccountContext = createContext(undefined);

// 2. Define the provider
export function AccountProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching the logged-in user
    // In a real app, this would be an API call
    const user = mockApi.account.users[0]; // Just log in as the first mock user
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  // Add login/logout functions here
  // const login = (email, password) => { ... };
  // const logout = () => { ... };

  const value = {
    currentUser,
    isLoading,
    // login,
    // logout,
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

// 3. Create a custom hook for easy consumption
export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}