import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApi } from '../_mock';

// Context for static, practice-wide data (providers, offices, procedures)
const CoreContext = createContext(undefined);

export function CoreProvider({ children }) {
  const [coreData, setCoreData] = useState({
    providers: [],
    offices: [],
    procedures: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This data is static and loaded once
    setCoreData({
      providers: mockApi.core.providers,
      offices: mockApi.core.offices,
      procedures: mockApi.core.procedures,
    });
    setIsLoading(false);
  }, []);

  return (
    <CoreContext.Provider value={{ ...coreData, isLoading }}>
      {children}
    </CoreContext.Provider>
  );
}

export function useCore() {
  const context = useContext(CoreContext);
  if (context === undefined) {
    throw new Error('useCore must be used within a CoreProvider');
  }
  return context;
}