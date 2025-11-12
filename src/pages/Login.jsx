import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountData } from '../contexts';

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
    <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Portal Login</h2>
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
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;