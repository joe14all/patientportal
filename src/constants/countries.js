// This list can be expanded as needed.
export const COUNTRIES = [
  { name: "United States", code: "US", phoneCode: "+1" },
  { name: "Egypt", code: "EG", phoneCode: "+20" },
  // Add other countries here...
];

// A simple lookup for convenience
export const COUNTRIES_BY_CODE = COUNTRIES.reduce((acc, country) => {
  acc[country.code] = country;
  return acc;
}, {});
