import React from 'react';
import styles from './AppointmentPrep.module.css';

/**
 * Appointment Preparation Component
 * Shows patients what to expect and how to prepare for their visit
 */
const AppointmentPrep = ({ appointment, provider, office }) => {
  if (!appointment) return null;

  const isTelehealth = appointment.systemInfo?.isTelehealth;
  const apptType = appointment.appointmentType;
  
  // Determine preparation items based on appointment type
  const getPrepItems = () => {
    const items = [];
    
    // Common items
    items.push({
      icon: '📋',
      title: 'Complete any required forms',
      description: 'Check your Documents page for forms that need your attention'
    });
    
    if (!isTelehealth) {
      items.push({
        icon: '🕐',
        title: 'Arrive 10 minutes early',
        description: 'This gives you time to check in and fill out any last-minute paperwork'
      });
      
      items.push({
        icon: '📍',
        title: 'Know where you\'re going',
        description: office?.contact?.address?.googleMapsUrl 
          ? <a href={office.contact.address.googleMapsUrl} target="_blank" rel="noreferrer">Get directions to {office.name}</a>
          : `Location: ${office?.name || 'See appointment details'}`
      });
    } else {
      items.push({
        icon: '💻',
        title: 'Test your technology',
        description: 'Make sure your camera and microphone work. The video link will be available 30 minutes before your appointment.'
      });
      
      items.push({
        icon: '🤫',
        title: 'Find a quiet space',
        description: 'Choose a private, well-lit area for your video visit'
      });
    }
    
    items.push({
      icon: '💳',
      title: 'Bring your insurance card',
      description: 'Make sure your insurance information is up to date'
    });
    
    if (apptType.toLowerCase().includes('cleaning') || apptType.toLowerCase().includes('hygiene')) {
      items.push({
        icon: '🪥',
        title: 'Brush before your visit',
        description: 'A quick brush helps our team examine your teeth more thoroughly'
      });
    }
    
    if (apptType.toLowerCase().includes('surgery') || apptType.toLowerCase().includes('extraction')) {
      items.push({
        icon: '🚗',
        title: 'Arrange transportation',
        description: 'Plan to have someone drive you home after your procedure'
      });
      
      items.push({
        icon: '🍽️',
        title: 'Follow fasting instructions',
        description: 'Avoid eating 6 hours before your appointment if sedation is planned'
      });
    }
    
    return items;
  };

  const whatToExpect = () => {
    if (apptType.toLowerCase().includes('cleaning')) {
      return 'Your hygienist will clean your teeth and check for any issues. The dentist will then examine your mouth and discuss any findings.';
    }
    if (apptType.toLowerCase().includes('consultation')) {
      return 'We\'ll discuss your dental concerns, review your health history, and create a personalized care plan together.';
    }
    if (apptType.toLowerCase().includes('exam')) {
      return 'A comprehensive examination of your teeth, gums, and oral health. We may take X-rays to get a complete picture.';
    }
    return 'We\'re here to provide the best care possible. If you have questions, feel free to ask!';
  };

  const estimatedDuration = () => {
    if (apptType.toLowerCase().includes('cleaning')) return '45-60 minutes';
    if (apptType.toLowerCase().includes('consultation')) return '30-45 minutes';
    if (apptType.toLowerCase().includes('exam')) return '30-60 minutes';
    return '30-90 minutes';
  };

  return (
    <div className={styles.prepCard}>
      <h3 className={styles.prepTitle}>📌 Preparing for Your Visit</h3>
      
      {/* What to Expect */}
      <div className={styles.expectSection}>
        <h4 className={styles.sectionTitle}>What to Expect</h4>
        <p className={styles.expectText}>{whatToExpect()}</p>
        <p className={styles.durationText}>
          <strong>Estimated time:</strong> {estimatedDuration()}
        </p>
      </div>

      {/* Provider Info */}
      {provider && (
        <div className={styles.providerSection}>
          <h4 className={styles.sectionTitle}>Your Care Team</h4>
          <div className={styles.providerCard}>
            {provider.systemInfo?.profileImageUrl ? (
              <img 
                src={provider.systemInfo.profileImageUrl} 
                alt={provider.preferredName}
                className={styles.providerImage}
              />
            ) : (
              <div className={styles.providerInitials}>
                {provider.preferredName?.charAt(0) || 'D'}
              </div>
            )}
            <div className={styles.providerInfo}>
              <p className={styles.providerName}>{provider.preferredName}</p>
              {provider.qualifications && (
                <p className={styles.providerQual}>{provider.qualifications}</p>
              )}
              <p className={styles.providerBio}>
                {provider.bio || 'Dedicated to providing excellent dental care in a comfortable environment.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preparation Checklist */}
      <div className={styles.checklistSection}>
        <h4 className={styles.sectionTitle}>How to Prepare</h4>
        <ul className={styles.prepList}>
          {getPrepItems().map((item, index) => (
            <li key={index} className={styles.prepItem}>
              <span className={styles.prepIcon}>{item.icon}</span>
              <div className={styles.prepContent}>
                <strong className={styles.prepItemTitle}>{item.title}</strong>
                <p className={styles.prepItemDesc}>{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Questions Section */}
      <div className={styles.questionsSection}>
        <p className={styles.questionsText}>
          <strong>Have questions or concerns?</strong> Feel free to message us anytime before your appointment.
        </p>
      </div>
    </div>
  );
};

export default AppointmentPrep;
