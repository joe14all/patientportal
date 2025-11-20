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
  IconTreatmentPlan, 
  IconMedicalHistory, 
  IconDocuments, 
} from '../layouts/components/Icons';
import { formatCurrency } from '../utils/formatting';
import styles from './Dashboard.module.css';

// --- This is our app's "current" time ---
const MOCK_TODAY = new Date('2025-11-15T12:00:00Z');

const Dashboard = () => {
  const navigate = useNavigate();
  const { patient, alerts, medicalHistory } = usePatientData(); 
  const { appointments, treatmentPlans } = useClinicalData();
  const { billingInvoices } = useBillingData();
  
  // --- 1. Get Documents & Forms Data ---
  const { messageThreads, documents } = useEngagementData(); 
  const { getProviderById, downloadableForms } = useCoreData(); 

  // --- Process Data from Contexts ---

  // 1. Find critical patient alerts
  const activeAlerts = useMemo(() => {
    return alerts.filter(a => a.status === 'Active' && a.type !== 'Patient-Facing');
  }, [alerts]);

  // 2. Find next upcoming appointment
  const nextAppointment = useMemo(() => {
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
    return billingInvoices.reduce((total, inv) => {
      return total + (inv.financialSummary.amountDue?.amount || 0);
    }, 0);
  }, [billingInvoices]);

  // 5. Find a pending treatment plan
  const pendingPlan = useMemo(() => {
    return [...treatmentPlans]
      .filter(plan => plan.status === 'Proposed')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  }, [treatmentPlans]);

  // 6. Get last medical history update date
  const lastHistoryUpdate = useMemo(() => {
    if (!medicalHistory || medicalHistory.length === 0) return null;
    return medicalHistory[0].submissionDate;
  }, [medicalHistory]);

  // --- 7. NEW: Find Actionable Documents (Missing/Rejected/Expired) ---
  const actionableForm = useMemo(() => {
    if (!downloadableForms || !documents) return null;

    // Logic to determine status (matches Documents page logic)
    const getStatus = (form) => {
      const linkedDocs = documents.filter(
        doc => doc.linkContext?.type === 'FormDefinition' && 
               doc.linkContext?.id === form.id && 
               doc.systemInfo.status === 'Active'
      );
      
      if (linkedDocs.length === 0) return form.required ? 'Missing' : 'Optional';

      linkedDocs.sort((a, b) => new Date(b.systemInfo.createdAt) - new Date(a.systemInfo.createdAt));
      const latest = linkedDocs[0];
      const verification = latest.verification || { status: 'Pending' };

      if (verification.status === 'Rejected') return 'Rejected';
      if (verification.status === 'Verified') {
        if (form.frequency === 'Annually') {
           const oneYearAgo = new Date();
           oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
           if (new Date(verification.verifiedAt) < oneYearAgo) return 'Expired';
        }
        return 'Complete';
      }
      return 'Pending';
    };

    const formsWithStatus = downloadableForms.map(f => ({ ...f, status: getStatus(f) }));
    
    // Priority: Rejected > Expired > Missing
    const rejected = formsWithStatus.find(f => f.status === 'Rejected');
    if (rejected) return rejected;

    const expired = formsWithStatus.find(f => f.status === 'Expired');
    if (expired) return expired;

    const missing = formsWithStatus.find(f => f.status === 'Missing');
    if (missing) return missing;

    return null;
  }, [downloadableForms, documents]);


  return (
    <div className={styles.pageWrapper}>
      <h1>Welcome, {patient.preferredName}!</h1>
      <p className={styles.pageDescription}>Here's your summary for today.</p>
      
      {activeAlerts.length > 0 && (
        <AlertCard alert={activeAlerts[0]} />
      )}

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

        {/* Treatment Plan */}
        <WidgetCard
          title="Treatment Plan"
          icon={<IconTreatmentPlan />}
          onClick={() => navigate('/plans')}
        >
          <TreatmentPlanContent plan={pendingPlan} />
        </WidgetCard>

        {/* Medical History */}
        <WidgetCard
          title="Medical History"
          icon={<IconMedicalHistory />}
          onClick={() => navigate('/history')}
        >
          <MedicalHistoryContent lastUpdate={lastHistoryUpdate} />
        </WidgetCard>

        {/* --- NEW: Documents Widget --- */}
        <WidgetCard
          title="Documents" 
          icon={<IconDocuments />}
          onClick={() => navigate('/documents')}
        >
          <DocumentsWidgetContent form={actionableForm} />
        </WidgetCard>

      </div>
    </div>
  );
};

// --- Child Components for Widgets ---

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

const AlertCard = ({ alert }) => (
  <div className={`card ${styles.alertCard}`}>
    <strong>Critical Alert:</strong> {alert.text}
  </div>
);

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

const BillingContent = ({ totalDue }) => (
  <>
    {totalDue > 0 ? (
      <>
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

// --- NEW: Content for Documents Widget ---
const DocumentsWidgetContent = ({ form }) => {
  if (!form) return <p>All required documents are up to date.</p>;
  
  let statusText = "Action Required";
  let statusColor = "var(--error-500)"; // Default to error red

  if (form.status === 'Missing') {
    statusText = "Missing Document";
  } else if (form.status === 'Rejected') {
    statusText = "Upload Rejected";
  } else if (form.status === 'Expired') {
    statusText = "Update Required";
    statusColor = "var(--warning-500)"; // Warning orange
  }

  return (
    <>
      <p className={styles.formName} style={{ color: statusColor, fontWeight: 600 }}>
        {statusText}
      </p>
      <p className={styles.formType}>{form.title}</p>
      <p className={styles.actionText}>Click to manage.</p>
    </>
  );
};

export default Dashboard;