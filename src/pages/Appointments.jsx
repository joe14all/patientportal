import React from 'react';
import { useClinicalData } from '../contexts';

const Appointments = () => {
  const { appointments, loading } = useClinicalData();

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div>
      <h1>My Appointments</h1>
      <div className="card">
        <h2>Upcoming</h2>
        <ul>
          {appointments
            .filter(appt => new Date(appt.startDateTime) > new Date())
            .map(appt => (
              <li key={appt.id}>
                <strong>{new Date(appt.startDateTime).toLocaleDateString()}</strong>
                {' - '} {appt.appointmentType} ({appt.status})
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Appointments;