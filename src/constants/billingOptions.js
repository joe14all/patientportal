import { IconBilling, IconBank, IconZap } from "../layouts/components/Icons";

/**
 * Configuration for all payment methods supported.
 */
export const PAYMENT_METHOD_CONFIG = [
  // ... (existing config for card, bank, online)
  {
    id: "card",
    name: "Credit / Debit Card",
    icon: IconBilling,
    types: [
      "Visa",
      "Mastercard",
      "American Express",
      "Discover",
      "JCB",
      "UnionPay",
      "Diners Club",
      "HSA/FSA Card",
    ],
  },
  {
    id: "bank",
    name: "Bank Account",
    icon: IconBank,
    types: ["Bank Wire (International)", "ACH Direct Debit (US)"],
  },
  {
    id: "online",
    name: "Digital Wallet",
    icon: IconZap,
    types: ["Instapay", "PayPal", "Apple Pay", "Google Pay"],
  },
];

// --- Helpers for the Credit Card Form ---
export const EXPIRATION_MONTHS = [
  // ... (existing months)
  { name: "01 - January", value: "01" },
  { name: "02 - February", value: "02" },
  { name: "03 - March", value: "03" },
  { name: "04 - April", value: "04" },
  { name: "05 - May", value: "05" },
  { name: "06 - June", value: "06" },
  { name: "07 - July", value: "07" },
  { name: "08 - August", value: "08" },
  { name: "09 - September", value: "09" },
  { name: "10 - October", value: "10" },
  { name: "11 - November", value: "11" },
  { name: "12 - December", value: "12" },
];

export const getExpirationYears = (count = 10) => {
  // ... (existing function)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < count; i++) {
    years.push(String(currentYear + i));
  }
  return years;
};

// --- NEW: OPTIONS FOR INSURANCE FORM ---
export const SUBSCRIBER_RELATIONSHIP = ["Self", "Spouse", "Child", "Other"];
export const PLAN_TYPES = ["PPO", "HMO", "EPO", "Other"];
export const COVERAGE_PRIORITY = ["Primary", "Secondary", "Tertiary"];
