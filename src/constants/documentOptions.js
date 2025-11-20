/**
 * This file centralizes all options for the
 * Documents page.
 */

// A list of categories a patient can assign to an uploaded file.
export const DOCUMENT_CATEGORIES = [
  "Insurance Card",
  "Insurance EOB",
  "X-Rays / Imaging",
  "Previous Dental Records",
  "Referral Letter",
  "Specialist Report",
  "Payment Receipt",
  "Consent Form",
  "Other",
];

// --- NEW: Sort Options ---
export const DOCUMENT_SORT_OPTIONS = [
  { label: "Date: Newest First", value: "date_desc" },
  { label: "Date: Oldest First", value: "date_asc" },
  { label: "Name: A-Z", value: "name_asc" },
  { label: "Name: Z-A", value: "name_desc" },
];

// --- NEW: Context Type Mapping ---
// Maps the backend 'linkContext.type' to a user-friendly label
export const DOCUMENT_CONTEXT_TYPES = {
  InsurancePolicy: "Policy Document",
  VisitSummary: "Visit Record",
  MessageThread: "Message Attachment",
  Invoice: "Billing Record",
  Consent: "Signed Form",
};
