/**
 * This file centralizes all options for the
 * Medical History sub-forms.
 */

// An array of objects to dynamically build the "Specific Dental Questions" form.
// The `id` maps directly to the keys in the `medical_history.json` object.
export const DENTAL_QUESTIONS = [
  {
    id: "hasDentalAnxiety",
    label: "Do you have anxiety about dental visits?",
    type: "boolean",
  },
  {
    id: "requiresPremedication",
    label:
      "Do you require premedication (e.g., for a joint replacement or heart condition)?",
    type: "boolean",
  },
  {
    id: "onBisphosphonates",
    label: "Are you taking bisphosphonates (e.g., for osteoporosis)?",
    type: "boolean",
  },
  {
    id: "isPregnant",
    label: "Are you currently pregnant?",
    type: "boolean",
  },
  {
    id: "pregnancyDueDate",
    label: "If yes, what is your estimated due date?",
    type: "date",
    // This question will only be shown if 'isPregnant' is true
    condition: "isPregnant",
  },
  {
    id: "isNursing",
    label: "Are you currently nursing?",
    type: "boolean",
  },
];

// Options for the "Family History" relationship dropdown
export const FAMILY_HISTORY_RELATIONS = [
  "Mother",
  "Father",
  "Sibling",
  "Grandparent (Maternal)",
  "Grandparent (Paternal)",
  "Child",
  "Other",
];

// A list of common conditions to suggest for Family History
export const COMMON_FAMILY_CONDITIONS = [
  "Heart Disease",
  "High Blood Pressure",
  "Stroke",
  "Diabetes (Type 1)",
  "Diabetes (Type 2)",
  "Cancer",
  "Bleeding Disorders",
  "Anesthesia Complications",
];
