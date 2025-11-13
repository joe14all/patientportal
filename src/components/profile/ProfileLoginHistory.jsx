import React from 'react';
import { useAccountData } from '../../contexts';
import styles from './ProfileLoginHistory.module.css';

const ProfileLoginHistory = () => {
  const { loginHistory } = useAccountData();

  return (
    <section className={`card ${styles.loginHistoryCard}`}>
      <h2>Login History</h2>
      <ul className={styles.loginHistoryList}>
        {/* We only show the most recent 3 entries */}
        {loginHistory.slice(0, 3).map(item => (
          <li className={styles.loginHistoryItem} key={item.id}>
            <strong>{new Date(item.timestamp).toLocaleString()}</strong>
            <span className={item.status === 'Success' ? styles.success : styles.failed}>
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProfileLoginHistory;