import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoreData } from '../../contexts';
import styles from './AppointmentCard.module.css';

/**
 * A reusable card component to display a single appointment.
 * It handles both upcoming and past appointments and shows relevant actions.
 */
const AppointmentCard = ({ 
  appt, 
  onCancel, 
  onReschedule, // This prop will be used to trigger the reschedule modal
  isLoading, 
  isPast = false 
}) => {
  const navigate = useNavigate();
  const { getProviderById, getOfficeById } = useCoreData();

  // Get provider and office details from CoreContext
  const provider = getProviderById(appt.providerId);
  const office = getOfficeById(appt.officeId);

  // Format date and time
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

  // --- Action Handlers ---
  
  const handleViewSummary = () => {
    // This route doesn't exist yet, but we're preparing for it
    navigate(`/visits/${appt.linkedRecords.visitSummaryId}`);
  };

  const handleViewInvoice = () => {
    // This navigates to the billing page,
    // which would ideally be able to highlight a specific invoice
    navigate(`/billing?invoiceId=${appt.linkedRecords.invoiceId}`);
  };

  return (
    <div className={`card ${styles.appointmentCard} ${isPast ? styles.past : ''}`}>
      {/* --- Card Header: Date, Time, Status --- */}
      <div className={styles.cardHeader}>
        <div className={styles.dateTime}>
          <span className={styles.date}>{date}</span>
          <span className={styles.time}>{time}</span>
        </div>
        <span className={`${styles.status} ${styles[appt.status.toLowerCase()] || styles.pending}`}>
          {appt.status}
        </span>
      </div>

      {/* --- Card Body: Details --- */}
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

      {/* --- Action Buttons --- */}
      <div className={styles.cardActions}>
        {/* Actions for Upcoming Appointments */}
        {!isPast && appt.status !== 'Cancelled' && (
          <>
            <button 
              className="secondary danger"
              onClick={() => onCancel(appt.id)}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              className="secondary" 
              onClick={() => onReschedule(appt)}
              disabled={isLoading}
            >
              Reschedule
            </button>
          </>
        )}

        {/* Actions for Past Appointments */}
        {isPast && (
          <>
            {appt.linkedRecords?.visitSummaryId && (
              <button 
                className="secondary" 
                onClick={handleViewSummary}
              >
                View Visit Summary
              </button>
            )}
            {appt.linkedRecords?.invoiceId && (
              <button 
                className="secondary" 
                onClick={handleViewInvoice}
              >
                View Invoice
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;