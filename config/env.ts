/**
 * Environment Variable Validation
 * Validates all required environment variables are present at build/runtime
 */

interface EnvConfig {
  // Firebase Client (Public)
  NEXT_PUBLIC_FIREBASE_API_KEY: string;
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  NEXT_PUBLIC_FIREBASE_APP_ID: string;

  // Firebase Admin (Server-only)
  FIREBASE_CLIENT_EMAIL?: string;
  FIREBASE_PRIVATE_KEY?: string;

  // Stripe
  STRIPE_SECRET_KEY?: string;
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;

  // Application
  NEXT_PUBLIC_SITE_URL: string;
}

/**
 * Validates that all required environment variables are present
 * Throws error with helpful message if any are missing
 */
export function validateEnv(): EnvConfig {
  const isBrowser = typeof window !== 'undefined';
  
  // Required in all environments
  const requiredPublic = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_SITE_URL',
  ];

  // Required on server only
  const requiredServer = isBrowser ? [] : [
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  const missing: string[] = [];

  // Check public variables
  requiredPublic.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // Check server variables (only in Node.js environment)
  requiredServer.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    const message = [
      '❌ Missing required environment variables:',
      ...missing.map(v => `   - ${v}`),
      '',
      '📝 Please check your .env.local file and ensure all variables are set.',
      '💡 See .env.example for the complete list of required variables.',
    ].join('\n');

    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    } else {
      console.warn('\n' + message + '\n');
    }
  }

  return process.env as unknown as EnvConfig;
}

/**
 * Get validated environment config
 * Safe to use throughout the application
 */
export const env = validateEnv();

/**
 * Helper to check if we're in development mode
 */
export const isDev = process.env.NODE_ENV === 'development';

/**
 * Helper to check if we're in production mode
 */
export const isProd = process.env.NODE_ENV === 'production';

/**
 * Helper to check if we're running on the server
 */
export const isServer = typeof window === 'undefined';
