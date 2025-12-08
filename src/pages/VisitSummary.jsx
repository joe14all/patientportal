import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useClinicalData, useCoreData } from '../contexts';
import { IconArrowLeft } from '../layouts/components/Icons'; 
import styles from './VisitSummary.module.css';

const VisitSummary = () => {
  const { visitSummaryId } = useParams();
  const navigate = useNavigate();
  const { visitSummaries, loading: clinicalLoading } = useClinicalData();
  const { getProviderById, loading: coreLoading } = useCoreData();

  // Find the specific summary and its provider
  const { summary, provider } = useMemo(() => {
    const s = visitSummaries.find(v => v.id === visitSummaryId);
    if (!s) return { summary: null, provider: null };
    
    const p = getProviderById(s.providerId);
    return { summary: s, provider: p };
  }, [visitSummaryId, visitSummaries, getProviderById]);

  if (clinicalLoading || coreLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading visit summary...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={styles.pageWrapper}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📋</span>
          <h2>Visit Summary Not Found</h2>
          <p>We couldn't find the visit summary you're looking for.</p>
          <Link to="/appointments" className={styles.returnButton}>Back to Appointments</Link>
        </div>
      </div>
    );
  }

  const visitDate = new Date(summary.visitDate);
  const formattedDate = visitDate.toLocaleDateString(undefined, { 
    timeZone: 'UTC', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className={styles.pageWrapper}>
      {/* Print-Only Header */}
      <div className={styles.printHeader}>
        <div className={styles.clinicInfo}>
          <h1>JS Dental Clinic</h1>
          <p>123 Dental Street, Suite 100</p>
          <p>San Francisco, CA 94102</p>
          <p>Phone: (555) 123-4567 | Fax: (555) 123-4568</p>
        </div>
        <div className={styles.documentInfo}>
          <h2>Visit Summary</h2>
          <p><strong>Date:</strong> {formattedDate}</p>
          <p><strong>Provider:</strong> {provider?.preferredName || 'N/A'}</p>
          <p><strong>Status:</strong> {summary.status}</p>
        </div>
      </div>

      {/* --- Page Header --- */}
      <div className={styles.pageHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <IconArrowLeft /> <span>Back</span>
        </button>
        <div className={styles.headerContent}>
          <div className={styles.statusBadge}>
            <span className={`${styles.statusDot} ${styles[summary.status.toLowerCase()]}`}></span>
            {summary.status}
          </div>
          <h1>Visit Summary</h1>
          <p className={styles.visitMeta}>
            <span className={styles.dateText}>{formattedDate}</span>
            <span className={styles.separator}>•</span>
            <span className={styles.providerText}>{provider?.preferredName || 'Provider'}</span>
          </p>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className={styles.summaryGrid}>
        
        {/* Left Column - Primary Information */}
        <div className={styles.primaryColumn}>
          
          {/* Provider Summary */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>👨‍⚕️</span>
              <h2>Provider's Summary</h2>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.summaryText}>{summary.summaryNotes}</p>
            </div>
          </div>

          {/* Post-Visit Instructions */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📝</span>
              <h2>Post-Visit Instructions</h2>
            </div>
            <div className={styles.cardContent}>
              <p className={styles.instructionsText}>{summary.postVisitInstructions}</p>
            </div>
          </div>

          {/* Completed Procedures */}
          {summary.completedProcedures && summary.completedProcedures.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>✅</span>
                <h2>Completed Procedures</h2>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.procedureList}>
                  {summary.completedProcedures.map((proc, index) => (
                    <li key={index} className={styles.procedureItem}>
                      <div className={styles.procedureMain}>
                        <span className={styles.procedureName}>{proc.description}</span>
                        {proc.tooth && <span className={styles.toothBadge}>Tooth {proc.tooth}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Secondary Information */}
        <div className={styles.secondaryColumn}>
          
          {/* Visit Details Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📅</span>
              <h2>Visit Details</h2>
            </div>
            <div className={styles.cardContent}>
              <dl className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <dt>Date</dt>
                  <dd>{formattedDate}</dd>
                </div>
                <div className={styles.detailItem}>
                  <dt>Provider</dt>
                  <dd>{provider?.preferredName || 'N/A'}</dd>
                </div>
                <div className={styles.detailItem}>
                  <dt>Status</dt>
                  <dd>
                    <span className={`${styles.statusLabel} ${styles[summary.status.toLowerCase()]}`}>
                      {summary.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Clinical Observations */}
          {summary.clinicalObservations && summary.clinicalObservations.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🔍</span>
                <h2>Clinical Observations</h2>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.observationList}>
                  {summary.clinicalObservations.map((obs, index) => (
                    <li key={index} className={styles.observationItem}>
                      <div className={styles.obsHeader}>
                        <span className={styles.obsCategory}>{obs.category}</span>
                        <span className={`${styles.obsType} ${styles[obs.type.toLowerCase()]}`}>
                          {obs.type}
                        </span>
                      </div>
                      <p className={styles.obsText}>
                        {obs.text}
                        {obs.tooth && <span className={styles.toothNote}> (Tooth {obs.tooth})</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Prescribed Medications */}
          {summary.prescribedMedications && summary.prescribedMedications.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>💊</span>
                <h2>Prescribed Medications</h2>
              </div>
              <div className={styles.cardContent}>
                <ul className={styles.medicationList}>
                  {summary.prescribedMedications.map((med, index) => (
                    <li key={index} className={styles.medicationItem}>
                      <div className={styles.medName}>{med.name}</div>
                      <div className={styles.medDetails}>
                        <span>{med.dosage}</span>
                        <span className={styles.separator}>•</span>
                        <span>{med.frequency}</span>
                      </div>
                      {med.instructions && (
                        <div className={styles.medInstructions}>{med.instructions}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Next Steps */}
          {summary.nextSteps && summary.nextSteps.nextVisitReason && (
            <div className={`${styles.card} ${styles.highlightCard}`}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🎯</span>
                <h2>Next Steps</h2>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.nextStepItem}>
                  <div className={styles.stepText}>
                    <strong>{summary.nextSteps.nextVisitReason}</strong>
                  </div>
                  {summary.nextSteps.nextVisitRecommendedDate && (
                    <div className={styles.recommendedDate}>
                      Recommended: {new Date(summary.nextSteps.nextVisitRecommendedDate).toLocaleDateString(undefined, { 
                        timeZone: 'UTC',
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className={styles.actionBar}>
        <button className={styles.printButton} onClick={() => window.print()}>
          🖨️ Print Summary
        </button>
        <button className={styles.primaryButton} onClick={() => navigate(-1)}>
          Return
        </button>
      </div>
    </div>
  );
};

export default VisitSummary;