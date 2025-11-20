/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { mockApi } from '../_mock'; 
import { useEngagementData } from './EngagementContext'; 
import { formatCurrency } from '../utils/formatting';
import { APPOINTMENT_STATUS } from '../constants'; // <--- 1. Import Constants

// 1. Create the context
export const ClinicalContext = createContext(null);

// 3. Create the Provider component
export const ClinicalProvider = ({ children }) => {
  // --- 1. GET createNewThread AND systemAuthor ---
  const { createNewThread, systemAuthor } = useEngagementData();

  // --- State ---
  const [appointments, setAppointments] = useState(mockApi.clinical.appointments);
  const [visitSummaries, setVisitSummaries] = useState(mockApi.clinical.visitSummaries);
  const [treatmentPlans, setTreatmentPlans] = useState(mockApi.clinical.treatmentPlans);
  const [availableSlots, setAvailableSlots] = useState(mockApi.clinical.availableSlots);
  
  // --- 2. New State for Check-In Questions ---
  const [checkInQuestions, setCheckInQuestions] = useState(mockApi.clinical.checkInQuestions);

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
          resolve(result); // <-- Return the result
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

  const bookAppointment = useCallback(async (newAppointmentData) => {
    const newAppointment = await simulateApi(() => {
      const newAppointment = {
        ...newAppointmentData,
        id: `appt-uuid-${Date.now()}`,
        patientId: "patient-uuid-001", 
        status: APPOINTMENT_STATUS.CONFIRMED, // Use constant
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
          createdBy: "user-uuid-001", 
          updatedAt: new Date().toISOString(),
        }
      };
      setAppointments(prev => [...prev, newAppointment]);
      
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
      return newAppointment; 
    });

    try {
      const date = new Date(newAppointment.startDateTime).toLocaleDateString();
      await createNewThread(
        `Appointment Confirmed: ${newAppointment.appointmentType}`,
        'Scheduling',
        `This is an automated confirmation that your appointment for "${newAppointment.appointmentType}" on ${date} has been successfully booked.`,
        [], // attachments
        systemAuthor 
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, systemAuthor]); 

  /**
   * (UPDATE) Cancels an existing appointment.
   */
  const cancelAppointment = useCallback(async (appointmentId, reason) => {
    const cancelledAppt = await simulateApi(() => {
      
      let apptToReturn = null;
      const newAppointments = appointments.map(appt => {
        if (appt.id === appointmentId && (appt.status === APPOINTMENT_STATUS.CONFIRMED || appt.status === APPOINTMENT_STATUS.PENDING)) {
          apptToReturn = {
            ...appt,
            status: APPOINTMENT_STATUS.CANCELLED, // Use constant
            cancellation: {
              cancelledAt: new Date().toISOString(),
              cancelledBy: "Patient",
              reason: reason || "Cancelled via portal.",
            }
          };
          return apptToReturn;
        }
        return appt;
      });

      if (!apptToReturn) {
        throw new Error("Appointment not found or already cancelled.");
      }

      setAppointments(newAppointments);
      return apptToReturn;
    });

    try {
      const date = new Date(cancelledAppt.startDateTime).toLocaleDateString();
      await createNewThread(
        `Appointment Cancelled: ${cancelledAppt.appointmentType}`,
        'Scheduling',
        `This is an automated confirmation that your appointment for "${cancelledAppt.appointmentType}" on ${date} has been cancelled.`,
        [], 
        systemAuthor 
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, appointments, systemAuthor]);

  /**
   * (UPDATE) Reschedules an existing appointment.
   */
  const rescheduleAppointment = useCallback(async (appointmentId, newStart, newEnd) => {
    const rescheduledAppt = await simulateApi(() => {

      let providerId = null;
      let apptToReturn = null;
      
      const newAppointments = appointments.map(appt => {
        if (appt.id === appointmentId) {
          if (appt.status === APPOINTMENT_STATUS.CANCELLED) throw new Error("Cannot reschedule a cancelled appointment.");
          
          providerId = appt.providerId;
          apptToReturn = {
            ...appt,
            startDateTime: newStart,
            endDateTime: newEnd,
            status: APPOINTMENT_STATUS.CONFIRMED, // Re-confirm
            systemInfo: {
              ...appt.systemInfo,
              updatedAt: new Date().toISOString(),
            }
          };
          return apptToReturn;
        }
        return appt;
      });

      if (!apptToReturn) {
        throw new Error("Appointment not found.");
      }

      setAppointments(newAppointments);

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
      
      return apptToReturn;
    });

    try {
      const date = new Date(rescheduledAppt.startDateTime).toLocaleDateString();
      await createNewThread(
        `Appointment Rescheduled: ${rescheduledAppt.appointmentType}`,
        'Scheduling',
        `This is an automated confirmation that your appointment for "${rescheduledAppt.appointmentType}" has been rescheduled to ${date}.`,
        [], 
        systemAuthor 
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, appointments, systemAuthor]); 

  /**
   * (UPDATE) Performs a self-check-in for an appointment.
   * 3. New Function for Self Check-In
   */
  const checkInAppointment = useCallback(async (appointmentId, responses) => {
    await simulateApi(() => {
      setAppointments(prev => prev.map(appt => {
        if (appt.id === appointmentId) {
          // In a real app, we would save 'responses' to a questionnaire response record
          return {
            ...appt,
            status: APPOINTMENT_STATUS.CHECKED_IN, // Update status to CheckedIn
            checkIn: {
              checkInTime: new Date().toISOString(),
              method: "Portal Mobile",
            },
            systemInfo: {
              ...appt.systemInfo,
              updatedAt: new Date().toISOString(),
            }
          };
        }
        return appt;
      }));
    });
  }, []);

  
  const acceptTreatmentPlan = useCallback(async (planId) => {
    const acceptedPlan = await simulateApi(() => {
      let planToReturn = null;
      const newPlans = treatmentPlans.map(plan => {
          if (plan.id === planId && plan.status === "Proposed") {
            planToReturn = {
              ...plan,
              status: "Accepted",
              acceptedAt: new Date().toISOString(),
              patientSignatureId: `doc-uuid-signature-${Date.now()}`, 
            };
            return planToReturn;
          }
          return plan;
        });
      
      if (!planToReturn) throw new Error("Plan not found or not in 'Proposed' state.");
      setTreatmentPlans(newPlans);
      return planToReturn;
    });

    try {
      await createNewThread(
        `Treatment Plan Accepted: ${acceptedPlan.planName}`,
        'Clinical',
        `Thank you for accepting your treatment plan: "${acceptedPlan.planName}". Our team will reach out to schedule your first procedure.`,
        [], 
        systemAuthor 
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, treatmentPlans, systemAuthor]); 

  const rejectTreatmentPlan = useCallback(async (planId, reason) => {
    const rejectedPlan = await simulateApi(() => {
      let planToReturn = null;
      const newPlans = treatmentPlans.map(plan => {
          if (plan.id === planId && plan.status === "Proposed") {
            planToReturn = {
              ...plan,
              status: "Rejected",
              patientNotes: `Patient rejected: ${reason}`,
            };
            return planToReturn;
          }
          return plan;
        });

      if (!planToReturn) throw new Error("Plan not found or not in 'Proposed' state.");
      setTreatmentPlans(newPlans);
      return planToReturn;
    });
    
    try {
      await createNewThread(
        `Treatment Plan Declined: ${rejectedPlan.planName}`,
        'Clinical',
        `This is a notification that you have declined the treatment plan: "${rejectedPlan.planName}". Our team may follow up with you.`,
        [], 
        systemAuthor 
      );
    } catch (msgErr) {
      console.error("Failed to create automated message:", msgErr);
    }
  }, [createNewThread, treatmentPlans, systemAuthor]); 


  // --- Value ---
  const value = useMemo(() => ({
    appointments,
    visitSummaries,
    treatmentPlans,
    availableSlots, 
    checkInQuestions, // <--- 4. Expose Questions
    loading,
    error,
    
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    checkInAppointment, // <--- 5. Expose Check-In Function
    acceptTreatmentPlan,
    rejectTreatmentPlan,
    
  }), [
    appointments, 
    visitSummaries, 
    treatmentPlans, 
    availableSlots, 
    checkInQuestions, // <--- Dependency
    loading, 
    error,
    bookAppointment,
    cancelAppointment,
    rescheduleAppointment,
    checkInAppointment, // <--- Dependency
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