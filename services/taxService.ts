import { calculateTaxUS, TaxCalculationInput, TaxCalculationResult } from '@/lib/calculateTaxUS';
import { stripe } from './stripeService';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface TaxCalculationRequest {
  amount: number;
  currency?: string;
  address: Address;
  shipping?: number;
}

export interface TaxCalculationResponse {
  tax_amount: number;
  tax_rate: number;
  breakdown: {
    state_tax: number;
    local_tax: number;
  };
  provider: 'internal' | 'stripe';
  metadata?: any;
}

/**
 * Tax Service
 * Handles tax calculations for orders using either internal rates or Stripe Tax
 */
export class TaxService {
  private useStripeTax: boolean = false; // Toggle for Stripe Tax integration

  /**
   * Calculate tax for an order
   * @param request - Tax calculation parameters
   * @returns Tax calculation result
   */
  async calculateTax(request: TaxCalculationRequest): Promise<TaxCalculationResponse> {
    // For non-US addresses, return 0 tax (expand for international support)
    if (request.address.country !== 'US') {
      return {
        tax_amount: 0,
        tax_rate: 0,
        breakdown: {
          state_tax: 0,
          local_tax: 0,
        },
        provider: 'internal',
        metadata: {
          note: 'International orders not yet supported for tax calculation',
        },
      };
    }

    // Use Stripe Tax if enabled (requires Stripe Tax activation)
    if (this.useStripeTax) {
      return await this.calculateWithStripeTax(request);
    }

    // Use internal calculation
    return this.calculateWithInternalRates(request);
  }

  /**
   * Calculate tax using internal US state rates
   * @param request - Tax calculation parameters
   * @returns Tax calculation result
   */
  private calculateWithInternalRates(request: TaxCalculationRequest): TaxCalculationResponse {
    try {
      const input: TaxCalculationInput = {
        subtotal: request.amount,
        state: request.address.state,
        zipCode: request.address.postal_code,
        city: request.address.city,
      };

      const result: TaxCalculationResult = calculateTaxUS(input);

      return {
        tax_amount: result.taxAmount,
        tax_rate: result.taxRate,
        breakdown: {
          state_tax: result.breakdown.stateTax,
          local_tax: result.breakdown.estimatedLocalTax,
        },
        provider: 'internal',
        metadata: {
          state_name: result.stateName,
          note: result.note,
        },
      };
    } catch (error) {
      console.error('Error calculating tax with internal rates:', error);
      // Fallback to 0 tax on error
      return {
        tax_amount: 0,
        tax_rate: 0,
        breakdown: {
          state_tax: 0,
          local_tax: 0,
        },
        provider: 'internal',
        metadata: {
          error: 'Tax calculation failed',
        },
      };
    }
  }

  /**
   * Calculate tax using Stripe Tax API
   * @param request - Tax calculation parameters
   * @returns Tax calculation result
   */
  private async calculateWithStripeTax(request: TaxCalculationRequest): Promise<TaxCalculationResponse> {
    try {
      // NOTE: This requires Stripe Tax to be enabled in your Stripe account
      // Uncomment and configure when ready to use Stripe Tax
      
      /*
      const calculation = await stripe.tax.calculations.create({
        currency: request.currency || 'usd',
        line_items: [
          {
            amount: Math.round(request.amount * 100), // Stripe uses cents
            reference: 'order_subtotal',
          },
        ],
        customer_details: {
          address: {
            line1: request.address.line1,
            line2: request.address.line2,
            city: request.address.city,
            state: request.address.state,
            postal_code: request.address.postal_code,
            country: request.address.country,
          },
          address_source: 'shipping',
        },
        shipping_cost: request.shipping ? {
          amount: Math.round(request.shipping * 100),
        } : undefined,
      });

      const taxAmount = calculation.tax_amount_exclusive / 100; // Convert from cents

      return {
        tax_amount: Number(taxAmount.toFixed(2)),
        tax_rate: calculation.tax_breakdown && calculation.tax_breakdown.length > 0 
          ? calculation.tax_breakdown[0].tax_rate_details?.percentage_decimal / 100 
          : 0,
        breakdown: {
          state_tax: taxAmount, // Stripe provides combined total
          local_tax: 0,
        },
        provider: 'stripe',
        metadata: {
          calculation_id: calculation.id,
          tax_breakdown: calculation.tax_breakdown,
        },
      };
      */

      // Fallback to internal rates if Stripe Tax not enabled
      console.warn('Stripe Tax not enabled, falling back to internal rates');
      return this.calculateWithInternalRates(request);
      
    } catch (error) {
      console.error('Error calculating tax with Stripe Tax:', error);
      // Fallback to internal rates
      return this.calculateWithInternalRates(request);
    }
  }

  /**
   * Enable or disable Stripe Tax integration
   * @param enabled - Whether to use Stripe Tax
   */
  setStripeTaxEnabled(enabled: boolean): void {
    this.useStripeTax = enabled;
  }

  /**
   * Validate a US address for tax calculation
   * @param address - Address to validate
   * @returns Validation result with errors if any
   */
  validateAddress(address: Address): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!address.line1) errors.push('Address line 1 is required');
    if (!address.city) errors.push('City is required');
    if (!address.state) errors.push('State is required');
    if (!address.postal_code) errors.push('ZIP code is required');
    if (!address.country) errors.push('Country is required');

    // Validate US state code format
    if (address.state && !/^[A-Z]{2}$/.test(address.state.toUpperCase())) {
      errors.push('State must be a 2-letter code (e.g., PA, NY, CA)');
    }

    // Validate US ZIP code format
    if (address.postal_code && !/^\d{5}(-\d{4})?$/.test(address.postal_code)) {
      errors.push('ZIP code must be in format 12345 or 12345-6789');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const taxService = new TaxService();
