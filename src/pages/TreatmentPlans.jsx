import React, { useMemo } from 'react';
import { useClinicalData, useCoreData } from '../contexts';
import { IconTreatmentPlan } from '../layouts/components/Icons';
import { formatCurrency } from '../utils/formatting'; // <-- 1. IMPORT THE FORMATTER
import styles from './TreatmentPlans.module.css';

const TreatmentPlans = () => {
  const { 
    treatmentPlans, 
    acceptTreatmentPlan, 
    rejectTreatmentPlan, 
    loading, 
    error 
  } = useClinicalData();

  const { getProcedureById } = useCoreData();

  // Separate plans by status
  const { proposed, accepted, other } = useMemo(() => {
    const categories = { proposed: [], accepted: [], other: [] };
    treatmentPlans.forEach(plan => {
      if (plan.status === 'Proposed') {
        categories.proposed.push(plan);
      } else if (plan.status === 'Accepted') {
        categories.accepted.push(plan);
      } else {
        categories.other.push(plan); // e.g., Rejected, Deprecated
      }
    });
    return categories;
  }, [treatmentPlans]);

  // --- Handlers (No changes needed, but added Modal placeholders) ---

  const handleAccept = async (planId) => {
    // This should be converted to a <Modal> component for better UX
    if (window.confirm("Are you sure you want to accept this treatment plan?")) {
      await acceptTreatmentPlan(planId);
    }
  };

  const handleReject = async (planId) => {
    // This should also be converted to a <Modal> component
    const reason = window.prompt("Please provide a reason for declining this plan (optional):");
    if (reason !== null) { 
      await rejectTreatmentPlan(planId, reason || "No reason provided");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <h1>Treatment Plans</h1>
      <p className={styles.pageDescription}>
        Review, accept, or decline treatment plans proposed by your provider.
      </p>

      {error && <p className="error-text">Error: {error}</p>}
      {loading && treatmentPlans.length === 0 && <p>Loading treatment plans...</p>}

      {/* --- Section: Proposed Plans (Action Required) --- */}
      <section className={styles.section}>
        <h2>Action Required</h2>
        {proposed.length > 0 ? (
          <div className={styles.planList}>
            {proposed.map(plan => (
              <TreatmentPlanCard
                key={plan.id}
                plan={plan}
                getProcedureById={getProcedureById}
                onAccept={handleAccept}
                onReject={handleReject}
                isLoading={loading}
              />
            ))}
          </div>
        ) : (
          !loading && <p>You have no pending treatment plans to review.</p>
        )}
      </section>

      {/* --- Section: Other Plans (History) --- */}
      <section className={styles.section}>
        <h2>Plan History</h2>
        {[...accepted, ...other].length > 0 ? (
          <div className={styles.planList}>
            {accepted.map(plan => (
              <TreatmentPlanCard
                key={plan.id}
                plan={plan}
                getProcedureById={getProcedureById}
              />
            ))}
            {other.map(plan => (
              <TreatmentPlanCard
                key={plan.id}
                plan={plan}
                getProcedureById={getProcedureById}
              />
            ))}
          </div>
        ) : (
          !loading && <p>You have no accepted or rejected treatment plans.</p>
        )}
      </section>
    </div>
  );
};

// --- Helper Card Component ---
const TreatmentPlanCard = ({ plan, getProcedureById, onAccept, onReject, isLoading }) => {
  // --- 2. This variable is now an object, which is fine ---
  const totalPatientPortion = plan.financialSummary.totalEstimatedPatientPortion;
  
  return (
    <div className={`card ${styles.planCard} ${styles[plan.status.toLowerCase()]}`}>
      {/* --- Card Header --- */}
      <div className={styles.cardHeader}>
        <div className={styles.headerInfo}>
          <IconTreatmentPlan />
          <h3>{plan.planName}</h3>
        </div>
        <span className={`${styles.status} ${styles[plan.status.toLowerCase()]}`}>
          {plan.status}
        </span>
      </div>

      {/* --- Procedure List --- */}
      <div className={styles.procedureList}>
        {plan.plannedProcedures.map(proc => {
          const procedureDetails = getProcedureById(proc.procedureId);
          return (
            <div className={styles.procedureItem} key={proc.id}>
              <div className={styles.procInfo}>
                <strong>{procedureDetails?.patientFriendlyName || proc.description}</strong>
                <span>Tooth: {proc.clinicalInfo.tooth}</span>
              </div>
              <div className={styles.procCost}>
                {/* --- 3. USE FORMATTER --- */}
                <strong>Est. Patient Cost: {formatCurrency(proc.financialEstimate.estimatedPatientPortion)}</strong>
                <span>Total: {formatCurrency(proc.financialEstimate.chargeAmount)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- Financial Summary --- */}
      <div className={styles.financialSummary}>
        <div>
          <span>Total Est. Patient Portion:</span>
          {/* --- 4. USE FORMATTER --- */}
          <strong>{formatCurrency(totalPatientPortion)}</strong>
        </div>
        <div>
          <span>Total Est. Insurance:</span>
          {/* --- 5. USE FORMATTER --- */}
          <span>{formatCurrency(plan.financialSummary.totalEstimatedInsurancePaid)}</span>
        </div>
      </div>

      {/* --- Action Buttons (Only for Proposed plans) --- */}
      {plan.status === 'Proposed' && (
        <div className={styles.cardActions}>
          <button 
            className="secondary danger" 
            onClick={() => onReject(plan.id)}
            disabled={isLoading}
          >
            Decline
          </button>
          <button 
            onClick={() => onAccept(plan.id)}
            disabled={isLoading}
          >
            Accept Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlans;