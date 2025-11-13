import React from 'react';
import { usePatientData } from '../../contexts';
import styles from './ProfileSystemInfo.module.css';

const ProfileSystemInfo = () => {
  const { patient } = usePatientData();

  if (!patient) {
    return null;
  }

  // Find the SSN_LAST4 identifier, if it exists
  const ssnIdentifier = patient.nationalIdentifiers?.find(
    (id) => id.type === 'SSN_LAST4'
  );

  return (
    <section className={`card ${styles.systemInfoCard}`}>
      <h2>System Information</h2>
      <ul className={styles.infoList}>
        <li className={styles.infoItem}>
          <span>Chart Number</span>
          <strong>{patient.chartNumber}</strong>
        </li>
        {ssnIdentifier && (
          <li className={styles.infoItem}>
            <span>SSN (Last 4)</span>
            <strong>**** {ssnIdentifier.value}</strong>
          </li>
        )}
        <li className={styles.infoItem}>
          <span>Guarantor</span>
          <strong>{patient.guarantor.relationshipToPatient}</strong>
        </li>
      </ul>
    </section>
  );
};

export default ProfileSystemInfo;