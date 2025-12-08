import React, { useState } from 'react';
import styles from './NotificationPreferences.module.css';

/**
 * Notification Preferences Component
 * Allows patients to customize how they receive communications
 */
const NotificationPreferences = ({ preferences = {}, onSave }) => {
  const [settings, setSettings] = useState({
    appointments: {
      email: preferences.appointments?.email ?? true,
      sms: preferences.appointments?.sms ?? true,
      push: preferences.appointments?.push ?? true,
      reminder24h: preferences.appointments?.reminder24h ?? true,
      reminder1h: preferences.appointments?.reminder1h ?? false,
    },
    messages: {
      email: preferences.messages?.email ?? true,
      sms: preferences.messages?.sms ?? false,
      push: preferences.messages?.push ?? true,
    },
    billing: {
      email: preferences.billing?.email ?? true,
      sms: preferences.billing?.sms ?? false,
      push: preferences.billing?.push ?? false,
    },
    results: {
      email: preferences.results?.email ?? true,
      sms: preferences.results?.sms ?? false,
      push: preferences.results?.push ?? true,
    },
    marketing: {
      email: preferences.marketing?.email ?? false,
      sms: preferences.marketing?.sms ?? false,
    }
  });

  const handleToggle = (category, channel) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  const categories = [
    {
      id: 'appointments',
      name: 'Appointments',
      icon: '📅',
      description: 'Confirmations, reminders, and changes to your appointments',
      hasReminders: true
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: '✉️',
      description: 'New messages from your care team'
    },
    {
      id: 'billing',
      name: 'Billing & Payments',
      icon: '💳',
      description: 'Invoices, payment confirmations, and account updates'
    },
    {
      id: 'results',
      name: 'Test Results',
      icon: '📋',
      description: 'Lab results and diagnostic reports'
    },
    {
      id: 'marketing',
      name: 'News & Tips',
      icon: '💡',
      description: 'Dental health tips and practice updates (optional)'
    }
  ];

  return (
    <div className={styles.preferencesCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>Notification Preferences</h3>
        <p className={styles.subtitle}>
          Choose how you'd like to hear from us. You can always change these later.
        </p>
      </div>

      <div className={styles.categoriesList}>
        {categories.map(category => (
          <div key={category.id} className={styles.category}>
            <div className={styles.categoryHeader}>
              <span className={styles.categoryIcon}>{category.icon}</span>
              <div>
                <h4 className={styles.categoryName}>{category.name}</h4>
                <p className={styles.categoryDesc}>{category.description}</p>
              </div>
            </div>

            <div className={styles.channelsGrid}>
              <label className={styles.channelToggle}>
                <input
                  type="checkbox"
                  checked={settings[category.id]?.email ?? false}
                  onChange={() => handleToggle(category.id, 'email')}
                />
                <span className={styles.channelLabel}>
                  <span className={styles.channelIcon}>📧</span>
                  Email
                </span>
              </label>

              <label className={styles.channelToggle}>
                <input
                  type="checkbox"
                  checked={settings[category.id]?.sms ?? false}
                  onChange={() => handleToggle(category.id, 'sms')}
                />
                <span className={styles.channelLabel}>
                  <span className={styles.channelIcon}>💬</span>
                  Text/SMS
                </span>
              </label>

              {category.id !== 'marketing' && (
                <label className={styles.channelToggle}>
                  <input
                    type="checkbox"
                    checked={settings[category.id]?.push ?? false}
                    onChange={() => handleToggle(category.id, 'push')}
                  />
                  <span className={styles.channelLabel}>
                    <span className={styles.channelIcon}>🔔</span>
                    Push
                  </span>
                </label>
              )}
            </div>

            {category.hasReminders && (
              <div className={styles.reminderOptions}>
                <p className={styles.reminderTitle}>Appointment Reminders:</p>
                <label className={styles.reminderToggle}>
                  <input
                    type="checkbox"
                    checked={settings.appointments.reminder24h}
                    onChange={() => handleToggle('appointments', 'reminder24h')}
                  />
                  <span>24 hours before</span>
                </label>
                <label className={styles.reminderToggle}>
                  <input
                    type="checkbox"
                    checked={settings.appointments.reminder1h}
                    onChange={() => handleToggle('appointments', 'reminder1h')}
                  />
                  <span>1 hour before</span>
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className="primary" onClick={handleSave}>
          Save Preferences
        </button>
        <p className={styles.helpText}>
          💡 <strong>Tip:</strong> We recommend keeping appointment reminders enabled so you never miss a visit!
        </p>
      </div>
    </div>
  );
};

export default NotificationPreferences;
