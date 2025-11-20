import React, { useState, useMemo } from 'react';
import { useClinicalData } from '../contexts';
import AppointmentList from '../components/appointments/AppointmentList';
import BookingForm from '../components/appointments/BookingForm';
import CheckInModal from '../components/appointments/CheckInModal'; 
import Modal from '../components/common/Modal';

import styles from './Appointments.module.css';

const Appointments = () => {
  const { 
    appointments, 
    cancelAppointment, 
    loading, 
    error 
  } = useClinicalData();
  
  const [isBooking, setIsBooking] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState(null);
const [checkInTarget, setCheckInTarget] = useState(null);

  // --- Data Processing (MOCK NOW for testing) ---
  const { upcoming, past } = useMemo(() => {
    const now = new Date('2025-11-15T12:00:00Z'); 
    // ... (rest of logic is same) ...
    const upcoming = [];
    const past = [];
    [...appointments]
      .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime))
      .forEach(appt => {
        if (appt.status === 'Completed' || appt.status === 'Cancelled' || new Date(appt.startDateTime) < now) {
          past.push(appt);
        } else {
          upcoming.unshift(appt); 
        }
      });
    return { upcoming, past };
  }, [appointments]);

  // --- Event Handlers ---
  
  const handleCheckInClick = (appt) => {
    setCheckInTarget(appt); // Open modal
  };

  const handleCloseCheckIn = () => {
    setCheckInTarget(null);
  };

  // --- Event Handlers ---
  
  const handleCancel = (appointmentId) => {
    setCancelTargetId(appointmentId);
    setIsCancelModalOpen(true);
  };

  /**
   * --- THIS HANDLER IS UPDATED ---
   */
  const handleConfirmCancel = async () => {
    if (!cancelTargetId) return;

    try {
      await cancelAppointment(cancelTargetId, "Patient cancelled via portal.");
      // Success: clear the target
      setCancelTargetId(null);
    } catch (err) {
      console.error("Failed to cancel appointment", err);
      // --- RE-THROW THE ERROR ---
      // This tells the Modal's handlePrimaryClick that something
      // went wrong, so it won't close and will re-enable the button.
      throw err;
    }
  };
  
  const handleReschedule = (appointment) => {
    setRescheduleTarget(appointment);
    setIsBooking(true); 
  };
  
  const handleStartBooking = () => {
    setIsBooking(true);
    setRescheduleTarget(null); 
  };
  
  const handleCloseBooking = () => {
    setIsBooking(false);
    setRescheduleTarget(null);
  };

  // Determine if we are showing the list or the booking form
  const showBookingForm = isBooking || !!rescheduleTarget;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h1>Appointments</h1>
        {!showBookingForm && (
          <button onClick={handleStartBooking}>
            Book Appointment
          </button>
        )}
      </div>
      <p className={styles.pageDescription}>
        View, schedule, or cancel your appointments.
      </p>

      {error && <p className="error-text">Error: {error}</p>}

      {/* --- Conditionally render Booking Form or List --- */}
      {showBookingForm ? (
        <BookingForm 
          onClose={handleCloseBooking} 
          appointmentToReschedule={rescheduleTarget}
        />
      ) : (
        <AppointmentList
          upcoming={upcoming}
          past={past}
          onCancel={handleCancel}
          onReschedule={handleReschedule}
          onCheckIn={handleCheckInClick}
          loading={loading}
        />
      )}

      {/* --- RENDER CHECK-IN MODAL --- */}
      <CheckInModal
        isOpen={!!checkInTarget}
        onClose={handleCloseCheckIn}
        appointment={checkInTarget}
      />

      {/* --- MODAL PROPS ARE UPDATED --- */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          if (loading) return; // Don't allow close while loading
          setIsCancelModalOpen(false);
          setCancelTargetId(null); // Clear target if user cancels
        }}
        title="Cancel Appointment"
        
        // Pass the global loading state
        isLoading={loading}
        
        // Pass the *base* text. The modal handles "Cancelling..."
        primaryActionText="Confirm Cancellation"
        
        primaryActionVariant="danger"
        onPrimaryAction={handleConfirmCancel}
        secondaryActionText="Keep Appointment"
      >
        <p>Are you sure you want to cancel this appointment?</p>
        <p>This action cannot be undone.</p>
      </Modal>

    </div>
  );
};

export default Appointments;