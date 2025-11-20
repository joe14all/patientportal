// src/constants/appointments.js

// --- Self Check-In Logic ---
// How many minutes before the appointment start time the "I'm Here" button appears
export const CHECK_IN_WINDOW_MINUTES = 30;

// Matches the "type" field in your check_in_questions.json
export const QUESTION_TYPES = {
  YES_NO: "YesNo",
  TEXT: "Text",
  MULTI_CHOICE: "MultiChoice",
};

// --- Telehealth Logic ---
// How many minutes before the appointment the "Join Call" button becomes active
export const TELEHEALTH_JOIN_WINDOW_MINUTES = 15;

// --- General Appointment Statuses ---
// Centralizing these helps prevent typos like "Canceled" vs "Cancelled"
export const APPOINTMENT_STATUS = {
  CONFIRMED: "Confirmed",
  PENDING: "Pending",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  CHECKED_IN: "CheckedIn", // Optional: if you change the main status after check-in
  NOSHOW: "NoShow",
};
