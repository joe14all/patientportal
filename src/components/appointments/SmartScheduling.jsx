import React, { useMemo } from 'react';
import { useClinicalData } from '../../contexts';
import { getFriendlyDate } from '../../utils/patientExperience';
import styles from './SmartScheduling.module.css';

/**
 * Smart Scheduling Component
 * AI-powered appointment recommendations based on patient history and care patterns
 */
const SmartScheduling = ({ onBookAppointment }) => {
  const { appointments, treatmentPlans } = useClinicalData();
  // const { appointmentTypes } = useCoreData(); // Future use for type-specific recommendations

  const recommendations = useMemo(() => {
    const now = new Date();
    const suggestions = [];

    // Find last cleaning appointment
    const cleaningAppts = appointments
      .filter(a => a.appointmentType.toLowerCase().includes('cleaning'))
      .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));
    
    const lastCleaning = cleaningAppts[0];
    
    if (lastCleaning) {
      const monthsSince = (now - new Date(lastCleaning.startDateTime)) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsSince >= 5.5) {
        // Find patient's preferred time from history
        const preferredDay = getPreferredDay(appointments);
        const preferredTime = getPreferredTime(appointments);
        
        suggestions.push({
          id: 'routine-cleaning',
          type: 'Cleaning',
          priority: 'high',
          title: "Time for your routine cleaning!",
          reason: `It's been ${Math.floor(monthsSince)} months since your last cleaning`,
          icon: '✨',
          suggestedDate: getSuggestedDate(preferredDay),
          suggestedTime: preferredTime,
          benefits: [
            'Keep your teeth healthy and bright',
            'Catch any issues early',
            'Maintain your preventive care schedule'
          ],
          urgent: monthsSince >= 7
        });
      }
    }

    // Check for treatment plan follow-ups
    const acceptedPlans = treatmentPlans.filter(p => p.status === 'Accepted');
    acceptedPlans.forEach(plan => {
      const incompleteProcedures = plan.plannedProcedures.filter(
        proc => proc.status === 'Proposed' && !proc.linkedAppointmentId
      );
      
      if (incompleteProcedures.length > 0) {
        const nextProc = incompleteProcedures[0];
        suggestions.push({
          id: `treatment-${plan.id}`,
          type: nextProc.procedureName,
          priority: 'medium',
          title: `Continue your ${plan.planName}`,
          reason: `Next step: ${nextProc.procedureName}`,
          icon: '🦷',
          relatedPlanId: plan.id,
          benefits: [
            'Stay on track with your care plan',
            'Complete treatment on schedule',
            `${incompleteProcedures.length} procedure${incompleteProcedures.length > 1 ? 's' : ''} remaining`
          ]
        });
      }
    });

    // Check for annual exam
    const examAppts = appointments
      .filter(a => a.appointmentType.toLowerCase().includes('exam'))
      .sort((a, b) => new Date(b.startDateTime) - new Date(a.startDateTime));
    
    const lastExam = examAppts[0];
    if (lastExam) {
      const monthsSince = (now - new Date(lastExam.startDateTime)) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsSince >= 11) {
        suggestions.push({
          id: 'annual-exam',
          type: 'Comprehensive Exam',
          priority: 'medium',
          title: "Annual comprehensive exam due",
          reason: `Last exam was ${Math.floor(monthsSince)} months ago`,
          icon: '🔍',
          benefits: [
            'Complete oral health assessment',
            'X-rays to catch hidden issues',
            'Update your treatment plan'
          ]
        });
      }
    }

    // Sort by priority and urgency
    return suggestions.sort((a, b) => {
      if (a.urgent !== b.urgent) return a.urgent ? -1 : 1;
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [appointments, treatmentPlans]);

  // Helper functions
  const getPreferredDay = (appts) => {
    const dayCounts = {};
    appts.forEach(a => {
      const day = new Date(a.startDateTime).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const mostCommon = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
    return mostCommon ? parseInt(mostCommon[0]) : 4; // Default to Thursday
  };

  const getPreferredTime = (appts) => {
    const times = appts.map(a => {
      const date = new Date(a.startDateTime);
      return date.getHours();
    });
    const avgHour = Math.round(times.reduce((sum, h) => sum + h, 0) / times.length);
    return `${avgHour % 12 || 12}:00 ${avgHour >= 12 ? 'PM' : 'AM'}`;
  };

  const getSuggestedDate = (preferredDay) => {
    const today = new Date();
    const daysUntilPreferred = (preferredDay - today.getDay() + 7) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + (daysUntilPreferred || 7));
    return nextDate;
  };

  if (recommendations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>✅</span>
        <h3>You're all caught up!</h3>
        <p>No upcoming appointments recommended at this time.</p>
      </div>
    );
  }

  return (
    <div className={styles.smartScheduling}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.aiIcon}>🤖</span>
          Smart Scheduling Suggestions
        </h3>
        <p className={styles.subtitle}>
          Based on your care history and recommended schedules
        </p>
      </div>

      <div className={styles.recommendations}>
        {recommendations.map((rec) => (
          <div 
            key={rec.id} 
            className={`${styles.recommendation} ${rec.urgent ? styles.urgent : ''}`}
          >
            <div className={styles.recHeader}>
              <span className={styles.recIcon}>{rec.icon}</span>
              <div className={styles.recTitle}>
                <h4>{rec.title}</h4>
                {rec.urgent && (
                  <span className={styles.urgentBadge}>Overdue</span>
                )}
              </div>
            </div>

            <p className={styles.reason}>{rec.reason}</p>

            <ul className={styles.benefits}>
              {rec.benefits.map((benefit, idx) => (
                <li key={idx}>✓ {benefit}</li>
              ))}
            </ul>

            {rec.suggestedDate && rec.suggestedTime && (
              <div className={styles.suggestion}>
                <span className={styles.suggestionLabel}>Suggested:</span>
                <span className={styles.suggestionValue}>
                  {getFriendlyDate(rec.suggestedDate)} at {rec.suggestedTime}
                </span>
                <span className={styles.suggestionNote}>
                  (Based on your usual schedule)
                </span>
              </div>
            )}

            <div className={styles.actions}>
              <button 
                className="primary"
                onClick={() => onBookAppointment(rec)}
              >
                Book Now
              </button>
              <button className="secondary">
                Choose Different Time
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          💡 <strong>Smart scheduling learns from you:</strong> The more you book, 
          the better our suggestions become!
        </p>
      </div>
    </div>
  );
};

export default SmartScheduling;
