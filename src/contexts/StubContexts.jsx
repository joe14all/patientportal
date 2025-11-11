// --- STUBS FOR OTHER CONTEXTS ---
// You would build these out using the *exact same pattern* as above.

import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockApi } from '../_mock/index.js';
import { usePatient } from './PatientContext.jsx';

// --- Billing ---
const BillingContext = createContext(undefined);
export function BillingProvider({ children }) {
  const { activePatientId } = usePatient(); // Depends on active patient
  // Add state for invoices, payments, etc.
  // Add useEffect to fetch data when activePatientId changes
  const value = { /* invoices, payments, claims... */ };
  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}
export function useBilling() {
  const context = useContext(BillingContext);
  if (context === undefined) throw new Error('useBilling must be used within a BillingProvider');
  return context;
}

// --- Clinical ---
const ClinicalContext = createContext(undefined);
export function ClinicalProvider({ children }) {
  const { activePatientId } = usePatient(); // Depends on active patient
  // Add state for appointments, plans, etc.
  // Add useEffect to fetch data when activePatientId changes
  const value = { /* appointments, treatmentPlans... */ };
  return <ClinicalContext.Provider value={value}>{children}</ClinicalContext.Provider>;
}
export function useClinical() {
  const context = useContext(ClinicalContext);
  if (context === undefined) throw new Error('useClinical must be used within a ClinicalProvider');
  return context;
}

// --- Engagement ---
const EngagementContext = createContext(undefined);
export function EngagementProvider({ children }) {
  const { activePatientId } = usePatient(); // Depends on active patient
  // Add state for messages, documents, etc.
  // Add useEffect to fetch data when activePatientId changes
  const value = { /* threads, documents... */ };
  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
}
export function useEngagement() {
  const context = useContext(EngagementContext);
  if (context === undefined) throw new Error('useEngagement must be used within an EngagementProvider');
  return context;
}