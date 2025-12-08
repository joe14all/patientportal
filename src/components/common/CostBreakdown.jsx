import React from 'react';
import { formatCurrency } from '../../utils/formatting';
import Tooltip from '../common/Tooltip';
import styles from './CostBreakdown.module.css';

/**
 * Cost Breakdown Component
 * Provides transparent cost information for procedures and treatments
 */
const CostBreakdown = ({ 
  totalCost, 
  insuranceCoverage = 0, 
  patientResponsibility,
  breakdown = [],
  showInsuranceEstimate = true 
}) => {
  const currency = 'USD';

  return (
    <div className={styles.costCard}>
      <h4 className={styles.title}>Cost Breakdown</h4>
      
      {breakdown.length > 0 && (
        <div className={styles.itemsList}>
          {breakdown.map((item, index) => (
            <div key={index} className={styles.lineItem}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemCost}>
                {formatCurrency({ amount: item.cost, currency })}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.totalsSection}>
        <div className={styles.totalLine}>
          <span className={styles.label}>Total Cost:</span>
          <span className={styles.amount}>
            {formatCurrency({ amount: totalCost, currency })}
          </span>
        </div>

        {showInsuranceEstimate && insuranceCoverage > 0 && (
          <>
            <div className={styles.totalLine}>
              <span className={styles.label}>
                <Tooltip 
                  content="This is an estimate based on your insurance plan. Your actual coverage may vary."
                  title="Insurance Estimate"
                >
                  Estimated Insurance Coverage
                </Tooltip>:
              </span>
              <span className={`${styles.amount} ${styles.positive}`}>
                -{formatCurrency({ amount: insuranceCoverage, currency })}
              </span>
            </div>

            <div className={`${styles.totalLine} ${styles.primary}`}>
              <span className={styles.label}>
                <strong>Your Estimated Cost:</strong>
              </span>
              <span className={`${styles.amount} ${styles.highlight}`}>
                {formatCurrency({ amount: patientResponsibility, currency })}
              </span>
            </div>
          </>
        )}
      </div>

      <div className={styles.disclaimer}>
        <p className={styles.disclaimerText}>
          💡 <strong>Good to know:</strong> This is an estimate. Your final cost may vary based on your insurance 
          verification and any additional services needed. We'll provide a final quote before starting treatment.
        </p>
      </div>

      <div className={styles.paymentOptions}>
        <h5 className={styles.optionsTitle}>Payment Options:</h5>
        <ul className={styles.optionsList}>
          <li>💳 Pay in full on the day of service</li>
          <li>📅 Payment plans available (ask us!)</li>
          <li>🏥 Insurance accepted - we'll bill directly</li>
        </ul>
      </div>
    </div>
  );
};

export default CostBreakdown;
