import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoreData } from '../../contexts';
import { CHECK_IN_WINDOW_MINUTES, APPOINTMENT_STATUS } from '../../constants'; // <--- 1. IMPORT
import styles from './AppointmentCard.module.css';

const AppointmentCard = ({ 
  appt, 
  onCancel, 
  onReschedule, 
  onCheckIn, // <--- 2. NEW PROP
  isLoading, 
  isPast = false 
}) => {
  const navigate = useNavigate();
  const { getProviderById, getOfficeById } = useCoreData();

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

  // --- 3. CHECK-IN LOGIC ---
  // Determine if we are within the window (e.g. 30 mins before)
  // NOTE: For testing with MOCK DATA from 2025, we are hardcoding "now".
  // In a real app, use: const now = new Date();
  const MOCK_NOW = new Date('2025-11-15T12:00:00Z'); 
  
  const timeDiffMinutes = (apptDate - MOCK_NOW) / (1000 * 60);
  
  const canCheckIn = 
    !isPast &&
    appt.status === APPOINTMENT_STATUS.CONFIRMED &&
    !appt.checkIn && // Not checked in yet
    timeDiffMinutes <= CHECK_IN_WINDOW_MINUTES && // Within 30 mins
    timeDiffMinutes > -15; // And not more than 15 mins late

  // --- Handlers ---
  const handleViewSummary = () => navigate(`/visits/${appt.linkedRecords.visitSummaryId}`);
  const handleViewInvoice = () => navigate(`/billing?invoiceId=${appt.linkedRecords.invoiceId}`);

  return (
    <div className={`card ${styles.appointmentCard} ${isPast ? styles.past : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.dateTime}>
          <span className={styles.date}>{date}</span>
          <span className={styles.time}>{time}</span>
        </div>
        <span className={`${styles.status} ${styles[appt.status.toLowerCase()] || styles.pending}`}>
          {appt.status === APPOINTMENT_STATUS.CHECKED_IN ? 'Checked In' : appt.status}
        </span>
      </div>

      <div className={styles.cardBody}>
        <h3>{appt.appointmentType}</h3>
        <p>{appt.reasonForVisit}</p>
        
        {/* --- 4. SHOW VIDEO LINK IF TELEHEALTH --- */}
        {appt.systemInfo.isTelehealth ? (
           <div className={styles.telehealthBanner}>
             <strong>Video Visit</strong>
             {canCheckIn || appt.status === APPOINTMENT_STATUS.CHECKED_IN ? (
               <a 
                 href={appt.systemInfo.telehealthUrl} 
                 target="_blank" 
                 rel="noreferrer"
                 className={styles.videoButton}
               >
                 Join Video Call
               </a>
             ) : (
               <span>(Link available 30m before)</span>
             )}
           </div>
        ) : (
          <div className={styles.details}>
            <span><strong>Provider:</strong> {provider?.preferredName || 'N/A'}</span>
            <span>
               <strong>Location:</strong> 
               {/* Map Link */}
               {office?.contact?.address?.googleMapsUrl ? (
                 <a href={office.contact.address.googleMapsUrl} target="_blank" rel="noreferrer" style={{marginLeft: '0.5rem'}}>
                   {office.name} (Map)
                 </a>
               ) : (
                 office?.name || 'N/A'
               )}
            </span>
          </div>
        )}
      </div>

      <div className={styles.cardActions}>
        {!isPast && appt.status !== 'Cancelled' && (
          <>
            {/* --- 5. CHECK IN BUTTON --- */}
            {canCheckIn && !appt.systemInfo.isTelehealth && (
              <button 
                className="primary" // Use primary style for emphasis
                onClick={() => onCheckIn(appt)}
                disabled={isLoading}
              >
                I'm Here (Check In)
              </button>
            )}

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

        {isPast && (
          <>
            {appt.linkedRecords?.visitSummaryId && (
              <button className="secondary" onClick={handleViewSummary}>View Summary</button>
            )}
            {appt.linkedRecords?.invoiceId && (
              <button className="secondary" onClick={handleViewInvoice}>View Invoice</button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;