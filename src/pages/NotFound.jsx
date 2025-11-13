import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css'; // Import the CSS module

const NotFound = () => {
  return (
    // This page doesn't use the MainLayout,
    // so we give it its own full-page wrapper.
    <div className={styles.notFoundWrapper}>
      <div className={styles.notFoundContent}>
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.message}>
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link to="/">
          <button>Go to Dashboard</button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;