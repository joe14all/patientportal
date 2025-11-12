import { Navigate, Outlet } from 'react-router-dom';
import { useAccountData } from '../contexts';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAccountData();

  // Show a loading indicator while the context is checking auth.
  // This prevents a "flash" of the login page on app load.
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading authentication...</h2>
      </div>
    );
  }

  // If authenticated, render the child component (e.g., Dashboard).
  // <Outlet /> is a placeholder for the child route.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;