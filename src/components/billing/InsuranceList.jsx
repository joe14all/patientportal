import React from 'react';
import { useBillingData } from '../../contexts';
import styles from './InsuranceList.module.css';

/**
 * Renders the "Insurance Policies" card.
 *
 * @param {object} props
 * @param {function} props.onAddClick - Function to call to open the "Add New" modal.
 */
const InsuranceList = ({ onAddClick }) => {
  const { insurancePolicies, loading } = useBillingData();

  const activePolicies = insurancePolicies.filter(p => p.status === 'Active');

  return (
    <section className={`card ${styles.insuranceCard}`}>
      <h2>Insurance Policies</h2>
      
      <ul className={styles.policyList}>
        {activePolicies.length > 0 ? (
          activePolicies.map(policy => (
            <li className={styles.policyItem} key={policy.id}>
              <strong>{policy.carrier.name} ({policy.coveragePriority})</strong>
              <span>Plan: {policy.plan.planName}</span>
              <span>Policy #: {policy.plan.policyNumber}</span>
            </li>
          ))
        ) : (
          !loading && <p className={styles.noItemsText}>No active policies on file.</p>
        )}
        {loading && activePolicies.length === 0 && (
           <p className={styles.noItemsText}>Loading policies...</p>
        )}
      </ul>

      <button
        className={`secondary ${styles.addButton}`}
        onClick={onAddClick}
        disabled={loading}
      >
        + Add Insurance
      </button>
    </section>
  );
};

export default InsuranceList;