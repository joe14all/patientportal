import React, { useState, useMemo } from 'react';
import { useClinicalData } from '../contexts';
import AppointmentList from '../components/appointments/AppointmentList';
import BookingForm from '../components/appointments/BookingForm';
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

  // --- Data Processing ---
  const { upcoming, past } = useMemo(() => {
    // Use mock "today" to be consistent with booking calendar
    const now = new Date('2025-11-15T12:00:00Z');
    const upcoming = [];
    const past = [];
    
    // Sort by date, most recent first
    [...appointments]
      .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime))
      .forEach(appt => {
        // Use status 'Completed' or 'Cancelled' or time to define past
        if (appt.status === 'Completed' || appt.status === 'Cancelled' || new Date(appt.startDateTime) < now) {
          past.push(appt);
        } else {
          upcoming.unshift(appt); // Add to beginning to keep future-most first
        }
      });
    return { upcoming, past };
  }, [appointments]);

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
    setRescheduleTarget(null); // Ensure we're not in reschedule mode
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
          loading={loading}
        />
      )}

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