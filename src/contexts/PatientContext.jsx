/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; // Import the initial mock data

// 1. Create the context
export const PatientContext = createContext(null);

// 3. Create the Provider component
export const PatientProvider = ({ children }) => {
  // --- State ---
  // Note: patients.json is a single object, the others are arrays.
  const [patient, setPatient] = useState(mockApi.patient.patients); //
  const [medicalHistory, setMedicalHistory] = useState(mockApi.patient.medicalHistory); //
  const [consents, setConsents] = useState(mockApi.patient.consents); //
  const [alerts, setAlerts] = useState(mockApi.patient.patientAlerts); //

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
          console.error("Mock API Error:", err.message);
          setError(err.message);
          reject(err);
        } finally {
          setLoading(false);
        }
      }, delay);
    });
  };

  // --- Patient Functions ---

  /**
   * (UPDATE) Updates core patient details (contact, demographics, etc.).
   */
  const updatePatientDetails = useCallback(async (updatedPatientData) => {
    await simulateApi(() => {
      setPatient(prevPatient => ({
        ...prevPatient,
        ...updatedPatientData,
        // Deep merge for nested objects if needed, e.g., contact
        contact: {
          ...prevPatient.contact,
          ...(updatedPatientData.contact || {}),
        },
        demographics: {
          ...prevPatient.demographics,
          ...(updatedPatientData.demographics || {}),
        },
        systemInfo: {
          ...prevPatient.systemInfo,
          updatedAt: new Date().toISOString()
        }
      }));
    });
  }, []);

  // --- Medical History Functions ---

  /**
   * (UPDATE) Updates the entire medical history form.
   * Assumes we are editing the most recent history (index 0).
   */
  const updateMedicalHistory = useCallback(async (historyId, updatedHistoryData) => {
    await simulateApi(() => {
      setMedicalHistory(prevHistories =>
        prevHistories.map(history =>
          history.id === historyId
            ? { ...history, ...updatedHistoryData, submissionDate: new Date().toISOString() } //
            : history
        )
      );
    });
  }, []);

  /**
   * (CREATE) Adds a new item to a medical history section (e.g., a new allergy).
   */
  const addMedicalHistoryItem = useCallback(async (historyId, itemType, newItem) => {
    // itemType should be 'allergies', 'medications', 'conditions', 'surgeries'
    await simulateApi(() => {
      setMedicalHistory(prevHistories =>
        prevHistories.map(history => {
          if (history.id === historyId) {
            const newHistory = { ...history };
            const newItems = [
              ...newHistory[itemType].items,
              { ...newItem, id: `${itemType}-item-${Date.now()}` }
            ];
            newHistory[itemType].items = newItems; //
            return newHistory;
          }
          return history;
        })
      );
    });
  }, []);

  /**
   * (UPDATE) Updates an existing item in a medical history section.
   */
  const updateMedicalHistoryItem = useCallback(async (historyId, itemType, updatedItem) => {
    await simulateApi(() => {
      setMedicalHistory(prevHistories =>
        prevHistories.map(history => {
          if (history.id === historyId) {
            const newHistory = { ...history };
            const newItems = newHistory[itemType].items.map(item =>
              item.id === updatedItem.id ? { ...item, ...updatedItem } : item
            );
            newHistory[itemType].items = newItems; //
            return newHistory;
          }
          return history;
        })
      );
    });
  }, []);

  /**
   * (DELETE) Removes an item from a medical history section.
   */
  const removeMedicalHistoryItem = useCallback(async (historyId, itemType, itemId) => {
    await simulateApi(() => {
      setMedicalHistory(prevHistories =>
        prevHistories.map(history => {
          if (history.id === historyId) {
            const newHistory = { ...history };
            const filteredItems = newHistory[itemType].items.filter(
              item => item.id !== itemId
            );
            newHistory[itemType].items = filteredItems; //
            return newHistory;
          }
          return history;
        })
      );
    });
  }, []);

  // --- Consent Functions ---

  /**
   * (UPDATE) Signs a pending consent form.
   */
  const signConsent = useCallback(async (consentId, signedByUserId) => {
    await simulateApi(() => {
      setConsents(prevConsents =>
        prevConsents.map(consent => {
          if (consent.id === consentId && consent.status === 'Pending') { //
            return {
              ...consent,
              status: 'Signed',
              dateSigned: new Date().toISOString(),
              signedByUserId: signedByUserId, // From auth context
            };
          }
          return consent;
        })
      );
    });
  }, []);

  // --- Alert Functions ---

  /**
   * (UPDATE) Resolves or acknowledges a patient-facing alert.
   */
  const acknowledgeAlert = useCallback(async (alertId, resolvedBy) => {
    await simulateApi(() => {
      setAlerts(prevAlerts =>
        prevAlerts.map(alert => {
          if (alert.id === alertId && alert.status === 'Active') { //
            return {
              ...alert,
              status: 'Resolved',
              resolvedAt: new Date().toISOString(),
              resolvedBy: resolvedBy, // e.g., "patient-uuid-001"
            };
          }
          return alert;
        })
      );
    });
  }, []);

  /**
   * (UPDATE) Updates just the patient's profile image URL.
   */
  const updateProfilePicture = useCallback(async (newImageUrl) => {
    // We use a shorter delay for a snappy UI update
    await simulateApi(() => {
      setPatient(prevPatient => ({
        ...prevPatient,
        systemInfo: {
          ...prevPatient.systemInfo,
          profileImageUrl: newImageUrl, // Set the new URL (or null)
          updatedAt: new Date().toISOString()
        }
      }));
    }, 200); // 200ms delay
  }, []);

  // --- Value ---
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State (READ)
    patient,
    medicalHistory,
    consents,
    alerts,
    loading,
    error,
    
    // Functions (CREATE, UPDATE, DELETE)
    updatePatientDetails,
    updateProfilePicture, 
    updateMedicalHistory,
    addMedicalHistoryItem,
    updateMedicalHistoryItem,
    removeMedicalHistoryItem,
    signConsent,
    acknowledgeAlert,
    
  }), [
    patient, 
    medicalHistory, 
    consents, 
    alerts, 
    loading, 
    error,
    updatePatientDetails,
    updateProfilePicture, 
    updateMedicalHistory,
    addMedicalHistoryItem,
    updateMedicalHistoryItem, 
    removeMedicalHistoryItem,
    signConsent,
    acknowledgeAlert
  ]);

  // --- Render ---
  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

// 2. Create the custom hook
export const usePatientData = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatientData must be used within a PatientProvider');
  }
  return context;
};