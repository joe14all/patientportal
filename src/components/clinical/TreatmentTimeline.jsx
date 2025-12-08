import React, { useMemo, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinicalData, useCoreData } from '../../contexts';
import { getFriendlyDate } from '../../utils/patientExperience';
import styles from './TreatmentTimeline.module.css';

/**
 * Treatment Timeline Component
 * Visual journey of patient's dental history with milestones and progress tracking
 */
const TreatmentTimeline = () => {
  const navigate = useNavigate();
  const { appointments, treatmentPlans } = useClinicalData();
  const { getProviderById } = useCoreData(); 
  // const { getProcedureById } = useCoreData(); // Available for future procedure detail enhancement
  const [filter, setFilter] = useState('all'); // all, past, upcoming, treatments

  // Helper function for appointment icons (must be defined before useMemo)
  const getAppointmentIcon = (type) => {
    const t = type.toLowerCase();
    if (t.includes('cleaning')) return '✨';
    if (t.includes('exam')) return '🔍';
    if (t.includes('consultation')) return '💬';
    if (t.includes('surgery')) return '🏥';
    if (t.includes('filling')) return '🦷';
    if (t.includes('crown')) return '👑';
    return '📅';
  };

  const timelineEvents = useMemo(() => {
    const events = [];

    // Add appointments as events
    appointments.forEach(appt => {
      const provider = getProviderById(appt.providerId);
      events.push({
        id: appt.id,
        type: 'appointment',
        date: new Date(appt.startDateTime),
        title: appt.appointmentType,
        subtitle: appt.reasonForVisit,
        status: appt.status,
        provider: provider?.preferredName,
        icon: getAppointmentIcon(appt.appointmentType),
        isPast: appt.status === 'Completed',
        details: {
          duration: appt.duration,
          notes: appt.notes,
          linkedRecords: appt.linkedRecords
        }
      });
    });

    // Add treatment plan milestones
    treatmentPlans.forEach(plan => {
      if (plan.status === 'Accepted') {
        plan.plannedProcedures.forEach(proc => {
          // const procedure = getProcedureById(proc.procedureId); // Future use for procedure details
          events.push({
            id: `proc-${proc.id}`,
            type: 'treatment',
            date: proc.linkedAppointmentId 
              ? new Date(appointments.find(a => a.id === proc.linkedAppointmentId)?.startDateTime)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Future placeholder
            title: proc.procedureName,
            subtitle: plan.planName,
            status: proc.status,
            icon: '🦷',
            isPast: proc.status === 'Completed',
            planId: plan.id,
            details: {
              cost: proc.estimatedCost,
              toothNumber: proc.toothNumber
            }
          });
        });
      }
    });

    // Sort by date
    events.sort((a, b) => b.date - a.date);

    // Apply filters
    if (filter === 'past') {
      return events.filter(e => e.isPast);
    } else if (filter === 'upcoming') {
      return events.filter(e => !e.isPast);
    } else if (filter === 'treatments') {
      return events.filter(e => e.type === 'treatment');
    }

    return events;
  }, [appointments, treatmentPlans, getProviderById, filter]);

  const getStatusBadge = (status, isPast) => {
    if (isPast || status === 'Completed') {
      return <span className={`${styles.badge} ${styles.completed}`}>Completed ✓</span>;
    }
    if (status === 'Confirmed') {
      return <span className={`${styles.badge} ${styles.upcoming}`}>Upcoming</span>;
    }
    if (status === 'Proposed') {
      return <span className={`${styles.badge} ${styles.planned}`}>Planned</span>;
    }
    if (status === 'Cancelled') {
      return <span className={`${styles.badge} ${styles.cancelled}`}>Cancelled</span>;
    }
    return <span className={styles.badge}>{status}</span>;
  };

  // Calculate progress statistics
  const stats = useMemo(() => {
    const totalAppts = appointments.length;
    const completedAppts = appointments.filter(a => a.status === 'Completed').length;
    
    const allProcedures = treatmentPlans
      .filter(p => p.status === 'Accepted')
      .flatMap(p => p.plannedProcedures);
    
    const completedProcs = allProcedures.filter(p => p.status === 'Completed').length;
    const totalProcs = allProcedures.length;

    return {
      totalVisits: totalAppts,
      completedVisits: completedAppts,
      treatmentProgress: totalProcs > 0 ? Math.round((completedProcs / totalProcs) * 100) : 100,
      upcomingAppts: appointments.filter(a => 
        new Date(a.startDateTime) > new Date() && a.status === 'Confirmed'
      ).length
    };
  }, [appointments, treatmentPlans]);

  return (
    <div className={styles.timelineContainer}>
      {/* Progress Stats */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📊</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalVisits}</span>
            <span className={styles.statLabel}>Total Visits</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <span className={styles.statIcon}>✓</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.completedVisits}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statIcon}>🎯</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.treatmentProgress}%</span>
            <span className={styles.statLabel}>Treatment Progress</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statIcon}>📅</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.upcomingAppts}</span>
            <span className={styles.statLabel}>Upcoming</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button 
          className={filter === 'all' ? styles.active : ''}
          onClick={() => setFilter('all')}
        >
          All Events
        </button>
        <button 
          className={filter === 'past' ? styles.active : ''}
          onClick={() => setFilter('past')}
        >
          Past
        </button>
        <button 
          className={filter === 'upcoming' ? styles.active : ''}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={filter === 'treatments' ? styles.active : ''}
          onClick={() => setFilter('treatments')}
        >
          Treatments Only
        </button>
      </div>

      {/* Timeline */}
      <div className={styles.timeline}>
        {timelineEvents.length > 0 ? (
          timelineEvents.map((event, index) => {
            const isToday = new Date().toDateString() === event.date.toDateString();
            const showYear = index === 0 || 
              event.date.getFullYear() !== timelineEvents[index - 1]?.date.getFullYear();

            return (
              <React.Fragment key={event.id}>
                {showYear && (
                  <div className={styles.yearMarker}>
                    {event.date.getFullYear()}
                  </div>
                )}
                
                <div className={styles.timelineItem}>
                  <div className={styles.timelinePoint}>
                    <span className={`${styles.dot} ${event.isPast ? styles.dotPast : styles.dotFuture}`}>
                      {event.isPast ? '✓' : '○'}
                    </span>
                    <div className={styles.line}></div>
                  </div>

                  <div className={`${styles.eventCard} ${event.isPast ? styles.past : ''} ${isToday ? styles.today : ''}`}>
                    <div className={styles.eventHeader}>
                      <span className={styles.eventIcon}>{event.icon}</span>
                      <div className={styles.eventTitle}>
                        <h4>{event.title}</h4>
                        <p>{event.subtitle}</p>
                      </div>
                      {getStatusBadge(event.status, event.isPast)}
                    </div>

                    <div className={styles.eventMeta}>
                      <span className={styles.eventDate}>
                        📅 {getFriendlyDate(event.date)}
                        {isToday && <strong> (Today!)</strong>}
                      </span>
                      {event.provider && (
                        <span className={styles.eventProvider}>
                          👤 {event.provider}
                        </span>
                      )}
                    </div>

                    {event.details.linkedRecords?.visitSummaryId && (
                      <button 
                        className={`${styles.viewButton} secondary`}
                        onClick={() => navigate(`/visits/${event.details.linkedRecords.visitSummaryId}`)}
                      >
                        View Visit Summary
                      </button>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        ) : (
          <div className={styles.emptyTimeline}>
            <span className={styles.emptyIcon}>📋</span>
            <p>No events to display</p>
          </div>
        )}
      </div>

      {/* Achievement Section */}
      {stats.treatmentProgress === 100 && stats.completedVisits > 5 && (
        <div className={styles.achievement}>
          <span className={styles.trophy}>🏆</span>
          <div className={styles.achievementContent}>
            <h3>Treatment Milestone Reached!</h3>
            <p>You've completed your entire treatment plan. Your commitment to oral health is inspiring! 🎉</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentTimeline;
