import React from 'react';
import { usePatientData } from '../../contexts';
import { IconProfile } from '../../layouts/components/Icons';
import styles from './ProfileAvatarCard.module.css';

const ProfileAvatarCard = () => {
  const { patient } = usePatientData();

  // The parent Profile.jsx component already handles the main loading
  // state, so we can assume `patient` is available here.
  if (!patient) {
    return null; // Or a smaller loader
  }

  return (
    <div className={`card ${styles.avatarCard}`}>
      <div className={styles.avatar}>
        <IconProfile />
      </div>
      <h2>{patient.legalName.fullText}</h2>
      <p>DOB: {patient.dateOfBirth}</p>
    </div>
  );
};

export default ProfileAvatarCard;