// src/_mock/index.js

// --- Account ---
import users from "./data/account/users.json";
import loginHistory from "./data/account/login_history.json";
import messageThreads from "./data/account/message_threads.json";
import messagePosts from "./data/account/message_posts.json";
import documents from "./data/account/documents.json";

// --- Patient (Core Record) ---
import patients from "./data/patient/patients.json";
import medicalHistory from "./data/patient/medical_history.json";
import consents from "./data/patient/consents.json";
import patientAlerts from "./data/patient/patient_alerts.json";

// --- Clinical (Events & Plans) ---
import appointments from "./data/clinical/appointments.json";
import visitSummaries from "./data/clinical/visit_summaries.json";
import treatmentPlans from "./data/clinical/treatment_plans.json";
import availableSlots from "./data/clinical/available_slots.json";
import checkInQuestions from "./data/clinical/check_in_questions.json"; // <--- 1. IMPORT NEW FILE

// --- Billing ---
import insurancePolicies from "./data/billing/insurance_policies.json";
import insuranceClaims from "./data/billing/insurance_claims.json";
import billingInvoices from "./data/billing/billing_invoices.json";
import billingPayments from "./data/billing/billing_payments.json";
import billingRefunds from "./data/billing/billing_refunds.json";
import paymentMethods from "./data/billing/payment_methods.json";

// --- Core (Practice Definitions) ---
import providers from "./data/core/providers.json";
import offices from "./data/core/offices.json";
import procedures from "./data/core/procedures.json";
import appointmentTypes from "./data/core/appointment_types.json";
import operatories from "./data/core/operatories.json";
import downloadableForms from "./data/core/downloadable_forms.json";

// --- API ---
// This mock API object is what your React components will import.
// It is now organized by data domain for easier debugging and use.
export const mockApi = {
  // Account & User Data
  account: {
    users,
    loginHistory,
  },
  // Patient-specific records
  patient: {
    patients,
    medicalHistory,
    consents,
    patientAlerts,
  },
  // Clinical events
  clinical: {
    appointments,
    visitSummaries,
    treatmentPlans,
    availableSlots,
    checkInQuestions, // <--- 2. EXPORT NEW DATA
  },
  // Financial data
  billing: {
    insurancePolicies,
    insuranceClaims,
    billingInvoices,
    billingPayments,
    billingRefunds,
    paymentMethods,
  },
  // Secure messaging & files
  engagement: {
    messageThreads,
    messagePosts,
    documents,
  },
  // Practice-level definitions
  core: {
    providers,
    offices,
    procedures,
    appointmentTypes,
    operatories,
    downloadableForms,
  },
};
