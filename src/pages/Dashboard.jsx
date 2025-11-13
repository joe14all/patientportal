import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  usePatientData,
  useClinicalData,
  useBillingData,
  useEngagementData,
  useCoreData,
} from '../contexts';
import { 
  IconAppointments, 
  IconBilling, 
  IconMessages 
} from '../layouts/components/Icons';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { patient, alerts } = usePatientData();
  const { appointments } = useClinicalData();
  const { billingInvoices } = useBillingData();
  const { messageThreads } = useEngagementData();
  const { getProviderById } = useCoreData();

  // --- Process Data from Contexts ---

  // 1. Find critical patient alerts
  const activeAlerts = useMemo(() => {
    return alerts.filter(a => a.status === 'Active' && a.type !== 'Patient-Facing');
  }, [alerts]);

  // 2. Find next upcoming appointment
  const nextAppointment = useMemo(() => {
    const upcoming = [...appointments]
      .filter(a => new Date(a.startDateTime) > new Date() && a.status === 'Confirmed')
      .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
    return upcoming[0];
  }, [appointments]);

  // 3. Find most recent unread message
  const unreadThread = useMemo(() => {
    return [...messageThreads]
      .filter(t => !t.readStatus.isReadByPatient)
      .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp))[0];
  }, [messageThreads]);

  // 4. Calculate total outstanding balance
  const totalDue = useMemo(() => {
    return billingInvoices.reduce((total, inv) => {
      return total + (inv.financialSummary.amountDue || 0);
    }, 0);
  }, [billingInvoices]);

  return (
    <div className={styles.pageWrapper}>
      <h1>Welcome, {patient.preferredName}!</h1>
      <p className={styles.pageDescription}>Here's your summary for today.</p>
      
      {/* --- Critical Alerts --- */}
      {activeAlerts.length > 0 && (
        <AlertCard alert={activeAlerts[0]} />
      )}

      {/* --- Main Widget Grid --- */}
      <div className={styles.widgetGrid}>
        
        {/* Next Appointment */}
        <WidgetCard
          title="Next Appointment"
          icon={<IconAppointments />}
          onClick={() => navigate('/appointments')}
        >
          {nextAppointment ? (
            <AppointmentContent appt={nextAppointment} getProviderById={getProviderById} />
          ) : (
            <p>You have no upcoming appointments.</p>
          )}
        </WidgetCard>
        
        {/* Outstanding Balance */}
        <WidgetCard
          title="Billing"
          icon={<IconBilling />}
          onClick={() => navigate('/billing')}
        >
          <BillingContent totalDue={totalDue} />
        </WidgetCard>

        {/* Unread Message */}
        <WidgetCard
          title="Messages"
          icon={<IconMessages />}
          onClick={() => navigate(unreadThread ? `/messages/${unreadThread.id}` : '/messages')}
        >
          <MessageContent thread={unreadThread} />
        </WidgetCard>

      </div>
    </div>
  );
};

// --- Child Components for Widgets ---

// This is the generic clickable card wrapper
const WidgetCard = ({ title, icon, onClick, children }) => (
  <div className={`card ${styles.widgetCard}`} onClick={onClick}>
    <div className={styles.widgetHeader}>
      <div className={styles.widgetIcon}>{icon}</div>
      <h2 className={styles.widgetTitle}>{title}</h2>
    </div>
    <div className={styles.widgetContent}>
      {children}
    </div>
  </div>
);

// Alert Card (Special, not a generic widget)
const AlertCard = ({ alert }) => (
  <div className={`card ${styles.alertCard}`}>
    <strong>Critical Alert:</strong> {alert.text}
  </div>
);

// Content for Appointment Widget
const AppointmentContent = ({ appt, getProviderById }) => {
  const provider = getProviderById(appt.providerId);
  const apptDate = new Date(appt.startDateTime);
  
  return (
    <>
      <p className={styles.apptDate}>
        {apptDate.toLocaleDateString(undefined, { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
      <p className={styles.apptTime}>
        {apptDate.toLocaleTimeString(undefined, { 
          hour: 'numeric', 
          minute: '2-digit' 
        })}
      </p>
      <p className={styles.apptProvider}>
        with {provider?.preferredName || 'your provider'}
      </p>
    </>
  );
};

// Content for Billing Widget
const BillingContent = ({ totalDue }) => (
  <>
    {totalDue > 0 ? (
      <>
        <p className={styles.billingDue}>${totalDue.toFixed(2)}</p>
        <p className={styles.billingStatus}>Total Amount Due</p>
      </>
    ) : (
      <>
        <p className={styles.billingPaid}>You're all paid up!</p>
        <p className={styles.billingStatus}>No outstanding balance.</p>
      </>
    )}
  </>
);

// Content for Message Widget
const MessageContent = ({ thread }) => (
  <>
    {thread ? (
      <>
        <p className={styles.messageUnread}>New Unread Message</p>
        <p className={styles.messageSubject}>{thread.subject}</p>
        <p className={styles.messageSnippet}>{thread.lastMessage.snippet}</p>
      </>
    ) : (
      <p>You have no unread messages.</p>
    )}
  </>
);

export default Dashboard;