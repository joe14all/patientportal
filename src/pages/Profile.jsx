import React, { useState, useEffect, useCallback } from 'react';
import { usePatientData, useAccountData } from '../contexts';
import styles from './Profile.module.css';

// (All component imports remain the same)
import ProfileAvatarCard from '../components/profile/ProfileAvatarCard';
import ProfileContactForm from '../components/profile/ProfileContactForm';
import ProfileEmergencyContacts from '../components/profile/ProfileEmergencyContacts';
import ProfileSecurityForm from '../components/profile/ProfileSecurityForm';
import ProfilePreferencesForm from '../components/profile/ProfilePreferencesForm';
import ProfileSyncing from '../components/profile/ProfileSyncing'; 
import ProfileDemographicsForm from '../components/profile/ProfileDemographicsForm';
import ProfileLoginHistory from '../components/profile/ProfileLoginHistory';
import ProfileSystemInfo from '../components/profile/ProfileSystemInfo';
import StickySaveBar from '../components/common/StickySaveBar';
import { RACE_OPTIONS, GENDER_IDENTITY_OPTIONS } from '../constants';

// (Helper functions remain the same)
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
  const [originalFormData, setOriginalFormData] = useState(null); 
  const [isDirty, setIsDirty] = useState(false);
  
  // (originalEmail and originalPhone are no longer needed here)

  // --- Effects ---
  useEffect(() => {
    if (patient && user && !originalFormData) { // Only set original data once on load
      // (Get primary items)
      const primaryEmail = getPrimaryOrFirst(patient.contact.emails, {});
      const primaryPhone = getPrimaryOrFirst(patient.contact.phones, {});
      const primaryAddress = getPrimaryOrFirst(patient.contact.addresses, {});
      const { code: phoneCountryCode, number: phoneNumber } = splitPhoneNumber(primaryPhone.number);

      // (Demographics logic)
      const demographics = patient.demographics || {};
      const gender = demographics.genderIdentity || '';
      const genderOther = !GENDER_IDENTITY_OPTIONS.includes(gender) ? gender : '';
      const raceOther = (demographics.race || []).find(
        r => !RACE_OPTIONS.includes(r) && r !== "Prefer not to say"
      ) || '';

      const initialData = {
        // ... (Personal info)
        preferredName: patient.preferredName,
        
        // ... (Email info)
        email: primaryEmail.address || '',
        emailIsVerified: primaryEmail.isVerified || false,
        
        // --- THIS IS UPDATED ---
        phoneCountryCode: phoneCountryCode,
        phoneNumber: phoneNumber,
        phoneType: primaryPhone.type || 'Mobile',
        allowSms: primaryPhone.allowSms || false,
        phoneIsVerified: primaryPhone.isVerified || false, // Add this line

        // ... (Address info)
        addressUse: primaryAddress.use || 'Home',
        addressLine1: primaryAddress.line ? primaryAddress.line[0] : '',
        addressLine2: primaryAddress.line ? primaryAddress.line[1] : '',
        city: primaryAddress.city || '',
        state: primaryAddress.state || '',
        postalCode: primaryAddress.postalCode || '',
        country: primaryAddress.country || 'US',
        
        // ... (Demographics info)
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
        
        // ... (Account info)
        recoveryPhone: user.contact.recoveryPhone,
        language: user.preferences.language,
        notifications: user.preferences.notifications,
        theme: user.preferences.theme || '',
      };

      setFormData(initialData);
      setOriginalFormData(initialData); // --- NEW: Set the original data
      setIsDirty(false);
    }
  }, [patient, user, originalFormData]); // Add originalFormData as a dependency

  // --- Event Handlers ---

  const handleRaceChange = useCallback((selectedRaces, otherRace) => {
    const newRaceArray = [...selectedRaces];
    if (otherRace) newRaceArray.push(otherRace);
    setFormData(prev => ({
      ...prev,
      demographics: { ...prev.demographics, race: newRaceArray, raceOther: otherRace }
    }));
    setIsDirty(true);
  }, []);


  // --- THIS IS UPDATED ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      let newFormData = { ...prev };
      const originalPhone = `${originalFormData.phoneCountryCode}${originalFormData.phoneNumber}`;
      const originalEmail = originalFormData.email;

      // Handle nested notification checkboxes
      if (name.startsWith('notify_')) {
        const key = name.split('_')[1];
        newFormData.notifications = { ...prev.notifications, [key]: checked };
      
      // Handle nested demographic fields
      } else if (name.startsWith('demographics.')) {
        const key = name.split('.')[1];
        newFormData.demographics = { ...prev.demographics, [key]: value };

      // Special logic for email change
      } else if (name === 'email') {
        const newEmail = value;
        newFormData.email = newEmail;
        newFormData.emailIsVerified = newEmail.toLowerCase() === originalEmail.toLowerCase() 
          ? originalFormData.emailIsVerified
          : false;

      // --- NEW: Special logic for phone change ---
      } else if (name === 'phoneNumber' || name === 'phoneCountryCode') {
        const newPhonePart = value;
        const otherPhonePart = name === 'phoneNumber' 
          ? prev.phoneCountryCode 
          : prev.phoneNumber;
        
        const newFullPhone = name === 'phoneNumber'
          ? `${otherPhonePart}${newPhonePart}`
          : `${newPhonePart}${otherPhonePart}`;
        
        newFormData[name] = value;
        newFormData.phoneIsVerified = newFullPhone === originalPhone 
          ? originalFormData.phoneIsVerified
          : false;

      // Handle standard fields
      } else {
        newFormData[name] = type === 'checkbox' ? checked : value;
      }
      
      return newFormData;
    });

    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!formData) return;
    try {
      // (Prepare demographics payload)
      const demoData = formData.demographics;
      const finalGender = demoData.genderIdentity === 'Other' 
        ? demoData.genderIdentityOther 
        : demoData.genderIdentity;
      
      // --- THIS IS UPDATED ---
      const newFullPhone = `${formData.phoneCountryCode}${formData.phoneNumber}`;

      // 1. Update Patient Details
      await updatePatientDetails({
        preferredName: formData.preferredName,
        contact: {
          ...patient.contact,
          emails: [{ 
            address: formData.email, 
            isPrimary: true, 
            isVerified: formData.emailIsVerified 
          }],
          phones: [{ 
            number: newFullPhone, // Save combined number
            type: formData.phoneType,
            isPrimary: true, 
            allowSms: formData.allowSms,
            isVerified: formData.phoneIsVerified // Save new flag
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
        notifications: formData.notifications,
        theme: formData.theme === '' ? null : formData.theme
      });

      // 3. Update Account Recovery Phone
      await updateRecoveryPhone(formData.recoveryPhone);

      // --- THIS IS UPDATED ---
      setOriginalFormData(formData); // Set the new "original" state to the saved data
      setIsDirty(false);
    } catch (err) {
      console.error("Failed to save profile", err);
    }
  };
  
  // --- NEW: Handle Revert ---
  const handleRevert = () => {
    setFormData(originalFormData);
    setIsDirty(false);
  };

  const handleVerifyEmail = () => {
    alert(`A verification link has been sent to ${formData.email}.`);
  };

  // --- THIS IS NEW ---
  const handleVerifyPhone = () => {
    // In a real app, this would trigger an API call to send an SMS code.
    alert(`A verification code will be sent to ${formData.phoneCountryCode}${formData.phoneNumber}.`);
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
            formData={formData} 
            handleChange={handleChange}
            handleVerifyEmail={handleVerifyEmail}
            handleVerifyPhone={handleVerifyPhone} 
            phoneIsVerified={formData.phoneIsVerified} 
          />
          <ProfileEmergencyContacts />
        </div>
        
        {/* --- Column 2: Security, Preferences, Sync, etc. --- */}
        <div className={styles.column}>
          <ProfileSecurityForm 
            formData={formData} 
            handleChange={handleChange} 
          />
          <ProfilePreferencesForm 
            formData={formData} 
            handleChange={handleChange} 
          />
          {/* --- 2. ADD THE NEW COMPONENT HERE --- */}
          <ProfileSyncing />
          
          <ProfileDemographicsForm
            formData={formData.demographics}
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
        onRevert={handleRevert} 
      />
    </div>
  );
};

export default Profile;