// A list of common credit card types for the "Add Card" form
export const CARD_TYPES = [
  "Visa",
  "Mastercard",
  "American Express",
  "Discover",
  "HSA/FSA Card",
];

// Generates a list of months for the expiration date dropdown
export const EXPIRATION_MONTHS = [
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

/**
 * Generates a list of upcoming years for the expiration date dropdown.
 * @param {number} count - The number of years to generate (e.g., 10).
 * @returns {string[]} An array of years as strings.
 */
export const getExpirationYears = (count = 10) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < count; i++) {
    years.push(String(currentYear + i));
  }
  return years;
};
