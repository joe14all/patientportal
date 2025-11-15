import React from 'react';
import AppointmentCard from './AppointmentCard';
import styles from './AppointmentList.module.css';

/**
 * Renders the sections for "Upcoming" and "Past" appointments.
 * It takes the lists and renders AppointmentCard components for each item.
 */
const AppointmentList = ({ 
  upcoming, 
  past, 
  onCancel, 
  onReschedule, 
  loading 
}) => {
  return (
    <>
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
                onCancel={onCancel}
                onReschedule={onReschedule}
                isLoading={loading}
                isPast={false}
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
                onCancel={onCancel} // Pass handlers even for past (for consistency, though unused)
                onReschedule={onReschedule}
                isLoading={loading}
                isPast={true} 
              />
            ))}
          </div>
        ) : (
          !loading && <p>You have no past appointments.</p>
        )}
      </section>
    </>
  );
};

export default AppointmentList;