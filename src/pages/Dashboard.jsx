import React from 'react';
import { useAccountData, usePatientData } from '../contexts';

const Dashboard = () => {
  const { user } = useAccountData();
  const { patient } = usePatientData(); // Get patient data

  return (
    <div>
      <h1>Welcome, {patient.preferredName}!</h1>
      <p>Here's your dashboard. You are logged in as {user.email}.</p>
      
      <div className="card">
        <h2>Patient Info</h2>
        <p><strong>Name:</strong> {patient.legalName.fullText}</p>
        <p><strong>DOB:</strong> {patient.dateOfBirth}</p>
      </div>
    </div>
  );
};

export default Dashboard;