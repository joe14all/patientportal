// This file centralizes all options for the demographics form.

// Based on inclusive design best practices.
// "Other" will trigger a free-text input.
export const GENDER_IDENTITY_OPTIONS = [
  "Woman",
  "Man",
  "Prefer not to say",
  "Other",
];

// Based on common US Census categories.
// This will be used to render checkboxes.
export const RACE_OPTIONS = [
  "American Indian or Alaska Native",
  "Asian",
  "Black or African American",
  "Native Hawaiian or Other Pacific Islander",
  "White",
  "Prefer not to say",
];
// Note: "Other" will be a separate free-text field.

// Based on US Census categories.
export const ETHNICITY_OPTIONS = [
  "Hispanic or Latino",
  "Not Hispanic or Latino",
  "Prefer not to say",
];

// Standard options
export const MARITAL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Partnered",
  "Divorced",
  "Widowed",
  "Prefer not to say",
];

// Based on legal and clinical standards.
export const SEX_AT_BIRTH_OPTIONS = ["Female", "Male", "Prefer not to say"];
