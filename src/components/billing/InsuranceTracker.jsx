import { useState, useMemo } from 'react';
import { useClinicalData, useBillingData } from '../../contexts';
import styles from './InsuranceTracker.module.css';

/**
 * Insurance Tracker Component
 * 
 * Provides patients with a clear understanding of their insurance benefits,
 * coverage status, and claims tracking - demystifying the complexity of insurance.
 * 
 * Features:
 * - Coverage status visualization with annual limits
 * - Deductible and out-of-pocket tracking with progress bars
 * - Benefits breakdown by category
 * - Recent claims history with status tracking
 * - Pre-authorization alerts
 * - Network provider information
 */
const InsuranceTracker = () => {
  const { appointments } = useClinicalData();
  const { insurancePolicies, insuranceClaims, billingInvoices } = useBillingData();

  const [selectedPlan, setSelectedPlan] = useState(0);

  // Get primary insurance (or selected)
  const currentInsurance = insurancePolicies?.[selectedPlan] || insurancePolicies?.[0];

  // Calculate insurance metrics
  const metrics = useMemo(() => {
    if (!currentInsurance) return null;

    // Calculate totals from actual claims for this policy
    const yearToDate = new Date().getFullYear();
    const policyClaims = insuranceClaims?.filter(claim => 
      claim.insurancePolicyId === currentInsurance.id &&
      new Date(claim.submissionDate).getFullYear() === yearToDate
    ) || [];

    const totalClaimed = policyClaims.reduce((sum, claim) => 
      sum + (claim.totalPaid?.amount || 0), 0
    );

    const totalPatientResponsibility = policyClaims.reduce((sum, claim) => 
      sum + (claim.patientResponsibility?.amount || 0), 0
    );

    // Use insurance plan data from coverageDetails
    const individualDeductible = currentInsurance.coverageDetails?.deductibles?.find(
      d => d.type === 'Individual' && d.network === 'InNetwork'
    );
    const deductible = individualDeductible?.amount || 50;
    const deductibleMet = individualDeductible?.met !== undefined ? individualDeductible.met : Math.min(totalPatientResponsibility, deductible);
    const deductibleRemaining = Math.max(0, deductible - deductibleMet);

    // Dental insurance typically doesn't have out-of-pocket max, but we'll show patient responsibility
    const outOfPocketMax = 5000; // Placeholder
    const outOfPocketMet = totalPatientResponsibility;
    const outOfPocketRemaining = Math.max(0, outOfPocketMax - outOfPocketMet);

    const individualAnnualMax = currentInsurance.coverageDetails?.annualMaximums?.find(
      m => m.type === 'Individual' && m.network === 'InNetwork'
    );
    const annualMax = individualAnnualMax?.amount || 1500;
    const annualUsed = individualAnnualMax?.used !== undefined ? individualAnnualMax.used : totalClaimed;
    const annualRemaining = Math.max(0, annualMax - annualUsed);

    return {
      deductible,
      deductibleMet,
      deductibleRemaining,
      deductibleProgress: deductible > 0 ? (deductibleMet / deductible) * 100 : 0,
      outOfPocketMax,
      outOfPocketMet,
      outOfPocketRemaining,
      outOfPocketProgress: outOfPocketMax > 0 ? (outOfPocketMet / outOfPocketMax) * 100 : 0,
      annualMax,
      annualUsed,
      annualRemaining,
      annualProgress: annualMax > 0 ? (annualUsed / annualMax) * 100 : 0,
      totalClaimed,
      claimsCount: policyClaims.length,
    };
  }, [currentInsurance, insuranceClaims]);

  // Benefits data from actual insurance policy
  const benefits = useMemo(() => {
    if (!currentInsurance?.coverageDetails?.coverageByFinancialCategory) {
      return [
        { category: '🦷 Preventive Care', coverage: '100%', details: 'Cleanings, exams, X-rays (2x/year)' },
        { category: '🔧 Basic Procedures', coverage: '80%', details: 'Fillings, extractions' },
        { category: '👑 Major Procedures', coverage: '50%', details: 'Crowns, bridges, dentures' },
        { category: '😁 Orthodontics', coverage: '50%', details: 'Up to $2,000 lifetime max' },
        { category: '🚨 Emergency Care', coverage: '80%', details: 'Pain relief, urgent treatment' },
      ];
    }

    const categoryIcons = {
      'Preventive': '🦷',
      'Basic': '🔧',
      'Major': '👑',
      'Orthodontic': '😁',
      'Emergency': '🚨'
    };

    return currentInsurance.coverageDetails.coverageByFinancialCategory.map(coverage => {
      const icon = categoryIcons[coverage.category] || '🏥';
      const details = [];
      
      if (coverage.deductibleApplies) {
        details.push('Deductible applies');
      }
      if (coverage.coPay > 0) {
        details.push(`$${coverage.coPay} copay`);
      }
      if (coverage.lifetimeMax) {
        details.push(`$${coverage.lifetimeMax.toLocaleString()} lifetime max`);
      }
      
      return {
        category: `${icon} ${coverage.category}`,
        coverage: `${coverage.coInsurancePercent}%`,
        details: details.length > 0 ? details.join(', ') : 'No additional restrictions'
      };
    });
  }, [currentInsurance]);

  // Recent claims from actual insurance claims data
  const recentClaims = useMemo(() => {
    if (!insuranceClaims || !currentInsurance) return [];
    
    return insuranceClaims
      .filter(claim => claim.insurancePolicyId === currentInsurance.id)
      .sort((a, b) => new Date(b.submissionDate) - new Date(a.submissionDate))
      .slice(0, 5)
      .map(claim => {
        const statusMap = {
          'Submitted': 'processing',
          'InReview': 'processing',
          'Adjudicated': 'approved',
          'Paid': 'paid',
          'Denied': 'denied',
          'Pending': 'processing'
        };

        // Get procedure descriptions from line items
        const procedures = claim.lineItems?.map(item => {
          const procMap = {
            'D1110': 'Routine Cleaning',
            'D0120': 'Periodic Exam',
            'D0274': 'Bitewing X-rays',
            'D2391': 'Composite Filling'
          };
          return procMap[item.procedureId] || item.procedureId;
        }).join(', ') || 'Dental Service';

        return {
          id: claim.carrierClaimId || claim.id,
          date: claim.submissionDate,
          service: procedures,
          submitted: claim.submissionDate,
          status: statusMap[claim.status] || 'processing',
          billed: claim.totalCharge?.amount || 0,
          covered: claim.totalPaid?.amount || 0,
          adjudicatedDate: claim.adjudicationDate
        };
      });
  }, [insuranceClaims, currentInsurance]);

  if (!currentInsurance) {
    return (
      <div className={styles.noInsurance}>
        <div className={styles.emptyIcon}>🏥</div>
        <h3>No Insurance on File</h3>
        <p>Add your insurance information to track benefits and coverage.</p>
        <button className="btn-primary">Add Insurance</button>
      </div>
    );
  }

  return (
    <div className={styles.insuranceTracker}>
      {/* Header with Plan Selector */}
      <div className={styles.header}>
        <div>
          <h2>Insurance Benefits & Coverage</h2>
          <p className={styles.subtitle}>
            Track your benefits, deductibles, and claims in one place
          </p>
        </div>

        {insurancePolicies && insurancePolicies.length > 1 && (
          <div className={styles.planSelector}>
            <label>Select Plan:</label>
            <select 
              value={selectedPlan} 
              onChange={(e) => setSelectedPlan(Number(e.target.value))}
            >
              {insurancePolicies.map((ins, idx) => (
                <option key={idx} value={idx}>
                  {ins.carrier?.name || 'Insurance Plan'} - {ins.coveragePriority || 'Primary'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Current Plan Card */}
      <div className={styles.planCard}>
        <div className={styles.planHeader}>
          <div>
            <div className={styles.planName}>{currentInsurance.carrier?.name || 'Insurance Plan'}</div>
            <div className={styles.planType}>{currentInsurance.plan?.planType || 'Dental Insurance'}</div>
          </div>
          <div className={styles.planBadge}>
            {currentInsurance.coveragePriority || 'Primary'}
          </div>
        </div>
        <div className={styles.planDetails}>
          <div className={styles.planDetail}>
            <span className={styles.label}>Member ID:</span>
            <span className={styles.value}>{currentInsurance.subscriber?.subscriberId || currentInsurance.plan?.policyNumber || 'N/A'}</span>
          </div>
          <div className={styles.planDetail}>
            <span className={styles.label}>Group #:</span>
            <span className={styles.value}>{currentInsurance.plan?.groupNumber || 'N/A'}</span>
          </div>
          <div className={styles.planDetail}>
            <span className={styles.label}>Effective:</span>
            <span className={styles.value}>
              {currentInsurance.coverageDetails?.effectiveDate 
                ? new Date(currentInsurance.coverageDetails.effectiveDate).toLocaleDateString() 
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Coverage Progress Metrics */}
      {metrics && (
        <div className={styles.metricsGrid}>
          {/* Deductible */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>💰</span>
              <h3>Annual Deductible</h3>
            </div>
            <div className={styles.metricValue}>
              ${metrics.deductibleMet.toFixed(2)} / ${metrics.deductible.toFixed(2)}
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${metrics.deductibleProgress}%` }}
              />
            </div>
            <div className={styles.metricDetail}>
              {metrics.deductibleRemaining > 0 ? (
                <span className={styles.remaining}>
                  ${metrics.deductibleRemaining.toFixed(2)} remaining
                </span>
              ) : (
                <span className={styles.met}>✓ Deductible met!</span>
              )}
            </div>
          </div>

          {/* Out of Pocket Maximum */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>🛡️</span>
              <h3>Out-of-Pocket Max</h3>
            </div>
            <div className={styles.metricValue}>
              ${metrics.outOfPocketMet.toFixed(2)} / ${metrics.outOfPocketMax.toFixed(2)}
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${metrics.outOfPocketProgress}%` }}
              />
            </div>
            <div className={styles.metricDetail}>
              {metrics.outOfPocketRemaining > 0 ? (
                <span className={styles.remaining}>
                  ${metrics.outOfPocketRemaining.toFixed(2)} until 100% coverage
                </span>
              ) : (
                <span className={styles.met}>✓ Max reached - 100% coverage!</span>
              )}
            </div>
          </div>

          {/* Annual Maximum */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span className={styles.metricIcon}>📊</span>
              <h3>Annual Maximum</h3>
            </div>
            <div className={styles.metricValue}>
              ${metrics.annualUsed.toFixed(2)} / ${metrics.annualMax.toFixed(2)}
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${metrics.annualProgress}%` }}
              />
            </div>
            <div className={styles.metricDetail}>
              <span className={styles.remaining}>
                ${metrics.annualRemaining.toFixed(2)} available
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Breakdown */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🎁</span>
          Your Benefits Coverage
        </h3>
        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, idx) => (
            <div key={idx} className={styles.benefitCard}>
              <div className={styles.benefitHeader}>
                <span className={styles.benefitCategory}>{benefit.category}</span>
                <span className={styles.benefitCoverage}>{benefit.coverage}</span>
              </div>
              <div className={styles.benefitDetails}>{benefit.details}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Claims */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📋</span>
          Recent Claims
        </h3>
        {recentClaims.length > 0 ? (
          <div className={styles.claimsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.col}>Claim ID</div>
              <div className={styles.col}>Service</div>
              <div className={styles.col}>Date</div>
              <div className={styles.col}>Status</div>
              <div className={styles.col}>Billed</div>
              <div className={styles.col}>Covered</div>
            </div>
            {recentClaims.map((claim) => (
              <div key={claim.id} className={styles.tableRow}>
                <div className={styles.col}>
                  <span className={styles.claimId}>{claim.id}</span>
                </div>
                <div className={styles.col}>{claim.service}</div>
                <div className={styles.col}>
                  {new Date(claim.date).toLocaleDateString()}
                </div>
                <div className={styles.col}>
                  <span className={`${styles.statusBadge} ${styles[claim.status]}`}>
                    {claim.status === 'processing' && '⏳ Processing'}
                    {claim.status === 'approved' && '✓ Approved'}
                    {claim.status === 'paid' && '✓ Paid'}
                  </span>
                </div>
                <div className={styles.col}>${claim.billed.toFixed(2)}</div>
                <div className={styles.col}>
                  <span className={styles.covered}>${claim.covered.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyClaims}>
            <p>No recent claims to display</p>
          </div>
        )}
      </div>

      {/* Helpful Tips */}
      <div className={styles.tipsSection}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>💡</span>
          Insurance Tips
        </h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tip}>
            <div className={styles.tipIcon}>🗓️</div>
            <div className={styles.tipContent}>
              <strong>Maximize Your Benefits</strong>
              <p>Use preventive care visits before year-end to get the most from your plan.</p>
            </div>
          </div>
          <div className={styles.tip}>
            <div className={styles.tipIcon}>📞</div>
            <div className={styles.tipContent}>
              <strong>Pre-Authorization</strong>
              <p>Major procedures may require pre-auth. We'll help you get approval.</p>
            </div>
          </div>
          <div className={styles.tip}>
            <div className={styles.tipIcon}>🏥</div>
            <div className={styles.tipContent}>
              <strong>In-Network Savings</strong>
              <p>Stay in-network to maximize coverage and minimize out-of-pocket costs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceTracker;
