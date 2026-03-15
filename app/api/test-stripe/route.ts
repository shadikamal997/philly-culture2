import { NextResponse } from 'next/server';

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return NextResponse.json({
    hasStripeKey: !!stripeKey,
    keyLength: stripeKey?.length || 0,
    keyPrefix: stripeKey?.substring(0, 15) || 'none',
    keySuffix: stripeKey?.substring(stripeKey.length - 4) || 'none',
    hasWhitespace: /\s/.test(stripeKey || ''),
    
    hasPublishableKey: !!publishableKey,
    pubKeyLength: publishableKey?.length || 0,
    pubKeyPrefix: publishableKey?.substring(0, 15) || 'none',
    pubKeySuffix: publishableKey?.substring(publishableKey.length - 4) || 'none',
    
    // Expected values
    expectedSecretLength: 107,
    expectedPubLength: 107,
  });
}
