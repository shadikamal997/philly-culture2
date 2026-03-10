import { NextRequest, NextResponse } from 'next/server';
import { taxService } from '@/services/taxService';

export async function GET() {
  return NextResponse.json({ 
    message: 'Tax calculation endpoint. Use POST with order details.',
    version: '1.0.0',
    provider: 'internal' 
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, address, shipping } = body;

    // Validate request
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    // Validate address format
    const validation = taxService.validateAddress(address);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid address', details: validation.errors },
        { status: 400 }
      );
    }

    // Calculate tax
    const taxResult = await taxService.calculateTax({
      amount,
      address,
      shipping: shipping || 0,
      currency: 'usd',
    });

    return NextResponse.json({
      success: true,
      tax: taxResult,
    });

  } catch (error) {
    console.error('Error in tax calculation:', error);
    return NextResponse.json(
      { 
        error: 'Tax calculation failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}