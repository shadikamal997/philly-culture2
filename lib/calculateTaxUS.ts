/**
 * US State Tax Rates (2024)
 * Source: Tax Foundation & state revenue departments
 * Note: These are state-level rates only. Local taxes may apply.
 */

interface TaxRate {
  state: string;
  rate: number;
  hasLocalTax: boolean;
}

const US_STATE_TAX_RATES: Record<string, TaxRate> = {
  AL: { state: 'Alabama', rate: 0.04, hasLocalTax: true },
  AK: { state: 'Alaska', rate: 0.00, hasLocalTax: true }, // No state tax, local only
  AZ: { state: 'Arizona', rate: 0.056, hasLocalTax: true },
  AR: { state: 'Arkansas', rate: 0.065, hasLocalTax: true },
  CA: { state: 'California', rate: 0.0725, hasLocalTax: true },
  CO: { state: 'Colorado', rate: 0.029, hasLocalTax: true },
  CT: { state: 'Connecticut', rate: 0.0635, hasLocalTax: false },
  DE: { state: 'Delaware', rate: 0.00, hasLocalTax: false }, // No sales tax
  FL: { state: 'Florida', rate: 0.06, hasLocalTax: true },
  GA: { state: 'Georgia', rate: 0.04, hasLocalTax: true },
  HI: { state: 'Hawaii', rate: 0.04, hasLocalTax: true },
  ID: { state: 'Idaho', rate: 0.06, hasLocalTax: true },
  IL: { state: 'Illinois', rate: 0.0625, hasLocalTax: true },
  IN: { state: 'Indiana', rate: 0.07, hasLocalTax: false },
  IA: { state: 'Iowa', rate: 0.06, hasLocalTax: true },
  KS: { state: 'Kansas', rate: 0.065, hasLocalTax: true },
  KY: { state: 'Kentucky', rate: 0.06, hasLocalTax: false },
  LA: { state: 'Louisiana', rate: 0.0445, hasLocalTax: true },
  ME: { state: 'Maine', rate: 0.055, hasLocalTax: false },
  MD: { state: 'Maryland', rate: 0.06, hasLocalTax: false },
  MA: { state: 'Massachusetts', rate: 0.0625, hasLocalTax: false },
  MI: { state: 'Michigan', rate: 0.06, hasLocalTax: false },
  MN: { state: 'Minnesota', rate: 0.06875, hasLocalTax: true },
  MS: { state: 'Mississippi', rate: 0.07, hasLocalTax: true },
  MO: { state: 'Missouri', rate: 0.04225, hasLocalTax: true },
  MT: { state: 'Montana', rate: 0.00, hasLocalTax: false }, // No sales tax
  NE: { state: 'Nebraska', rate: 0.055, hasLocalTax: true },
  NV: { state: 'Nevada', rate: 0.0685, hasLocalTax: true },
  NH: { state: 'New Hampshire', rate: 0.00, hasLocalTax: false }, // No sales tax
  NJ: { state: 'New Jersey', rate: 0.06625, hasLocalTax: false },
  NM: { state: 'New Mexico', rate: 0.05125, hasLocalTax: true },
  NY: { state: 'New York', rate: 0.04, hasLocalTax: true },
  NC: { state: 'North Carolina', rate: 0.0475, hasLocalTax: true },
  ND: { state: 'North Dakota', rate: 0.05, hasLocalTax: true },
  OH: { state: 'Ohio', rate: 0.0575, hasLocalTax: true },
  OK: { state: 'Oklahoma', rate: 0.045, hasLocalTax: true },
  OR: { state: 'Oregon', rate: 0.00, hasLocalTax: false }, // No sales tax
  PA: { state: 'Pennsylvania', rate: 0.06, hasLocalTax: true },
  RI: { state: 'Rhode Island', rate: 0.07, hasLocalTax: false },
  SC: { state: 'South Carolina', rate: 0.06, hasLocalTax: true },
  SD: { state: 'South Dakota', rate: 0.045, hasLocalTax: true },
  TN: { state: 'Tennessee', rate: 0.07, hasLocalTax: true },
  TX: { state: 'Texas', rate: 0.0625, hasLocalTax: true },
  UT: { state: 'Utah', rate: 0.0485, hasLocalTax: true },
  VT: { state: 'Vermont', rate: 0.06, hasLocalTax: true },
  VA: { state: 'Virginia', rate: 0.053, hasLocalTax: true },
  WA: { state: 'Washington', rate: 0.065, hasLocalTax: true },
  WV: { state: 'West Virginia', rate: 0.06, hasLocalTax: true },
  WI: { state: 'Wisconsin', rate: 0.05, hasLocalTax: true },
  WY: { state: 'Wyoming', rate: 0.04, hasLocalTax: true },
  DC: { state: 'District of Columbia', rate: 0.06, hasLocalTax: false },
};

export interface TaxCalculationInput {
  subtotal: number;
  state: string; // 2-letter state code
  zipCode?: string;
  city?: string;
}

export interface TaxCalculationResult {
  taxAmount: number;
  taxRate: number;
  stateName: string;
  breakdown: {
    stateTax: number;
    estimatedLocalTax: number;
  };
  note?: string;
}

/**
 * Calculate US sales tax based on state
 * @param input - Tax calculation parameters
 * @returns Tax calculation result with breakdown
 */
export function calculateTaxUS(input: TaxCalculationInput): TaxCalculationResult {
  const { subtotal, state } = input;

  // Validate state code
  const stateCode = state.toUpperCase();
  const taxInfo = US_STATE_TAX_RATES[stateCode];

  if (!taxInfo) {
    throw new Error(`Invalid US state code: ${state}`);
  }

  // Calculate state tax
  const stateTax = Number((subtotal * taxInfo.rate).toFixed(2));

  // Estimate local tax (conservative 2% for states with local tax)
  // In production, integrate with TaxJar or Avalara for exact local rates
  const estimatedLocalTaxRate = taxInfo.hasLocalTax ? 0.02 : 0;
  const estimatedLocalTax = Number((subtotal * estimatedLocalTaxRate).toFixed(2));

  const totalTaxAmount = Number((stateTax + estimatedLocalTax).toFixed(2));
  const effectiveTaxRate = subtotal > 0 ? totalTaxAmount / subtotal : 0;

  const result: TaxCalculationResult = {
    taxAmount: totalTaxAmount,
    taxRate: Number(effectiveTaxRate.toFixed(4)),
    stateName: taxInfo.state,
    breakdown: {
      stateTax,
      estimatedLocalTax,
    },
  };

  // Add notes for special cases
  if (taxInfo.rate === 0) {
    result.note = `${taxInfo.state} does not have state sales tax.`;
  } else if (taxInfo.hasLocalTax && !input.zipCode) {
    result.note = `Estimated local tax included. Provide ZIP code for exact calculation.`;
  }

  return result;
}

/**
 * Get tax rate for a state without calculating amount
 * @param state - 2-letter state code
 * @returns Tax rate information
 */
export function getTaxRate(state: string): TaxRate {
  const stateCode = state.toUpperCase();
  const taxInfo = US_STATE_TAX_RATES[stateCode];

  if (!taxInfo) {
    throw new Error(`Invalid US state code: ${state}`);
  }

  return taxInfo;
}

/**
 * Validate if a state code is valid
 * @param state - 2-letter state code
 * @returns boolean
 */
export function isValidStateCode(state: string): boolean {
  return state.toUpperCase() in US_STATE_TAX_RATES;
}
