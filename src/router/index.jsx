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

// --- Import all the new pages ---
import Messages from '../pages/Messages.jsx';
import Thread from '../pages/Thread.jsx';
import Billing from '../pages/Billing.jsx';
import Documents from '../pages/Documents.jsx';
import Profile from '../pages/Profile.jsx';
import MedicalHistory from '../pages/MedicalHistory.jsx';
import TreatmentPlans from '../pages/TreatmentPlans.jsx'; // 1. Import TreatmentPlans

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
          
          {/* --- Add all the new routes --- */}
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:threadId" element={<Thread />} />
          <Route path="billing" element={<Billing />} />
          <Route path="plans" element={<TreatmentPlans />} /> {/* 2. Add the route */}
          <Route path="documents" element={<Documents />} />
          <Route path="profile" element={<Profile />} />
          <Route path="history" element={<MedicalHistory />} />
          
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