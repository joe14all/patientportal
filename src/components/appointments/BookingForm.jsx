import React, { useState, useMemo, useEffect } from 'react'; // 1. Ensure useState is imported
import { useClinicalData, useCoreData } from '../../contexts';
import TimeSlotPicker from './TimeSlotPicker';
import styles from './BookingForm.module.css';

/**
 * A multi-step form for booking OR RESCHEDULING an appointment.
 */
const BookingForm = ({ onClose, initialTppId = null, appointmentToReschedule = null }) => {
  const { 
    bookAppointment, 
    rescheduleAppointment,
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

  // --- 2. ADD INTERNAL LOADING STATE ---
  const [isProcessing, setIsProcessing] = useState(false);

  // --- State for the booking flow ---
  const [isRescheduling, setIsRescheduling] = useState(!!appointmentToReschedule);
  const [isBookingFromPlan, setIsBookingFromPlan] = useState(!!initialTppId);
  
  const [bookingStep, setBookingStep] = useState(1); 
  
  const [selectedApptTypeId, setSelectedApptTypeId] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [tppToBook, setTppToBook] = useState(null);
  
  const patientFacingAppointmentTypes = getPatientFacingAppointmentTypes;

  const proposedProcedures = useMemo(() => {
    return treatmentPlans
      .filter(plan => plan.status === 'Accepted')
      .flatMap(plan => plan.plannedProcedures)
      .filter(proc => proc.status === 'Proposed' && !proc.linkedAppointmentId);
  }, [treatmentPlans]);
  
  // ... (all useEffects remain the same) ...
  useEffect(() => {
    if (initialTppId && bookingStep === 1) {
      const procedure = proposedProcedures.find(p => p.id === initialTppId);
      if (procedure) {
        const apptType = allAppointmentTypes.find(
          at => at.bookingRules.procedureIds.includes(procedure.procedureId)
        );
        
        if (apptType) {
          setTppToBook(procedure);
          setSelectedApptTypeId(apptType.id);
          setIsBookingFromPlan(true);
          setBookingStep(2);
        }
      }
    }
  }, [initialTppId, proposedProcedures, allAppointmentTypes, bookingStep]);

  useEffect(() => {
    if (appointmentToReschedule && bookingStep === 1) {
      console.log("BookingForm: Reschedule mode detected for", appointmentToReschedule);
      
      const apptType = allAppointmentTypes.find(
        at => at.name === appointmentToReschedule.appointmentType
      );
      
      if (apptType) {
        console.log("BookingForm: Found matching apptType for reschedule:", apptType);
        setSelectedApptTypeId(apptType.id);
        setIsRescheduling(true);
        setBookingStep(2);
      } else {
        console.error(`Could not find matching apptType for: "${appointmentToReschedule.appointmentType}"`);
        onClose();
      }
    }
  }, [appointmentToReschedule, allAppointmentTypes, onClose, bookingStep]);

  // ... (memoized selectedApptType remains the same) ...
  const selectedApptType = useMemo(() => {
    return getAppointmentTypeById(selectedApptTypeId);
  }, [selectedApptTypeId, getAppointmentTypeById]);

  // ... (handleApptTypeSelect and handleSlotSelect remain the same) ...
  const handleApptTypeSelect = (typeId) => {
    console.log('BookingForm: Selected Appt Type ID', typeId);
    setSelectedApptTypeId(typeId);
    setSelectedSlot(null); // Reset selected slot
    setBookingStep(2);
  };

  const handleSlotSelect = (slot) => {
    if (slot) {
      if (selectedSlot && selectedSlot.startTime === slot.startTime) {
        setSelectedSlot(null);
        setBookingStep(2);
      } else {
        setSelectedSlot(slot);
        setBookingStep(3);
      }
    } else {
      setSelectedSlot(null);
      setBookingStep(2);
    }
  };

  /**
   * --- 3. UPDATE handleSubmit ---
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApptType || !selectedSlot) {
      alert("Please select a new time slot.");
      return;
    }

    setIsProcessing(true); // <-- SET PROCESSING IMMEDIATELY

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
          appointmentType: selectedApptType.name,
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
      // On error, re-enable the form
      setIsProcessing(false); // <-- RESET ON ERROR
    }
    // Don't reset isProcessing on success, as the component will unmount
  };
  
  // ... (renderStep1_Type, renderStep2_Time, renderStep3_Confirm remain the same) ...
  
  const renderStep1_Type = () => (
    <>
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

  // --- 4. COMBINE LOADING STATES ---
  const isDisabled = clinicalLoading || isProcessing;

  return (
    <div className={`card ${styles.bookingCard}`}>
      <form onSubmit={handleSubmit}>
        <div className={styles.bookingHeader}>
          <h2>
            {isRescheduling ? 'Reschedule Appointment' : 'Schedule New Appointment'}
          </h2>
          <button 
            type="button" 
            className="icon-button" 
            onClick={onClose} 
            disabled={isDisabled} // <-- 5. DISABLE CLOSE BUTTON
          >
            &times;
          </button>
        </div>

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
                setSelectedSlot(null);
                setBookingStep(prev => prev - 1);
              } else { // Booking step 2
                if (isBookingFromPlan || !isRescheduling) {
                  setBookingStep(1);
                  setSelectedApptTypeId('');
                  setTppToBook(null);
                  setIsBookingFromPlan(false);
                } else {
                  onClose();
                }
              }
            }}
            disabled={isDisabled} // <-- 6. DISABLE BACK/CANCEL BUTTON
          >
            {(bookingStep === 1 || (bookingStep === 2 && isRescheduling)) ? 'Cancel' : 'Back'}
          </button>
          
          {bookingStep === 3 && (
            <button 
              type="submit" 
              // --- 7. UPDATE DISABLED LOGIC ---
              disabled={isDisabled || !selectedSlot}
            >
              {/* --- 8. UPDATE TEXT LOGIC --- */}
              {isProcessing ? 'Processing...' : (
                clinicalLoading 
                  ? (isRescheduling ? 'Rescheduling...' : 'Booking...') 
                  : (isRescheduling ? 'Confirm Reschedule' : 'Confirm Appointment')
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BookingForm;