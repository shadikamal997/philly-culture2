import { NextRequest, NextResponse } from 'next/server';

interface ShippingCalculationRequest {
  items: Array<{
    weight?: number; // in pounds
    quantity: number;
  }>;
  address: {
    state: string;
    zipCode: string;
  };
  method?: 'standard' | 'expedited' | 'overnight';
}

interface ShippingCalculationResponse {
  cost: number;
  estimatedDays: string;
  method: string;
  zone: string;
}

// Shipping zones based on distance from Pennsylvania (Philly Culture is based in Philly)
const SHIPPING_ZONES: Record<string, string> = {
  // Zone 1 - Local (Pennsylvania)
  PA: 'zone1',
  
  // Zone 2 - Regional (neighboring states)
  NJ: 'zone2',
  DE: 'zone2',
  MD: 'zone2',
  NY: 'zone2',
  WV: 'zone2',
  OH: 'zone2',
  
  // Zone 3 - Extended (Northeast + nearby)
  CT: 'zone3',
  RI: 'zone3',
  MA: 'zone3',
  VT: 'zone3',
  NH: 'zone3',
  ME: 'zone3',
  VA: 'zone3',
  NC: 'zone3',
  SC: 'zone3',
  KY: 'zone3',
  IN: 'zone3',
  MI: 'zone3',
  
  // Zone 4 - Southeast + Midwest
  GA: 'zone4',
  FL: 'zone4',
  AL: 'zone4',
  MS: 'zone4',
  TN: 'zone4',
  IL: 'zone4',
  WI: 'zone4',
  
  // Zone 5 - Central + Mountain
  MO: 'zone5',
  AR: 'zone5',
  LA: 'zone5',
  IA: 'zone5',
  MN: 'zone5',
  ND: 'zone5',
  SD: 'zone5',
  NE: 'zone5',
  KS: 'zone5',
  OK: 'zone5',
  TX: 'zone5',
  CO: 'zone5',
  WY: 'zone5',
  MT: 'zone5',
  ID: 'zone5',
  UT: 'zone5',
  
  // Zone 6 - West Coast
  WA: 'zone6',
  OR: 'zone6',
  CA: 'zone6',
  NV: 'zone6',
  AZ: 'zone6',
  NM: 'zone6',
  
  // Zone 6 - Non-contiguous
  AK: 'zone6',
  HI: 'zone6',
  DC: 'zone2', // Treat DC as Zone 2
};

// Base shipping rates per zone (for 1-5 lbs)
const BASE_RATES: Record<string, { standard: number; expedited: number; overnight: number }> = {
  zone1: { standard: 5.99, expedited: 12.99, overnight: 25.99 },
  zone2: { standard: 7.99, expedited: 15.99, overnight: 32.99 },
  zone3: { standard: 9.99, expedited: 18.99, overnight: 39.99 },
  zone4: { standard: 11.99, expedited: 21.99, overnight: 45.99 },
  zone5: { standard: 13.99, expedited: 24.99, overnight: 52.99 },
  zone6: { standard: 15.99, expedited: 29.99, overnight: 65.99 },
};

// Estimated delivery days
const DELIVERY_ESTIMATES: Record<string, { standard: string; expedited: string; overnight: string }> = {
  zone1: { standard: '2-3 business days', expedited: '1-2 business days', overnight: 'Next business day' },
  zone2: { standard: '3-4 business days', expedited: '2 business days', overnight: 'Next business day' },
  zone3: { standard: '4-5 business days', expedited: '2-3 business days', overnight: 'Next business day' },
  zone4: { standard: '5-6 business days', expedited: '3-4 business days', overnight: '1-2 business days' },
  zone5: { standard: '6-7 business days', expedited: '4-5 business days', overnight: '1-2 business days' },
  zone6: { standard: '7-10 business days', expedited: '5-6 business days', overnight: '2-3 business days' },
};

export async function GET() {
  return NextResponse.json({ 
    message: 'Shipping calculation endpoint. Use POST with order details.',
    version: '1.0.0',
    zones: Object.keys(BASE_RATES),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: ShippingCalculationRequest = await req.json();
    const { items, address, method = 'standard' } = body;

    // Validate request
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    if (!address || !address.state) {
      return NextResponse.json(
        { error: 'Valid address with state is required' },
        { status: 400 }
      );
    }

    // Get shipping zone
    const stateCode = address.state.toUpperCase();
    const zone = SHIPPING_ZONES[stateCode] || 'zone6'; // Default to most expensive if state not found

    // Calculate total weight
    let totalWeight = 0;
    for (const item of items) {
      const itemWeight = item.weight || 1; // Default 1 lb per item if not specified
      totalWeight += itemWeight * item.quantity;
    }

    // Get base rate for zone and method
    const baseRate = BASE_RATES[zone]?.[method] || BASE_RATES['zone6'][method];

    // Add weight surcharge for heavy packages (over 5 lbs)
    let weightSurcharge = 0;
    if (totalWeight > 5) {
      const extraWeight = totalWeight - 5;
      weightSurcharge = extraWeight * 1.50; // $1.50 per lb over 5 lbs
    }

    // Calculate final cost
    const shippingCost = Number((baseRate + weightSurcharge).toFixed(2));

    // Get delivery estimate
    const estimatedDays = DELIVERY_ESTIMATES[zone]?.[method] || DELIVERY_ESTIMATES['zone6'][method];

    const response: ShippingCalculationResponse = {
      cost: shippingCost,
      estimatedDays,
      method: method.charAt(0).toUpperCase() + method.slice(1),
      zone,
    };

    return NextResponse.json({
      success: true,
      shipping: response,
      details: {
        totalWeight: Number(totalWeight.toFixed(2)),
        baseRate,
        weightSurcharge: Number(weightSurcharge.toFixed(2)),
      },
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
}