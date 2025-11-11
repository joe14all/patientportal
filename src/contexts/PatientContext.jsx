import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useAccount } from './AccountContext';
import { mockApi } from '../_mock';

// 1. Create the context
const PatientContext = createContext(undefined);

// 2. Define the provider
export function PatientProvider({ children }) {
  const { currentUser } = useAccount();
  const [patientList, setPatientList] = useState([]);
  const [activePatientId, setActivePatientId] = useState(null);
  const [activePatientData, setActivePatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect 1: Load the list of patients linked to the current user
  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      const linkedPatientIds = currentUser.patientLinks.map((link) => link.patientId);
      const userPatients = mockApi.patient.patients.filter((p) =>
        linkedPatientIds.includes(p.id)
      );
      setPatientList(userPatients);

      // Default to the first patient in the list
      if (userPatients.length > 0) {
        setActivePatientId(userPatients[0].id);
      }
      setIsLoading(false);
    }
  }, [currentUser]);

  // Effect 2: When active patient changes, fetch all their related data
  useEffect(() => {
    if (activePatientId) {
      setIsLoading(true);
      // Simulate fetching all related data for the active patient
      const data = {
        profile: mockApi.patient.patients.find((p) => p.id === activePatientId),
        history: mockApi.patient.medicalHistory.filter(
          (h) => h.patientId === activePatientId
        ),
        consents: mockApi.patient.consents.filter(
          (c) => c.patientId === activePatientId
        ),
        alerts: mockApi.patient.patientAlerts.filter(
          (a) => a.patientId === activePatientId
        ),
      };
      setActivePatientData(data);
      setIsLoading(false);
    }
  }, [activePatientId]);

  const selectPatient = (patientId) => {
    setActivePatientId(patientId);
  };

  const value = {
    activePatientId,
    activePatientData,
    patientList,
    selectPatient,
    isLoading,
  };

  return <PatientContext.Provider value={value}>{children}</PatientContext.Provider>;
}

// 3. Create a custom hook
export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}