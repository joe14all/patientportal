/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; 
import { formatCurrency } from '../utils/formatting';

// 1. Create the context
export const CoreContext = createContext(null);

// 3. Create the Provider component
export const CoreProvider = ({ children }) => {
  // --- State ---
  const [providers, setProviders] = useState(mockApi.core.providers);
  const [offices, setOffices] = useState(mockApi.core.offices); // Now contains googleMapsUrl & coordinates
  const [procedures, setProcedures] = useState(mockApi.core.procedures);
  const [appointmentTypes, setAppointmentTypes] = useState(mockApi.core.appointmentTypes);
  const [operatories, setOperatories] = useState(mockApi.core.operatories);
  const [downloadableForms, setDownloadableForms] = useState(mockApi.core.downloadableForms);

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
   */
  const getOfficeById = useCallback((officeId) => {
    if (offices.id === officeId) {
      return offices;
    }
    return null;
  }, [offices]);


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
  const value = useMemo(() => ({
    // State (READ)
    providers,     
    offices,       
    procedures,    
    appointmentTypes, 
    operatories, 
    downloadableForms,
    loading,
    error,
    
    // Functions (READ Helpers)
    getProcedureById,
    getProcedureByCode,
    getProviderById,
    getOfficeById,
    getAppointmentTypeById, 
    getPatientFacingAppointmentTypes, 
    
  }), [
    providers, 
    offices, 
    procedures, 
    appointmentTypes, 
    operatories,      
    downloadableForms,
    loading, 
    error,
    getProcedureById,
    getProcedureByCode,
    getProviderById,
    getOfficeById,
    getAppointmentTypeById, 
    getPatientFacingAppointmentTypes 
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