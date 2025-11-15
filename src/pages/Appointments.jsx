import React, { useState, useMemo } from 'react';
import { useClinicalData } from '../contexts';
// --- Import our new components ---
import AppointmentList from '../components/appointments/AppointmentList';
import BookingForm from '../components/appointments/BookingForm';
import Modal from '../components/common/Modal'; // <-- 1. Import the Modal

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

  // --- 2. Add state for the cancel confirmation modal ---
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
  
  /**
   * --- 3. Update handleCancel ---
   * This now opens the modal instead of showing window.confirm
   */
  const handleCancel = (appointmentId) => {
    setCancelTargetId(appointmentId);
    setIsCancelModalOpen(true);
  };

  /**
   * --- 4. Add a new handler for the modal's "confirm" button ---
   */
  const handleConfirmCancel = async () => {
    if (!cancelTargetId) return;

    try {
      await cancelAppointment(cancelTargetId, "Patient cancelled via portal.");
    } catch (err) {
      console.error("Failed to cancel appointment", err);
      // In a real app, you'd set an error state here
      // to show in an error modal.
    }
    
    // Clean up state after action is done
    setCancelTargetId(null);
    // The modal's onClose will automatically set isCancelModalOpen(false)
  };
  
  const handleReschedule = (appointment) => {
    // --- THIS IS THE NEW LOGIC ---
    // Set the target appointment and open the booking form
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
          // --- PASS THE NEW PROP ---
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

      {/* --- 5. Add the Modal component (it's invisible by default) --- */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setCancelTargetId(null); // Clear target if user cancels
        }}
        title="Cancel Appointment"
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