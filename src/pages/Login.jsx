import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAccountData } from '../contexts';
import styles from './Login.module.css'; // Import the CSS module

const LoginPage = () => {
  const [email, setEmail] = useState('parent@example.com');
  const [password, setPassword] = useState('password123');
  const { login, loading, error } = useAccountData();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Call the login function from AccountContext
      await login(email, password);
      // On success, navigate to the dashboard
      navigate('/');
    } catch (err) {
      // Error is already set in the context, just log it
      console.error(err);
    }
  };

  return (
    // Use the CSS module for styling
    <div className={`card ${styles.loginCard}`}> 
      <h2 className={styles.title}>Portal Login</h2>
      <p className={styles.subtitle}>Welcome back. Please log in to your account.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {error && <p className="error-text" style={{ marginBottom: '1rem' }}>{error}</p>}
        
        <button type="submit" disabled={loading} className={styles.loginButton}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className={styles.footerLinks}>
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/signup">Don't have an account? Sign up</Link>
      </div>
    </div>
  );
};

export default LoginPage;