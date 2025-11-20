import React, { useState } from 'react';
import AppointmentCard from './AppointmentCard';
import { IconChevronDown } from '../../layouts/components/Icons';
import styles from './AppointmentList.module.css';

/**
 * Renders the sections for "Upcoming" and "Past" appointments.
 * "Past Appointments" is collapsible and collapsed by default.
 */
const AppointmentList = ({ 
  upcoming, 
  past, 
  onCancel, 
  onReschedule, 
  onCheckIn, 
  loading 
}) => {
  // State to toggle past appointments visibility. 
  // Default is false (collapsed/hidden).
  const [isPastExpanded, setIsPastExpanded] = useState(false);

  return (
    <>
      {/* --- Upcoming Appointments (Always Visible) --- */}
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
                onCheckIn={onCheckIn}
                isLoading={loading}
                isPast={false}
              />
            ))}
          </div>
        ) : (
          !loading && <p>You have no upcoming appointments.</p>
        )}
      </section>

      {/* --- Past Appointments (Collapsible) --- */}
      <section className={styles.section}>
        <div 
          className={styles.headerRow} 
          onClick={() => setIsPastExpanded(prev => !prev)}
          role="button"
          tabIndex={0}
        >
          <h2>Past Appointments</h2>
          <IconChevronDown 
            className={`${styles.chevron} ${isPastExpanded ? styles.expanded : ''}`} 
          />
        </div>

        {isPastExpanded && (
          <>
            {loading && !past.length && <p>Loading appointments...</p>}
            {past.length > 0 ? (
              <div className={styles.appointmentList}>
                {past.map(appt => (
                  <AppointmentCard 
                    key={appt.id} 
                    appt={appt}
                    onCancel={onCancel}
                    onReschedule={onReschedule}
                    isLoading={loading}
                    isPast={true} 
                  />
                ))}
              </div>
            ) : (
              !loading && <p>You have no past appointments.</p>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default AppointmentList;