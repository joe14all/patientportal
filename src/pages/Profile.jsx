import React, { useState, useEffect, useCallback } from 'react';
import { usePatientData, useAccountData } from '../contexts';
import styles from './Profile.module.css';

// ... (imports for all other subcomponents remain the same)
import ProfileAvatarCard from '../components/profile/ProfileAvatarCard';
import ProfileContactForm from '../components/profile/ProfileContactForm';
import ProfileEmergencyContacts from '../components/profile/ProfileEmergencyContacts';
import ProfileSecurityForm from '../components/profile/ProfileSecurityForm';
import ProfilePreferencesForm from '../components/profile/ProfilePreferencesForm';
import ProfileDemographicsForm from '../components/profile/ProfileDemographicsForm';
import ProfileLoginHistory from '../components/profile/ProfileLoginHistory';
import ProfileSystemInfo from '../components/profile/ProfileSystemInfo';
import StickySaveBar from '../components/common/StickySaveBar';

// --- THIS IS THE FIX ---
// We need GENDER_IDENTITY_OPTIONS for the `useEffect` logic
import { RACE_OPTIONS, GENDER_IDENTITY_OPTIONS } from '../constants';

// ... (Helper functions like splitPhoneNumber, getPrimaryOrFirst remain the same)
const splitPhoneNumber = (fullNumber) => {
  if (!fullNumber) return { code: '+1', number: '' };
  if (fullNumber.startsWith('+1')) return { code: '+1', number: fullNumber.substring(2) };
  if (fullNumber.startsWith('+20')) return { code: '+20', number: fullNumber.substring(3) };
  return { code: '+1', number: fullNumber.replace('+1', '') };
};
const getPrimaryOrFirst = (arr, defaultItem) => {
  if (!arr || arr.length === 0) return defaultItem;
  return arr.find(i => i.isPrimary) || arr[0];
};


const Profile = () => {
  // --- Data and Actions ---
  const { patient, updatePatientDetails, loading: patientLoading } = usePatientData();
  const { user, updateUserPreferences, updateRecoveryPhone, loading: accountLoading } = useAccountData();

  // --- Component State ---
  const [formData, setFormData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [originalEmail, setOriginalEmail] = useState(null);

  // --- Effects ---
  useEffect(() => {
    if (patient && user) {
      const primaryEmail = getPrimaryOrFirst(patient.contact.emails, {});
      const primaryPhone = getPrimaryOrFirst(patient.contact.phones, {});
      const primaryAddress = getPrimaryOrFirst(patient.contact.addresses, {});
      const { code: phoneCountryCode, number: phoneNumber } = splitPhoneNumber(primaryPhone.number);

      // --- Demographics Logic ---
      const demographics = patient.demographics || {};
      const gender = demographics.genderIdentity || '';
      
      // Find the "Other" gender value (This was the line that caused the error)
      const genderOther = !GENDER_IDENTITY_OPTIONS.includes(gender) ? gender : '';
      
      // Find the "Other" race value
      const raceOther = (demographics.race || []).find(
        r => !RACE_OPTIONS.includes(r) && r !== "Prefer not to say"
      ) || '';

      setFormData({
        // ... (Contact fields)
        preferredName: patient.preferredName,
        email: primaryEmail.address || '',
        emailIsVerified: primaryEmail.isVerified || false,
        phoneCountryCode: phoneCountryCode,
        phoneNumber: phoneNumber,
        phoneType: primaryPhone.type || 'Mobile',
        allowSms: primaryPhone.allowSms || false,
        addressUse: primaryAddress.use || 'Home',
        addressLine1: primaryAddress.line ? primaryAddress.line[0] : '',
        addressLine2: primaryAddress.line ? primaryAddress.line[1] : '',
        city: primaryAddress.city || '',
        state: primaryAddress.state || '',
        postalCode: primaryAddress.postalCode || '',
        country: primaryAddress.country || 'US',
        
        // --- Demographics State ---
        demographics: {
          genderIdentity: GENDER_IDENTITY_OPTIONS.includes(gender) ? gender : 'Other',
          genderIdentityOther: genderOther,
          pronouns: demographics.pronouns || '',
          maritalStatus: demographics.maritalStatus || '',
          sexAtBirth: demographics.sexAtBirth || '',
          ethnicity: demographics.ethnicity || '',
          race: demographics.race || [],
          raceOther: raceOther, 
        },
        
        // ... (Account fields)
        recoveryPhone: user.contact.recoveryPhone,
        language: user.preferences.language,
        notifications: user.preferences.notifications,
      });
      
      setOriginalEmail(primaryEmail.address || '');
      setIsDirty(false);
    }
  }, [patient, user]); // This dependency array is correct

  // --- Event Handlers ---

  const handleRaceChange = useCallback((selectedRaces, otherRace) => {
    const newRaceArray = [...selectedRaces];
    if (otherRace) {
      newRaceArray.push(otherRace);
    }
    
    setFormData(prev => ({
      ...prev,
      demographics: { 
        ...prev.demographics, 
        race: newRaceArray,
        raceOther: otherRace
      }
    }));
    setIsDirty(true);
  }, []);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('notify_')) {
      const key = name.split('_')[1];
      setFormData(prev => ({ ...prev, notifications: { ...prev.notifications, [key]: checked }}));
    
    } else if (name.startsWith('demographics.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        demographics: { ...prev.demographics, [key]: value }
      }));

    } else if (name === 'email') {
      const newEmail = value;
      setFormData(prev => ({
        ...prev,
        email: newEmail,
        emailIsVerified: newEmail.toLowerCase() === originalEmail.toLowerCase() 
          ? patient.contact.emails.find(e => e.isPrimary).isVerified 
          : false,
      }));

    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      // --- Prepare Demographics Payload ---
      const demoData = formData.demographics;
      const finalGender = demoData.genderIdentity === 'Other' 
        ? demoData.genderIdentityOther 
        : demoData.genderIdentity;

      // 1. Update Patient Details
      await updatePatientDetails({
        preferredName: formData.preferredName,
        contact: {
          ...patient.contact,
          emails: [{ address: formData.email, isPrimary: true, isVerified: formData.emailIsVerified }],
          phones: [{ 
            number: `${formData.phoneCountryCode}${formData.phoneNumber}`,
            type: formData.phoneType,
            isPrimary: true, 
            allowSms: formData.allowSms
          }],
          addresses: [{
            use: formData.addressUse,
            isPrimary: true,
            line: [formData.addressLine1, formData.addressLine2].filter(Boolean),
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country
          }]
        },
        
        demographics: {
          ...patient.demographics,
          genderIdentity: finalGender,
          pronouns: demoData.pronouns,
          maritalStatus: demoData.maritalStatus,
          sexAtBirth: demoData.sexAtBirth,
          ethnicity: demoData.ethnicity,
          race: demoData.race,
        }
      });

      // 2. Update Account Preferences
      await updateUserPreferences({
        language: formData.language,
        notifications: formData.notifications
      });

      // 3. Update Account Recovery Phone
      await updateRecoveryPhone(formData.recoveryPhone);

      setOriginalEmail(formData.email);
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };

  const handleVerifyEmail = () => {
    alert(`A verification link has been sent to ${formData.email}.`);
  };

  // --- Render Logic ---
  const loading = patientLoading || accountLoading;
  
  if (loading && !formData) return <p>Loading profile...</p>;
  if (!formData) return <p>Could not load profile data.</p>;

  return (
    <div className={styles.pageWrapper}>
      <h1>Profile & Settings</h1>
      
      <div className={styles.profileLayout}>
        {/* --- Column 1: Profile & Contact --- */}
        <div className={styles.column}>
          <ProfileAvatarCard />
          <ProfileContactForm 
            formData={formData} // Pass the *full* formData
            handleChange={handleChange}
            handleVerifyEmail={handleVerifyEmail}
          />
          <ProfileEmergencyContacts />
        </div>
        
        {/* --- Column 2: Account & Security --- */}
        <div className={styles.column}>
          <ProfileSecurityForm 
            formData={formData} 
            handleChange={handleChange} 
          />
          <ProfilePreferencesForm 
            formData={formData} 
            handleChange={handleChange} 
          />
          <ProfileDemographicsForm
            formData={formData.demographics} // Pass the demographics sub-object
            handleChange={handleChange}
            handleRaceChange={handleRaceChange} 
          />
          <ProfileLoginHistory />
          <ProfileSystemInfo />
        </div>
      </div>

      <StickySaveBar 
        isDirty={isDirty}
        loading={loading}
        onSave={handleSave}
      />
    </div>
  );
};

export default Profile;