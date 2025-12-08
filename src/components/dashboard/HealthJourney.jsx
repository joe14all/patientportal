import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './HealthJourney.module.css';

/**
 * Personalized Health Journey Component
 * Shows patients their most important next steps with context and encouragement
 */
const HealthJourney = ({ 
  nextAppointment, 
  actionableForm, 
  pendingPlan, 
  totalDue,
  unreadThread,
  lastHistoryUpdate,
  getProviderById,
  recentVisitSummary
}) => {
  const navigate = useNavigate();

  console.log('HealthJourney render - recentVisitSummary:', recentVisitSummary);

  // Calculate priority actions based on patient's current state
  const priorityActions = useMemo(() => {
    const actions = [];
    const now = new Date();

    // Priority 1: Upcoming appointment within 48 hours
    if (nextAppointment) {
      const apptDate = new Date(nextAppointment.startDateTime);
      const hoursUntil = (apptDate - now) / (1000 * 60 * 60);
      
      if (hoursUntil <= 48 && hoursUntil > 0) {
        const provider = getProviderById(nextAppointment.providerId);
        actions.push({
          id: 'upcoming-appt',
          priority: 1,
          title: `Your appointment with ${provider?.preferredName || 'your provider'} is soon`,
          description: `${apptDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at ${apptDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`,
          action: 'Review Details',
          link: '/appointments',
          icon: '📅',
          whyItMatters: 'Being prepared helps us give you the best care possible.',
          urgent: hoursUntil <= 24
        });
      }
    }

    // Priority 2: Missing or rejected documents
    if (actionableForm) {
      let title = '';
      let description = '';
      if (actionableForm.status === 'Missing') {
        title = `Please complete your ${actionableForm.title}`;
        description = "We need this before your next visit";
      } else if (actionableForm.status === 'Rejected') {
        title = `Your ${actionableForm.title} needs to be resubmitted`;
        description = "There was an issue with your previous upload";
      } else if (actionableForm.status === 'Expired') {
        title = `Time to update your ${actionableForm.title}`;
        description = "This needs to be refreshed annually";
      }
      
      actions.push({
        id: 'actionable-form',
        priority: 2,
        title,
        description,
        action: 'Complete Now',
        link: '/documents',
        icon: '📋',
        whyItMatters: 'Up-to-date forms keep your care safe and smooth.',
        urgent: actionableForm.status === 'Missing'
      });
    }

    // Priority 3: Treatment plan awaiting decision
    if (pendingPlan) {
      actions.push({
        id: 'pending-plan',
        priority: 3,
        title: `Your ${pendingPlan.planName} is ready for review`,
        description: "Dr. has prepared a personalized treatment plan for you",
        action: 'Review Plan',
        link: '/plans',
        icon: '🦷',
        whyItMatters: 'Understanding your treatment helps you make the best decision for your smile.',
        urgent: false
      });
    }

    // Priority 4: Outstanding balance
    if (totalDue > 0) {
      actions.push({
        id: 'outstanding-balance',
        priority: 4,
        title: 'You have an outstanding balance',
        description: `$${totalDue.toFixed(2)} due`,
        action: 'Make Payment',
        link: '/billing',
        icon: '💳',
        whyItMatters: 'Keeping your account current ensures uninterrupted care.',
        urgent: totalDue > 500
      });
    }

    // Priority 5: Unread message from provider
    if (unreadThread) {
      actions.push({
        id: 'unread-message',
        priority: 5,
        title: 'You have an unread message from your care team',
        description: unreadThread.subject,
        action: 'Read Message',
        link: `/messages/${unreadThread.id}`,
        icon: '✉️',
        whyItMatters: 'Your care team may have important updates for you.',
        urgent: false
      });
    }

    // Priority 6: Medical history needs updating (if > 6 months old)
    if (lastHistoryUpdate) {
      const updateDate = new Date(lastHistoryUpdate);
      const monthsSince = (now - updateDate) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsSince > 6) {
        actions.push({
          id: 'update-history',
          priority: 6,
          title: "Let's update your medical history",
          description: `Last reviewed ${Math.floor(monthsSince)} months ago`,
          action: 'Update Now',
          link: '/history',
          icon: '📝',
          whyItMatters: 'Accurate health info helps us provide safer, better care.',
          urgent: monthsSince > 12
        });
      }
    }

    // Sort by priority, urgent items first
    return actions.sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      return a.priority - b.priority;
    }).slice(0, 3); // Show top 3 actions
  }, [nextAppointment, actionableForm, pendingPlan, totalDue, unreadThread, lastHistoryUpdate, getProviderById]);

  // Calculate overall progress
  const progressScore = useMemo(() => {
    let score = 0;
    const maxScore = 100;
    
    // Appointments scheduled: 20 points
    if (nextAppointment) score += 20;
    
    // Documents complete: 25 points
    if (!actionableForm) score += 25;
    
    // No pending decisions: 20 points
    if (!pendingPlan) score += 20;
    
    // Payment up to date: 20 points
    if (totalDue === 0) score += 20;
    
    // Medical history current: 15 points
    if (lastHistoryUpdate) {
      const monthsSince = (new Date() - new Date(lastHistoryUpdate)) / (1000 * 60 * 60 * 24 * 30);
      if (monthsSince <= 6) score += 15;
    }
    
    return { score, maxScore };
  }, [nextAppointment, actionableForm, pendingPlan, totalDue, lastHistoryUpdate]);

  const progressPercentage = Math.round((progressScore.score / progressScore.maxScore) * 100);

  // Show celebration if everything is complete
  if (priorityActions.length === 0 && progressPercentage >= 80) {
    return (
      <div className={`${styles.journeyCard} ${styles.celebration}`}>
        <div className={styles.celebrationContent}>
          <span className={styles.celebrationIcon}>🎉</span>
          <div>
            <h2 className={styles.celebrationTitle}>You're all caught up!</h2>
            <p className={styles.celebrationText}>
              Everything looks great. We'll let you know if there's anything you need to do.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.journeyCard}>
      <div className={styles.journeyHeader}>
        <h2 className={styles.journeyTitle}>Your Health Journey</h2>
        <div className={styles.progressBadge}>
          <span className={styles.progressNumber}>{progressPercentage}%</span>
          <span className={styles.progressLabel}>Complete</span>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {priorityActions.length > 0 && (
        <div className={styles.actionsList}>
          <p className={styles.actionsIntro}>
            Here's what matters most right now:
          </p>
          {priorityActions.map((action) => (
            <div 
              key={action.id} 
              className={`${styles.actionItem} ${action.urgent ? styles.urgent : ''}`}
              onClick={() => navigate(action.link)}
            >
              <div className={styles.actionIcon}>{action.icon}</div>
              <div className={styles.actionContent}>
                <h3 className={styles.actionTitle}>
                  {action.title}
                  {action.urgent && <span className={styles.urgentBadge}>Urgent</span>}
                </h3>
                <p className={styles.actionDescription}>{action.description}</p>
                <p className={styles.actionWhy}>💡 {action.whyItMatters}</p>
              </div>
              <button className={styles.actionButton}>
                {action.action}
              </button>
            </div>
          ))}
        </div>
      )}

      {priorityActions.length === 0 && progressPercentage < 80 && (
        <p className={styles.noActionsText}>
          You're doing great! Check back soon for updates.
        </p>
      )}

      {/* Recent Visit Summary */}
      {recentVisitSummary && (
        <div className={styles.visitSummaryCard} onClick={() => console.log('Card clicked')}>
          <div className={styles.visitSummaryHeader}>
            <div className={styles.visitSummaryTitle}>
              <span className={styles.visitIcon}>📋</span>
              <h3>Latest Visit Summary</h3>
            </div>
            <span className={styles.visitDate}>
              {new Date(recentVisitSummary.visitDate).toLocaleDateString(undefined, { 
                timeZone: 'UTC',
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
          <p className={styles.visitSummaryText}>{recentVisitSummary.summaryNotes}</p>
          {recentVisitSummary.nextSteps && recentVisitSummary.nextSteps.nextVisitReason && (
            <div className={styles.nextStepsPreview}>
              <span className={styles.nextStepsLabel}>Next steps:</span>
              <span className={styles.nextStepsText}>{recentVisitSummary.nextSteps.nextVisitReason}</span>
            </div>
          )}
          <Link 
            to={`/visits/${recentVisitSummary.id}`}
            className={styles.viewSummaryButton}
            onClick={(e) => {
              console.log('Link clicked!', recentVisitSummary.id);
            }}
            style={{ 
              display: 'block',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            View Full Summary →
          </Link>
        </div>
      )}
    </div>
  );
};

export default HealthJourney;
