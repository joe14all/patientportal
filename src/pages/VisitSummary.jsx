import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useClinicalData, useCoreData } from '../contexts';
import { IconArrowLeft } from '../layouts/components/Icons'; 
import styles from './VisitSummary.module.css';

const VisitSummary = () => {
  const { visitSummaryId } = useParams();
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
    return <p>Loading visit summary...</p>;
  }

  if (!summary) {
    return (
      <div>
        <p>Visit summary not found.</p>
        <Link to="/appointments">Back to Appointments</Link>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      {/* --- Page Header --- */}
      <div className={styles.pageHeader}>
        <Link to="/appointments" className={styles.backButton}>
          <IconArrowLeft /> Back to Appointments
        </Link>
        <h1>Visit Summary</h1>
        <p className={styles.pageDescription}>
          A summary of your visit on {new Date(summary.visitDate).toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* --- Main Layout Grid --- */}
      <div className={styles.summaryLayout}>

        {/* --- Column 1: Notes --- */}
        <div className={styles.column}>
          <div className="card">
            <h2>Visit Details</h2>
            <ul className={styles.infoList}>
              <li className={styles.infoItem}>
                <span>Date</span>
                <strong>{new Date(summary.visitDate).toLocaleDateString(undefined, { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </li>
              <li className={styles.infoItem}>
                <span>Provider</span>
                <strong>{provider?.preferredName || 'N/A'}</strong>
              </li>
              <li className={styles.infoItem}>
                <span>Status</span>
                <strong>{summary.status}</strong>
              </li>
            </ul>
          </div>
          <div className="card">
            <h2>Provider's Summary Notes</h2>
            <p>{summary.summaryNotes}</p>
          </div>
          <div className="card">
            <h2>Post-Visit Instructions</h2>
            <p>{summary.postVisitInstructions}</p>
          </div>
        </div>

        {/* --- Column 2: Details --- */}
        <div className={styles.column}>
          <div className="card">
            <h2>Completed Procedures</h2>
            <ul className={styles.itemList}>
              {summary.completedProcedures.map((proc, index) => (
                <li className={styles.item} key={index}>
                  <strong>{proc.description}</strong>
                  {proc.tooth && <span>Tooth: {proc.tooth}</span>}
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2>Clinical Observations</h2>
            <ul className={styles.itemList}>
              {summary.clinicalObservations.map((obs, index) => (
                <li className={styles.item} key={index}>
                  <strong>{obs.category} ({obs.type})</strong>
                  <span>{obs.text} {obs.tooth && `(Tooth: ${obs.tooth})`}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={`card ${styles.nextStepsCard}`}>
            <h2>Next Steps</h2>
            <p>{summary.nextSteps.nextVisitReason}</p>
            {summary.nextSteps.nextVisitRecommendedDate && (
              <span>
                Recommended Date: {new Date(summary.nextSteps.nextVisitRecommendedDate).toLocaleDateString(undefined, { timeZone: 'UTC', month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitSummary;