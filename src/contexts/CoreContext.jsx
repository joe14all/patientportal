/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; // Import the initial mock data
import { formatCurrency } from '../utils/formatting'; // <-- 1. IMPORT FOR CONSISTENCY

// 1. Create the context
export const CoreContext = createContext(null);

// 3. Create the Provider component
export const CoreProvider = ({ children }) => {
  // --- State ---
  // This data is static (read-only definitions), so we don't
  // need 'set' functions for them. We just provide the data.
  // We use 'useState' in case a real app would fetch this on load.
  const [providers, setProviders] = useState(mockApi.core.providers);
  const [offices, setOffices] = useState(mockApi.core.offices);
  const [procedures, setProcedures] = useState(mockApi.core.procedures);
  // --- ADD NEW STATE ---
  const [appointmentTypes, setAppointmentTypes] = useState(mockApi.core.appointmentTypes);
  const [operatories, setOperatories] = useState(mockApi.core.operatories);
  const [downloadableForms, setDownloadableForms] = useState(mockApi.core.downloadableForms);

  // This context has no "actions", so loading/error state
  // is less critical unless we were simulating an initial fetch.
  // We'll keep the state for consistency, but won't add functions.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Core "Getter" Functions ---

  /**
   * (READ) Gets a single procedure from the list by its ID.
   */
  const getProcedureById = useCallback((procedureId) => {
    return procedures.find(p => p.id === procedureId);
  }, [procedures]);

  /**
   * (READ) Gets a single procedure from the list by its CDT Code (e.g., "D1110").
   */
  const getProcedureByCode = useCallback((procedureCode) => {
    return procedures.find(p => p.procedureCode === procedureCode);
  }, [procedures]);

  /**
   * (READ) Gets a single provider.
   * In our mock, there's only one, but this shows the pattern.
   * If `providers` were an array, we'd use .find().
   */
  const getProviderById = useCallback((providerId) => {
    // Since our mock `providers` is an object, not an array
    if (providers.id === providerId) {
      return providers;
    }
    return null; 
  }, [providers]);

  /**
   * (READ) Gets a single office.
   * Same as providers, our mock `offices` is a single object.
   */
  const getOfficeById = useCallback((officeId) => {
    if (offices.id === officeId) {
      return offices;
    }
    return null;
  }, [offices]);

  // --- ADD NEW GETTERS ---

  /**
   * (READ) Gets a single appointment type from the list by its ID.
   */
  const getAppointmentTypeById = useCallback((typeId) => {
    return appointmentTypes.find(t => t.id === typeId);
  }, [appointmentTypes]);

  /**
   * (READ) Gets all patient-facing appointment types.
   */
  const getPatientFacingAppointmentTypes = useMemo(() => {
    return appointmentTypes.filter(t => t.patientFacing === true);
  }, [appointmentTypes]);


  // --- Value ---
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State (READ)
    providers,     // The main provider object
    offices,       // The main office object
    procedures,    // The full array of all procedures
    appointmentTypes, // <-- ADDED
    operatories, 
    downloadableForms,
    loading,
    error,
    
    // Functions (READ Helpers)
    getProcedureById,
    getProcedureByCode,
    getProviderById,
    getOfficeById,
    getAppointmentTypeById, // <-- ADDED
    getPatientFacingAppointmentTypes, // <-- ADDED
    
  }), [
    providers, 
    offices, 
    procedures, 
    appointmentTypes, // <-- ADDED
    operatories,      // <-- ADDED
    downloadableForms,
    loading, 
    error,
    getProcedureById,
    getProcedureByCode,
    getProviderById,
    getOfficeById,
    getAppointmentTypeById, // <-- ADDED
    getPatientFacingAppointmentTypes // <-- ADDED (it's a memoized value, not function)
  ]);

  // --- Render ---
  return (
    <CoreContext.Provider value={value}>
      {children}
    </CoreContext.Provider>
  );
};

// 2. Create the custom hook
export const useCoreData = () => {
  const context = useContext(CoreContext);
  if (!context) {
    throw new Error('useCoreData must be used within a CoreProvider');
  }
  return context;
};