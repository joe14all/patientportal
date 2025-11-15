import React, { useState, useMemo, useEffect } from 'react';
import { useClinicalData, useCoreData } from '../../contexts';
import TimeSlotPicker from './TimeSlotPicker';
import styles from './BookingForm.module.css';

/**
 * A multi-step form for booking OR RESCHEDULING an appointment.
 */
const BookingForm = ({ onClose, initialTppId = null, appointmentToReschedule = null }) => {
  const { 
    bookAppointment, 
    rescheduleAppointment, // <-- Get reschedule function
    availableSlots, 
    treatmentPlans,
    loading: clinicalLoading 
  } = useClinicalData();
  
  const { 
    getPatientFacingAppointmentTypes, 
    getAppointmentTypeById, 
    providers,
    appointmentTypes: allAppointmentTypes
  } = useCoreData();

  // --- State for the booking flow ---
  const [isRescheduling, setIsRescheduling] = useState(!!appointmentToReschedule);
  const [isBookingFromPlan, setIsBookingFromPlan] = useState(!!initialTppId);
  
  // --- THIS IS THE FIX ---
  // Always start on step 1. Effects will auto-advance to step 2 if needed.
  const [bookingStep, setBookingStep] = useState(1); 
  
  // --- State for booking data ---
  const [selectedApptTypeId, setSelectedApptTypeId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [tppToBook, setTppToBook] = useState(null); // tpp = Treatment Plan Procedure
  
  // --- Get all "patient facing" appointment types ---
  const patientFacingAppointmentTypes = getPatientFacingAppointmentTypes;

  // --- Find "proposed" procedures from the treatment plan ---
  const proposedProcedures = useMemo(() => {
    return treatmentPlans
      .filter(plan => plan.status === 'Accepted')
      .flatMap(plan => plan.plannedProcedures)
      .filter(proc => proc.status === 'Proposed' && !proc.linkedAppointmentId);
  }, [treatmentPlans]);
  
  // --- Effect to pre-populate form if booking from Treatment Plan ---
  useEffect(() => {
    // Only run if we are in step 1 and have an initialTppId
    if (initialTppId && bookingStep === 1) {
      const procedure = proposedProcedures.find(p => p.id === initialTppId);
      if (procedure) {
        // Find the matching appointment type (e.g., "Crown Placement")
        const apptType = allAppointmentTypes.find(
          at => at.bookingRules.procedureIds.includes(procedure.procedureId)
        );
        
        if (apptType) {
          setTppToBook(procedure);
          setSelectedApptTypeId(apptType.id);
          setIsBookingFromPlan(true);
          setBookingStep(2); // Skip step 1
        }
      }
    }
  }, [initialTppId, proposedProcedures, allAppointmentTypes, bookingStep]); // Added bookingStep

  // --- NEW EFFECT: Pre-populate form if RESCHEDULING ---
  useEffect(() => {
    // Only run if we are in step 1 and have an appointmentToReschedule
    if (appointmentToReschedule && bookingStep === 1) {
      console.log("BookingForm: Reschedule mode detected for", appointmentToReschedule);
      
      // Find the appointment type by matching the name
      // (In a real app, you'd match on `appointmentToReschedule.appointmentTypeId`)
      const apptType = allAppointmentTypes.find(
        at => at.name === appointmentToReschedule.appointmentType
      );
      
      if (apptType) {
        console.log("BookingForm: Found matching apptType for reschedule:", apptType);
        setSelectedApptTypeId(apptType.id);
        setIsRescheduling(true);
        setBookingStep(2); // Skip step 1
      } else {
        console.error(`Could not find matching apptType for: "${appointmentToReschedule.appointmentType}"`);
        // Fallback: show an error or close
        onClose();
      }
    }
  }, [appointmentToReschedule, allAppointmentTypes, onClose, bookingStep]); // Added bookingStep

  // --- Memoized derived data ---
  const selectedApptType = useMemo(() => {
    // Return the full object
    return getAppointmentTypeById(selectedApptTypeId);
  }, [selectedApptTypeId, getAppointmentTypeById]);

  // --- Event Handlers ---
  
  const handleApptTypeSelect = (typeId) => {
    console.log('BookingForm: Selected Appt Type ID', typeId);
    setSelectedApptTypeId(typeId);
    setSelectedSlot(null); // Reset selected slot
    setBookingStep(2);
  };

  const handleSlotSelect = (slot) => {
    if (slot) {
      // If user clicks the same slot, deselect it
      if (selectedSlot && selectedSlot.startTime === slot.startTime) {
        setSelectedSlot(null);
        setBookingStep(2); // Stay on step 2
      } else {
        // User selected a new slot
        setSelectedSlot(slot);
        setBookingStep(3); // Go to confirmation
      }
    } else {
      // slot is null (e.g., date was changed)
      setSelectedSlot(null);
      setBookingStep(2); // Go back/stay on step 2
    }
  };

  /**
   * --- UPDATED to handle both book and reschedule ---
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApptType || !selectedSlot) {
      alert("Please select a new time slot.");
      return;
    }

    try {
      if (isRescheduling) {
        // --- RESCHEDULE LOGIC ---
        console.log(`BookingForm: Rescheduling appointment ${appointmentToReschedule.id} to ${selectedSlot.startTime}`);
        await rescheduleAppointment(
          appointmentToReschedule.id,
          selectedSlot.startTime,
          selectedSlot.endTime
        );

      } else {
        // --- NEW BOOKING LOGIC ---
        console.log('BookingForm: Submitting NEW appointment', {
          providerId: selectedSlot.providerId,
          // ... (rest of log)
        });
        await bookAppointment({
          providerId: selectedSlot.providerId,
          officeId: selectedSlot.officeId,
          startDateTime: selectedSlot.startTime,
          endDateTime: selectedSlot.endTime,
          appointmentType: selectedApptType.name, // Use the internal name
          reasonForVisit: isBookingFromPlan 
            ? `Treatment Plan: ${tppToBook.description}`
            : selectedApptType.description,
          linkedRecords: {
            treatmentPlanProcedureId: tppToBook ? tppToBook.id : null
          }
        });
      }
      onClose(); // Close the form on success
    } catch (err) {
      console.error("Failed to book/reschedule appointment", err);
    }
  };
  
  // --- Render Functions for each step ---
  
  const renderStep1_Type = () => (
    <>
      {/* --- Option 1: Book from Treatment Plan --- */}
      <fieldset className={styles.fieldset}>
        <legend>From Your Treatment Plan</legend>
        {proposedProcedures.length > 0 ? (
          proposedProcedures.map(proc => {
            const apptType = allAppointmentTypes.find(
              at => at.bookingRules.procedureIds.includes(proc.procedureId)
            );
            if (!apptType) {
              console.warn(`No bookable apptType found for procedureId: ${proc.procedureId}`);
              return null;
            }
            
            return (
              <button 
                key={proc.id} 
                type="button" 
                className={styles.planButton}
                onClick={() => {
                  setTppToBook(proc);
                  handleApptTypeSelect(apptType.id);
                  setIsBookingFromPlan(true);
                }}
              >
                <strong>Book: {proc.description}</strong>
                <span>Est. Patient Cost: ${proc.financialEstimate.estimatedPatientPortion.toFixed(2)}</span>
              </button>
            );
          })
        ) : (
          <p className={styles.noPlanText}>
            You have no pending treatment items to schedule.
          </p>
        )}
      </fieldset>
    
      {/* --- Option 2: Book a General Appointment --- */}
      <fieldset className={styles.fieldset}>
        <legend>Book a New Appointment</legend>
        {patientFacingAppointmentTypes.map(type => (
          <button 
            key={type.id} 
            type="button"
            className={styles.typeButton}
            onClick={() => {
              setIsBookingFromPlan(false);
              handleApptTypeSelect(type.id);
            }}
          >
            <strong>{type.patientFacingName}</strong>
            <span>{type.duration} minutes</span>
          </button>
        ))}
      </fieldset>
    </>
  );

  const renderStep2_Time = () => (
    <fieldset className={styles.fieldset}>
      <legend>
        {isRescheduling ? 'Select a New Date & Time' : 'Select an Available Date & Time'}
      </legend>
      
      <div className="form-group">
        <label>{selectedApptType?.patientFacingName || 'Available Times'}</label>
        {/* --- THIS IS THE CHANGE --- */}
        <TimeSlotPicker 
          allSlots={availableSlots}
          selectedApptType={selectedApptType} 
          selectedSlot={selectedSlot}
          onSelectSlot={handleSlotSelect}
        />
      </div>
    </fieldset>
  );

  const renderStep3_Confirm = () => {
    if (!selectedSlot) {
      console.log('BookingForm: renderStep3_Confirm aborted, selectedSlot is null');
      return null;
    }
    
    console.log('BookingForm: Rendering Step 3 with slot:', selectedSlot);
    const provider = providers.id === selectedSlot.providerId ? providers : null;

    return (
      <fieldset className={styles.fieldset}>
        <legend>
          {isRescheduling ? 'Confirm New Appointment' : 'Confirm Your Appointment'}
        </legend>
        <div className={styles.confirmDetails}>
          <p>You are {isRescheduling ? 'rescheduling to' : 'booking'}:</p>
          <strong>{selectedApptType.patientFacingName}</strong>
          <span>
            {new Date(selectedSlot.startTime).toLocaleDateString(undefined, {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </span>
          <span>
            {new Date(selectedSlot.startTime).toLocaleTimeString(undefined, {
              hour: 'numeric', minute: '2-digit'
            })}
          </span>
          <span>with {provider?.preferredName || 'our provider'}</span>
        </div>
      </fieldset>
    );
  };

  return (
    <div className={`card ${styles.bookingCard}`}>
      <form onSubmit={handleSubmit}>
        <div className={styles.bookingHeader}>
          <h2>
            {isRescheduling ? 'Reschedule Appointment' : 'Schedule New Appointment'}
          </h2>
          <button type="button" className="icon-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* --- Render current step --- */}
        {console.log('BookingForm: Rendering step', bookingStep)} 
        {bookingStep === 1 && renderStep1_Type()}
        {bookingStep === 2 && renderStep2_Time()}
        {bookingStep === 3 && renderStep3_Confirm()}
        
        {/* --- Back/Next/Submit Buttons --- */}
        <div className={styles.bookingActions}>
          <button 
            type="button" 
            className="secondary" 
            onClick={() => {
              if (bookingStep === 1) {
                onClose();
              } else if (bookingStep === 3) {
                setSelectedSlot(null); // Clear slot when going back
                setBookingStep(prev => prev - 1);
              } else { // Booking step 2
                // If new booking or from plan, go to step 1
                if (isBookingFromPlan || !isRescheduling) {
                  setBookingStep(1);
                  setSelectedApptTypeId('');
                  setTppToBook(null);
                  setIsBookingFromPlan(false);
                } else {
                  // If rescheduling, "Back" from step 2 means cancel.
                  onClose();
                }
              }
            }}
          >
            {/* --- UPDATED Back button logic --- */}
            {(bookingStep === 1 || (bookingStep === 2 && isRescheduling)) ? 'Cancel' : 'Back'}
          </button>
          
          {bookingStep === 3 && (
            <button 
              type="submit" 
              disabled={clinicalLoading || !selectedSlot}
            >
              {clinicalLoading 
                ? (isRescheduling ? 'Rescheduling...' : 'Booking...') 
                : (isRescheduling ? 'Confirm Reschedule' : 'Confirm Appointment')
              }
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookingForm;