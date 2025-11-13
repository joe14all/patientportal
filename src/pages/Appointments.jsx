import React, { useState, useMemo } from 'react';
import { useClinicalData, useCoreData } from '../contexts';
import { IconAppointments } from '../layouts/components/Icons';
import styles from './Appointments.module.css';

const Appointments = () => {
  const { 
    appointments, 
    bookAppointment, 
    cancelAppointment, 
    loading, 
    error 
  } = useClinicalData();
  
  const { getProviderById, getOfficeById } = useCoreData();

  const [isBooking, setIsBooking] = useState(false);
  const [newApptDate, setNewApptDate] = useState('');
  const [newApptReason, setNewApptReason] = useState('');

  // --- Data Processing ---
  const { upcoming, past } = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];
    
    // Sort by date, most recent first
    [...appointments]
      .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime))
      .forEach(appt => {
        if (new Date(appt.startDateTime) > now) {
          upcoming.unshift(appt); // Add to beginning to keep future-most first
        } else {
          past.push(appt);
        }
      });
    return { upcoming, past };
  }, [appointments]);

  // --- Event Handlers ---
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!newApptDate || !newApptReason) {
      alert("Please select a date and provide a reason.");
      return;
    }
    
    // Combine date and a default time (e.g., 9:00 AM)
    const startDateTime = new Date(`${newApptDate}T09:00:00`).toISOString();
    const endDateTime = new Date(`${newApptDate}T09:45:00`).toISOString();

    try {
      await bookAppointment({
        providerId: "provider-uuid-001", // Hardcode mock provider
        officeId: "office-uuid-001", // Hardcode mock office
        startDateTime,
        endDateTime,
        appointmentType: "Consultation",
        reasonForVisit: newApptReason,
      });
      // Reset form
      setIsBooking(false);
      setNewApptDate('');
      setNewApptReason('');
    } catch (err) {
      console.error("Failed to book appointment", err);
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await cancelAppointment(appointmentId, "Patient cancelled via portal.");
      } catch (err) {
        console.error("Failed to cancel appointment", err);
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.pageHeader}>
        <h1>Appointments</h1>
        <button onClick={() => setIsBooking(prev => !prev)}>
          {isBooking ? 'Cancel Booking' : 'Book Appointment'}
        </button>
      </div>
      <p className={styles.pageDescription}>
        View, schedule, or cancel your appointments.
      </p>

      {error && <p className="error-text">Error: {error}</p>}

      {/* --- Booking Form --- */}
      {isBooking && (
        <div className={`card ${styles.bookingCard}`}>
          <form onSubmit={handleBookSubmit}>
            <h2>Schedule New Appointment</h2>
            <div className="form-group">
              <label htmlFor="apptDate">Date</label>
              <input 
                type="date" 
                id="apptDate"
                value={newApptDate}
                onChange={(e) => setNewApptDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]} // Today
              />
            </div>
            <div className="form-group">
              <label htmlFor="apptReason">Reason for Visit</label>
              <input 
                type="text" 
                id="apptReason"
                value={newApptReason}
                onChange={(e) => setNewApptReason(e.target.value)}
                placeholder="e.g., Checkup, tooth pain..."
              />
            </div>
            <div className={styles.bookingActions}>
              <button 
                type="button" 
                className="secondary" 
                onClick={() => setIsBooking(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Scheduling...' : 'Request Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- Upcoming Appointments --- */}
      <section className={styles.section}>
        <h2>Upcoming Appointments</h2>
        {loading && !upcoming.length && <p>Loading appointments...</p>}
        {upcoming.length > 0 ? (
          <div className={styles.appointmentList}>
            {upcoming.map(appt => (
              <AppointmentCard 
                key={appt.id} 
                appt={appt} 
                getProviderById={getProviderById}
                getOfficeById={getOfficeById}
                onCancel={handleCancel}
                isLoading={loading}
              />
            ))}
          </div>
        ) : (
          !loading && <p>You have no upcoming appointments.</p>
        )}
      </section>

      {/* --- Past Appointments --- */}
      <section className={styles.section}>
        <h2>Past Appointments</h2>
        {loading && !past.length && <p>Loading appointments...</p>}
        {past.length > 0 ? (
          <div className={styles.appointmentList}>
            {past.map(appt => (
              <AppointmentCard 
                key={appt.id} 
                appt={appt}
                getProviderById={getProviderById}
                getOfficeById={getOfficeById}
                isPast={true} 
              />
            ))}
          </div>
        ) : (
          !loading && <p>You have no past appointments.</p>
        )}
      </section>
    </div>
  );
};

// --- Helper Card Component ---
const AppointmentCard = ({ appt, getProviderById, getOfficeById, onCancel, isLoading, isPast = false }) => {
  
  const provider = getProviderById(appt.providerId);
  const office = getOfficeById(appt.officeId);

  const apptDate = new Date(appt.startDateTime);
  const date = apptDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = apptDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={`card ${styles.appointmentCard} ${isPast ? styles.past : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.dateTime}>
          <span className={styles.date}>{date}</span>
          <span className={styles.time}>{time}</span>
        </div>
        <span className={`${styles.status} ${styles[appt.status.toLowerCase()]}`}>
          {appt.status}
        </span>
      </div>
      <div className={styles.cardBody}>
        <h3>{appt.appointmentType}</h3>
        <p>{appt.reasonForVisit}</p>
        <div className={styles.details}>
          <span>
            <strong>Provider:</strong> {provider?.preferredName || 'N/A'}
          </span>
          <span>
            <strong>Location:</strong> {office?.name || 'N/A'}
          </span>
        </div>
      </div>
      {!isPast && appt.status !== 'Cancelled' && (
        <div className={styles.cardActions}>
          <button 
            className="secondary danger"
            onClick={() => onCancel(appt.id)}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button className="secondary" disabled={isLoading}>
            Reschedule
          </button>
        </div>
      )}
    </div>
  );
};

export default Appointments;