/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; // Import the initial mock data

// 1. Create the context
export const ClinicalContext = createContext(null);

// 3. Create the Provider component
export const ClinicalProvider = ({ children }) => {
  // --- State ---
  const [appointments, setAppointments] = useState(mockApi.clinical.appointments);
  const [visitSummaries, setVisitSummaries] = useState(mockApi.clinical.visitSummaries);
  const [treatmentPlans, setTreatmentPlans] = useState(mockApi.clinical.treatmentPlans);
  const [availableSlots, setAvailableSlots] = useState(mockApi.clinical.availableSlots);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Helper for simulated API calls ---
  const simulateApi = (callback, delay = 600) => {
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

  // --- Appointment Functions ---

  /**
   * (CREATE) Books a new appointment.
   */
  const bookAppointment = useCallback(async (newAppointmentData) => {
    // newAppointmentData should include: { providerId, officeId, startDateTime, endDateTime, appointmentType, reasonForVisit }
    await simulateApi(() => {
      const newAppointment = {
        ...newAppointmentData,
        id: `appt-uuid-${Date.now()}`,
        patientId: "patient-uuid-001", // Hardcoded for mock
        status: "Confirmed", // Or "Pending" if it needs staff approval
        confirmation: {
          status: "Confirmed",
          method: "Online Portal",
          lastReminderSentAt: null,
        },
        cancellation: null,
        checkIn: null,
        linkedRecords: {},
        systemInfo: {
          isTelehealth: false,
          createdAt: new Date().toISOString(),
          createdBy: "user-uuid-001", // Get from auth context
          updatedAt: new Date().toISOString(),
        }
      };
      setAppointments(prev => [...prev, newAppointment]);
      
      // --- ADD LOGIC TO REMOVE THE BOOKED SLOT ---
      // This is a basic implementation. A real app would be more robust.
      // We find the date key first, e.g., "2025-11-18"
      const dateKey = newAppointmentData.startDateTime.split('T')[0];
      setAvailableSlots(prevSlots => {
        const updatedSlotsForDate = (prevSlots[dateKey] || []).filter(
          slot => slot.startTime !== newAppointmentData.startDateTime || 
                  slot.providerId !== newAppointmentData.providerId
        );
        return {
          ...prevSlots,
          [dateKey]: updatedSlotsForDate
        };
      });
    });
  }, []);

  /**
   * (UPDATE) Cancels an existing appointment.
   */
  const cancelAppointment = useCallback(async (appointmentId, reason) => {
    await simulateApi(() => {
      setAppointments(prev =>
        prev.map(appt => {
          if (appt.id === appointmentId && (appt.status === "Confirmed" || appt.status === "Pending")) {
            return {
              ...appt,
              status: "Cancelled",
              cancellation: {
                cancelledAt: new Date().toISOString(),
                cancelledBy: "Patient",
                reason: reason || "Cancelled via portal.",
              }
            };
          }
          return appt;
        })
      );
      
      // --- ADD LOGIC TO ADD SLOT BACK (if desired) ---
      // Note: This is complex as you need to know the original slot.
      // For now, we will *not* add the slot back to keep it simple.
    });
  }, []);

  /**
   * (UPDATE) Reschedules an existing appointment.
   * --- UPDATED TO REMOVE NEW SLOT ---
   */
  const rescheduleAppointment = useCallback(async (appointmentId, newStart, newEnd) => {
    await simulateApi(() => {
      let providerId = null;
      setAppointments(prev =>
        prev.map(appt => {
          if (appt.id === appointmentId) {
            // Check if appointment can be rescheduled (not already 'Cancelled' or 'Completed')
            if (appt.status === "Cancelled") throw new Error("Cannot reschedule a cancelled appointment.");
            
            providerId = appt.providerId; // Get providerId for slot removal

            return {
              ...appt,
              startDateTime: newStart,
              endDateTime: newEnd,
              status: "Confirmed", // Re-confirm
              systemInfo: {
                ...appt.systemInfo,
                updatedAt: new Date().toISOString(),
              }
            };
          }
          return appt;
        })
      );

      // --- ADDED: Remove the NEWLY booked slot from availability ---
      if (providerId) {
        const dateKey = newStart.split('T')[0];
        setAvailableSlots(prevSlots => {
          const updatedSlotsForDate = (prevSlots[dateKey] || []).filter(
            slot => slot.startTime !== newStart || 
                    slot.providerId !== providerId
          );
          return {
            ...prevSlots,
            [dateKey]: updatedSlotsForDate
          };
        });
      }
    });
  }, []);

  // --- Treatment Plan Functions ---

  /**
   * (UPDATE) Accepts a treatment plan.
   */
  const acceptTreatmentPlan = useCallback(async (planId) => {
    await simulateApi(() => {
      setTreatmentPlans(prev =>
        prev.map(plan => {
          if (plan.id === planId && plan.status === "Proposed") {
            return {
              ...plan,
              status: "Accepted",
              acceptedAt: new Date().toISOString(),
              patientSignatureId: `doc-uuid-signature-${Date.now()}`, // Mock signature
            };
          }
          return plan;
        })
      );
    });
  }, []);

  /**
   * (UPDATE) Rejects a treatment plan.
   */
  const rejectTreatmentPlan = useCallback(async (planId, reason) => {
    await simulateApi(() => {
      setTreatmentPlans(prev =>
        prev.map(plan => {
          if (plan.id === planId && plan.status === "Proposed") {
            return {
              ...plan,
              status: "Rejected",
              patientNotes: `Patient rejected: ${reason}`,
            };
          }
          return plan;
        })
      );
      // This would likely also trigger a message to the provider.
    });
  }, []);

  // --- Visit Summary Functions ---
  // Note: Visit summaries are typically READ-ONLY for patients.
  // We don't provide functions to create or edit them here.
  // A `requestAmendment` function could be added, but it
  // would likely live in the 'Engagement' (messaging) context.

  // --- Value ---
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    // State (READ)
    appointments,
    visitSummaries,
    treatmentPlans,
    availableSlots, // <-- ADDED
    loading,
    error,
    
    // Functions (CREATE, UPDATE, DELETE)
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    acceptTreatmentPlan,
    rejectTreatmentPlan,
    
  }), [
    appointments, 
    visitSummaries, 
    treatmentPlans, 
    availableSlots, // <-- ADDED
    loading, 
    error,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    acceptTreatmentPlan,
    rejectTreatmentPlan
  ]);

  // --- Render ---
  return (
    <ClinicalContext.Provider value={value}>
      {children}
    </ClinicalContext.Provider>
  );
};

// 2. Create the custom hook
export const useClinicalData = () => {
  const context = useContext(ClinicalContext);
  if (!context) {
    throw new Error('useClinicalData must be used within a ClinicalProvider');
  }
  return context;
};