/* eslint-disable react-refresh/only-export-components */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

// Import all our pages
import Dashboard from '../pages/Dashboard.jsx';
import Appointments from '../pages/Appointments.jsx';
import LoginPage from '../pages/Login.jsx';
import NotFound from '../pages/NotFound.jsx';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      {/* Group 1: Protected Routes
        These routes are wrapped by <ProtectedRoute />.
        If you are authenticated, it renders the <MainLayout />.
        If not, it redirects you to "/login".
      */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          {/* The default page inside MainLayout */}
          <Route index element={<Dashboard />} /> 
          <Route path="appointments" element={<Appointments />} />
          {/* Add more protected routes here (e.g., billing, messages) */}
        </Route>
      </Route>

      {/* Group 2: Public (Auth) Routes
        These routes are for logged-out users.
        They are rendered inside the <AuthLayout />.
      */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        {/* Add more public routes here (e.g., /signup, /forgot-password) */}
      </Route>

      {/* Group 3: Not Found
        This catch-all route renders if no other route matches.
      */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);