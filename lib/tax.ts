/**
 * US State Sales Tax Rates
 * Simple internal tax map for state-based calculations
 * Can be replaced with Stripe Tax or TaxJar API later
 */
export const stateTaxRates: Record<string, number> = {
  // Major states and their average combined rates
  AL: 0.0913, // Alabama
  AK: 0.0, // Alaska (no state sales tax)
  AZ: 0.0837, // Arizona
  AR: 0.0947, // Arkansas
  CA: 0.0725, // California
  CO: 0.0763, // Colorado
  CT: 0.0635, // Connecticut
  DE: 0.0, // Delaware (no sales tax)
  FL: 0.06, // Florida
  GA: 0.0729, // Georgia
  HI: 0.04, // Hawaii
  ID: 0.06, // Idaho
  IL: 0.0625, // Illinois
  IN: 0.07, // Indiana
  IA: 0.0694, // Iowa
  KS: 0.0865, // Kansas
  KY: 0.06, // Kentucky
  LA: 0.0945, // Louisiana
  ME: 0.055, // Maine
  MD: 0.06, // Maryland
  MA: 0.0625, // Massachusetts
  MI: 0.06, // Michigan
  MN: 0.0688, // Minnesota
  MS: 0.07, // Mississippi
  MO: 0.0823, // Missouri
  MT: 0.0, // Montana (no sales tax)
  NE: 0.0694, // Nebraska
  NV: 0.0823, // Nevada
  NH: 0.0, // New Hampshire (no sales tax)
  NJ: 0.0663, // New Jersey
  NM: 0.0779, // New Mexico
  NY: 0.04, // New York (state only)
  NC: 0.0475, // North Carolina
  ND: 0.05, // North Dakota
  OH: 0.0725, // Ohio
  OK: 0.0895, // Oklahoma
  OR: 0.0, // Oregon (no sales tax)
  PA: 0.06, // Pennsylvania
  RI: 0.07, // Rhode Island
  SC: 0.06, // South Carolina
  SD: 0.045, // South Dakota
  TN: 0.0955, // Tennessee
  TX: 0.0825, // Texas
  UT: 0.0719, // Utah
  VT: 0.06, // Vermont
  VA: 0.053, // Virginia
  WA: 0.0927, // Washington
  WV: 0.06, // West Virginia
  WI: 0.05, // Wisconsin
  WY: 0.054, // Wyoming
};

/**
 * Calculate sales tax for a given subtotal and state
 */
export function calculateTax(
  subtotal: number,
  state: string,
  taxable: boolean = true
): {
  rate: number;
  taxAmount: number;
} {
  if (!taxable) {
    return {
      rate: 0,
      taxAmount: 0,
    };
  }

  const stateCode = state.toUpperCase();
  const rate = stateTaxRates[stateCode] || 0;

  return {
    rate,
    taxAmount: Math.round(subtotal * rate * 100) / 100, // Round to 2 decimals
  };
}

/**
 * Get tax rate for a specific state
 */
export function getTaxRate(state: string): number {
  const stateCode = state.toUpperCase();
  return stateTaxRates[stateCode] || 0;
}

/**
 * Check if a state has sales tax
 */
export function hasSalesTax(state: string): boolean {
  const stateCode = state.toUpperCase();
  return (stateTaxRates[stateCode] || 0) > 0;
}

/**
 * Format tax rate as percentage
 */
export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}
