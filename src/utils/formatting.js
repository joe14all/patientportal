/**
 * Formats a "money" object into a localized currency string.
 * @param {object} money - The money object, e.g., { amount: 150.50, currency: "USD" }
 * @returns {string} - The formatted string, e.g., "$150.50" or "EGP 1,500.50"
 */
export const formatCurrency = (money) => {
  // Default to 0 USD if no data is provided
  const { amount = 0, currency = "USD" } = money || {};

  // Intl.NumberFormat will automatically handle symbols,
  // decimal places, and formatting for any currency code.
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency,
  }).format(amount);
};
