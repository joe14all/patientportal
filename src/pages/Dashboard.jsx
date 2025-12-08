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
import { getTimeBasedGreeting } from '../utils/patientExperience';
import HealthJourney from '../components/dashboard/HealthJourney';
import styles from './Dashboard.module.css';

// --- This is our app's "current" time ---
const MOCK_TODAY = new Date('2025-11-15T12:00:00Z');

const Dashboard = () => {
  const navigate = useNavigate();
  const { patient, alerts, medicalHistory } = usePatientData(); 
  const { appointments, treatmentPlans, visitSummaries } = useClinicalData();
  const { billingInvoices } = useBillingData();
  
  // --- 1. Get Documents & Forms Data ---
  const { messageThreads, documents, calculateEngagementTrophies } = useEngagementData(); 
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

  // --- 8. Get most recent visit summary ---
  const recentVisitSummary = useMemo(() => {
    if (!visitSummaries || visitSummaries.length === 0) {
      console.log('No visit summaries found');
      return null;
    }
    
    const sortedSummaries = [...visitSummaries].sort((a, b) => 
      new Date(b.visitDate) - new Date(a.visitDate)
    );
    
    console.log('Recent visit summary:', sortedSummaries[0]);
    return sortedSummaries[0];
  }, [visitSummaries]);

  // --- 9. Calculate Engagement Trophy Data ---
  const engagementData = useMemo(() => {
    // Appointment statistics
    const completedAppointments = appointments.filter(a => 
      a.status === 'Completed' && new Date(a.startDateTime) <= MOCK_TODAY
    );
    const cancelledAppointments = appointments.filter(a => 
      a.status === 'Cancelled'
    );
    const scheduledAppointments = appointments.filter(a => 
      a.status === 'Confirmed' || a.status === 'Completed'
    );

    // Billing statistics
    const paidInvoices = billingInvoices.filter(inv => 
      inv.financialSummary.amountDue?.amount === 0
    );
    const onTimePayments = billingInvoices.filter(inv => {
      const dueDate = new Date(inv.financialSummary.dueDate);
      const paidDate = inv.financialSummary.lastPaymentDate ? new Date(inv.financialSummary.lastPaymentDate) : null;
      return paidDate && paidDate <= dueDate && inv.financialSummary.amountDue?.amount === 0;
    });

    // Document statistics
    const verifiedDocuments = documents.filter(doc => 
      doc.verification?.status === 'Verified' && doc.systemInfo.status === 'Active'
    );
    const requiredForms = downloadableForms?.filter(form => form.required) || [];
    const allRequiredCompleted = requiredForms.length > 0 && requiredForms.every(form => {
      return documents.some(doc => 
        doc.linkContext?.type === 'FormDefinition' && 
        doc.linkContext?.id === form.id && 
        doc.verification?.status === 'Verified' &&
        doc.systemInfo.status === 'Active'
      );
    });

    // Medical History statistics
    const hasHistory = medicalHistory && medicalHistory.length > 0;
    const latestHistory = hasHistory ? medicalHistory[0] : null;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const isRecent = latestHistory ? new Date(latestHistory.submissionDate) >= sixMonthsAgo : false;

    return {
      appointments: {
        completedCount: completedAppointments.length,
        cancelledCount: cancelledAppointments.length,
        totalScheduled: scheduledAppointments.length
      },
      billing: {
        paidOnTime: onTimePayments.length,
        totalDue: totalDue,
        paymentsCount: paidInvoices.length
      },
      documents: {
        verifiedCount: verifiedDocuments.length,
        totalRequired: requiredForms.length,
        allCompleted: allRequiredCompleted
      },
      health: {
        hasHistory: hasHistory,
        isRecent: isRecent,
        updateCount: medicalHistory?.length || 0
      }
    };
  }, [appointments, billingInvoices, totalDue, documents, downloadableForms, medicalHistory]);

  // Calculate and award engagement trophies on mount and when data changes
  React.useEffect(() => {
    if (calculateEngagementTrophies && engagementData) {
      calculateEngagementTrophies(
        engagementData.appointments, 
        engagementData.billing,
        engagementData.documents,
        engagementData.health
      );
    }
  }, [calculateEngagementTrophies, engagementData]);


  return (
    <div className={styles.pageWrapper}>
      <h1>{getTimeBasedGreeting()}, {patient.preferredName}! 👋</h1>
      <p className={styles.pageDescription}>Let's keep your smile healthy together.</p>
      
      {activeAlerts.length > 0 && (
        <AlertCard alert={activeAlerts[0]} />
      )}

      {/* Trophy/Education Progress Widget */}
      <TrophyWidget engagementData={engagementData} />

      {/* NEW: Personalized Health Journey Section */}
      <HealthJourney
        nextAppointment={nextAppointment}
        actionableForm={actionableForm}
        pendingPlan={pendingPlan}
        totalDue={totalDue}
        unreadThread={unreadThread}
        lastHistoryUpdate={lastHistoryUpdate}
        getProviderById={getProviderById}
        recentVisitSummary={recentVisitSummary}
      />

      <h2 className={styles.sectionTitle}>Your Care Overview</h2>

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
          title="Your Account"
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
          title="Your Care Plan"
          icon={<IconTreatmentPlan />}
          onClick={() => navigate('/plans')}
        >
          <TreatmentPlanContent plan={pendingPlan} />
        </WidgetCard>

        {/* Medical History */}
        <WidgetCard
          title="Health History"
          icon={<IconMedicalHistory />}
          onClick={() => navigate('/history')}
        >
          <MedicalHistoryContent lastUpdate={lastHistoryUpdate} />
        </WidgetCard>

        {/* --- NEW: Documents Widget --- */}
        <WidgetCard
          title="Your Documents" 
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

// --- Trophy Widget Component ---
const TrophyWidget = ({ engagementData }) => {
  const { getEducationStats, trophies } = useEngagementData();
  const navigate = useNavigate();
  const stats = getEducationStats();

  if (!stats) return null;

  const hasProgress = stats.totalViewed > 0 || stats.trophiesEarned > 0;

  // Map categories to their corresponding pages
  const getCategoryRoute = (key) => {
    switch(key) {
      case 'basics':
      case 'procedures':
      case 'prevention':
      case 'aftercare':
        return '/education';
      case 'engagement':
        return '/appointments';
      case 'documents':
        return '/documents';
      case 'health':
        return '/history';
      default:
        return '/education';
    }
  };

  const categoryData = [
    { key: 'basics', label: 'Basics', icon: '🪥', count: stats.categories.basics.length, route: '/education' },
    { key: 'procedures', label: 'Procedures', icon: '👑', count: stats.categories.procedures.length, route: '/education' },
    { key: 'prevention', label: 'Prevention', icon: '🛡️', count: stats.categories.prevention.length, route: '/education' },
    { key: 'aftercare', label: 'Aftercare', icon: '📋', count: stats.categories.aftercare.length, route: '/education' },
    { key: 'engagement', label: 'Engagement', icon: '⭐', count: stats.categories.engagement.length, route: '/appointments' },
    { key: 'documents', label: 'Documents', icon: '📄', count: stats.categories.documents.length, route: '/documents' },
    { key: 'health', label: 'Health', icon: '🏥', count: stats.categories.health.length, route: '/history' },
  ].filter(cat => cat.count > 0);

  // Calculate progress toward engagement trophies
  const engagementProgress = engagementData ? [
    {
      name: 'Appointment Star',
      icon: '⭐',
      current: engagementData.appointments.completedCount,
      target: 3,
      unlocked: trophies.some(t => t.name === 'Appointment Star'),
      route: '/appointments'
    },
    {
      name: 'Financial Fitness',
      icon: '💵',
      current: engagementData.billing.totalDue === 0 ? 1 : 0,
      target: 1,
      unlocked: trophies.some(t => t.name === 'Financial Fitness'),
      description: engagementData.billing.totalDue === 0 ? 'All bills paid!' : `$${engagementData.billing.totalDue.toFixed(2)} remaining`,
      route: '/billing'
    },
    {
      name: 'Document Pro',
      icon: '📄',
      current: engagementData.documents.verifiedCount,
      target: 1,
      unlocked: trophies.some(t => t.name === 'Document Pro'),
      description: engagementData.documents.verifiedCount > 0 ? `${engagementData.documents.verifiedCount} verified` : 'Upload first document',
      route: '/documents'
    },
    {
      name: 'Paperwork Champion',
      icon: '📋',
      current: engagementData.documents.allCompleted ? 1 : 0,
      target: 1,
      unlocked: trophies.some(t => t.name === 'Paperwork Champion'),
      description: engagementData.documents.allCompleted ? 'All forms complete!' : `${engagementData.documents.totalRequired} required forms`,
      route: '/documents'
    },
    {
      name: 'Health Historian',
      icon: '📝',
      current: engagementData.health.hasHistory ? 1 : 0,
      target: 1,
      unlocked: trophies.some(t => t.name === 'Health Historian'),
      description: engagementData.health.hasHistory ? 'History submitted' : 'Submit medical history',
      route: '/history'
    },
    {
      name: 'Medical Record Keeper',
      icon: '🏥',
      current: engagementData.health.isRecent ? 1 : 0,
      target: 1,
      unlocked: trophies.some(t => t.name === 'Medical Record Keeper'),
      description: engagementData.health.isRecent ? 'Up to date!' : 'Update within 6 months',
      route: '/history'
    }
  ].filter(p => !p.unlocked && (p.current > 0 || p.target === 1)) : [];

  return (
    <div className={styles.trophyWidget}>
      <div className={styles.trophyWidgetHeader} onClick={() => navigate('/education')} style={{ cursor: 'pointer' }}>
        <div className={styles.trophyWidgetLeft}>
          <span className={styles.trophyWidgetIcon}>🏆</span>
          <div className={styles.trophyWidgetText}>
            <h3>{hasProgress ? 'Your Achievements' : 'Start Your Health Journey'}</h3>
            <p>
              {hasProgress ? (
                <>
                  <strong>{stats.trophiesEarned}</strong> {stats.trophiesEarned === 1 ? 'badge' : 'badges'} earned across all activities
                </>
              ) : (
                'Complete appointments, stay up to date, and earn badges'
              )}
            </p>
          </div>
        </div>
        <span className={styles.trophyWidgetArrow}>→</span>
      </div>

      {/* Milestone Progress */}
      {stats.nextMilestone && (
        <div className={styles.milestoneSection}>
          <div className={styles.milestoneHeader}>
            <span className={styles.milestoneIcon}>{stats.nextMilestone.icon}</span>
            <div className={styles.milestoneText}>
              <span className={styles.milestoneLabel}>{hasProgress ? 'Next Milestone' : 'First Milestone'}</span>
              <span className={styles.milestoneName}>{stats.nextMilestone.name}</span>
            </div>
            <span className={styles.milestoneCount}>{stats.totalViewed}/{stats.nextMilestone.target}</span>
          </div>
          <div className={styles.milestoneProgress}>
            <div className={styles.milestoneProgressBar} style={{ width: `${stats.progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Trophy Categories */}
      {categoryData.length > 0 && (
        <div className={styles.categoriesSection}>
          <span className={styles.categoriesLabel}>Trophy Collections:</span>
          <div className={styles.categoryGrid}>
            {categoryData.map((cat) => (
              <div 
                key={cat.key} 
                className={styles.categoryCard}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(cat.route);
                }}
                style={{ cursor: 'pointer' }}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryLabel}>{cat.label}</span>
                <span className={styles.categoryCount}>{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Trophy Progress */}
      {engagementProgress.length > 0 && (
        <div className={styles.engagementProgress}>
          <span className={styles.categoriesLabel}>Unlock More Badges:</span>
          <div className={styles.progressList}>
            {engagementProgress.map((prog, idx) => (
              <div 
                key={idx} 
                className={styles.progressItem}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(prog.route);
                }}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.progressItemHeader}>
                  <span className={styles.progressIcon}>{prog.icon}</span>
                  <div className={styles.progressInfo}>
                    <span className={styles.progressName}>{prog.name}</span>
                    {prog.description && (
                      <span className={styles.progressDesc}>{prog.description}</span>
                    )}
                  </div>
                  <span className={styles.progressCount}>
                    {prog.current}/{prog.target}
                  </span>
                </div>
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: `${Math.min((prog.current / prog.target) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {stats.recentTrophies?.length > 0 && (
        <div className={styles.trophyWidgetBadges}>
          <span className={styles.badgesLabel}>Recent Achievements:</span>
          {stats.recentTrophies.map((trophy, idx) => (
            <div key={idx} className={styles.trophyWidgetBadge}>
              <span className={styles.badgeIcon}>{trophy.icon}</span>
              <span className={styles.badgeName}>{trophy.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;