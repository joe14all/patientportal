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
  IconMessages,
  IconTreatmentPlan, // --- ADDED ---
  IconMedicalHistory, // --- ADDED ---
  IconDocuments, // --- ADDED ---
} from '../layouts/components/Icons';
import { formatCurrency } from '../utils/formatting'; // --- ADDED ---
import styles from './Dashboard.module.css';

// --- This is our app's "current" time ---
const MOCK_TODAY = new Date('2025-11-15T12:00:00Z');

const Dashboard = () => {
  const navigate = useNavigate();
  const { patient, alerts, consents, medicalHistory } = usePatientData();
  const { appointments, treatmentPlans } = useClinicalData();
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
    // --- FIX: Use mock today's date for consistent filtering ---
    const upcoming = [...appointments]
      .filter(a => new Date(a.startDateTime) > MOCK_TODAY && a.status === 'Confirmed')
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
    // --- FIX: Access the .amount property of the money object ---
    return billingInvoices.reduce((total, inv) => {
      return total + (inv.financialSummary.amountDue?.amount || 0);
    }, 0);
  }, [billingInvoices]);

  // --- 5. NEW: Find a pending treatment plan ---
  const pendingPlan = useMemo(() => {
    return [...treatmentPlans]
      .filter(plan => plan.status === 'Proposed')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]; // Get most recent
  }, [treatmentPlans]);

  // --- 6. NEW: Find a pending consent form ---
  const pendingConsent = useMemo(() => {
    return consents.find(c => c.status === 'Pending');
  }, [consents]);

  // --- 7. NEW: Get last medical history update date ---
  const lastHistoryUpdate = useMemo(() => {
    if (!medicalHistory || medicalHistory.length === 0) return null;
    return medicalHistory[0].submissionDate; // Assumes first is current
  }, [medicalHistory]);


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

        {/* --- NEW: Pending Treatment Plan --- */}
        <WidgetCard
          title="Treatment Plan"
          icon={<IconTreatmentPlan />}
          onClick={() => navigate('/plans')}
        >
          <TreatmentPlanContent plan={pendingPlan} />
        </WidgetCard>

        {/* --- NEW: Medical History --- */}
        <WidgetCard
          title="Medical History"
          icon={<IconMedicalHistory />}
          onClick={() => navigate('/history')}
        >
          <MedicalHistoryContent lastUpdate={lastHistoryUpdate} />
        </WidgetCard>

        {/* --- NEW: Forms to Sign --- */}
        <WidgetCard
          title="Forms to Sign"
          icon={<IconDocuments />}
          onClick={() => navigate('/documents')} // Send user to documents page
        >
          <PendingConsentContent consent={pendingConsent} />
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
        {/* --- FIX: Use formatter and pass money object --- */}
        <p className={styles.billingDue}>
          {formatCurrency({ amount: totalDue, currency: 'USD' })}
        </p>
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

// --- NEW: Content for Treatment Plan Widget ---
const TreatmentPlanContent = ({ plan }) => {
  if (!plan) return <p>No treatment plans require your review.</p>;
  return (
    <>
      <p className={styles.planName}>{plan.planName}</p>
      <p className={styles.planCost}>
        Est. Patient Cost: {formatCurrency(plan.financialSummary.totalEstimatedPatientPortion)}
      </p>
      <p className={styles.actionText}>Click to review and accept.</p>
    </>
  );
};

// --- NEW: Content for Medical History Widget ---
const MedicalHistoryContent = ({ lastUpdate }) => {
  const lastUpdateDate = lastUpdate ? new Date(lastUpdate).toLocaleDateString() : 'N/A';
  return (
    <>
      <p className={styles.historyText}>Help us keep your records up to date.</p>
      <p className={styles.historyDate}>Last reviewed: {lastUpdateDate}</p>
      <p className={styles.actionText}>Click to review or update.</p>
    </>
  );
};

// --- NEW: Content for Pending Consent Widget ---
const PendingConsentContent = ({ consent }) => {
  if (!consent) return <p>You have no new forms to sign.</p>;
  return (
    <>
      <p className={styles.formName}>You have a new form to sign:</p>
      <p className={styles.formType}>{consent.type.replace('_', ' ')}</p>
      <p className={styles.actionText}>Click here to review and sign.</p>
    </>
  );
};

export default Dashboard;