/**
 * Environment variable validation for production safety
 * Run this on server startup to catch missing env vars early
 */

interface EnvConfig {
  name: string;
  required: boolean;
  description: string;
  secret?: boolean; // Should not be logged
}

const ENV_VARS: EnvConfig[] = [
  // Firebase Client (Public)
  {
    name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
    required: true,
    description: 'Firebase Web API Key',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    required: true,
    description: 'Firebase Auth Domain',
  },
  {
    name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    required: true,
    description: 'Firebase Project ID',
  },
  
  // Firebase Admin (Server-side only)
  {
    name: 'FIREBASE_ADMIN_PROJECT_ID',
    required: true,
    description: 'Firebase Admin Project ID',
  },
  {
    name: 'FIREBASE_ADMIN_CLIENT_EMAIL',
    required: true,
    description: 'Firebase Admin Service Account Email',
  },
  {
    name: 'FIREBASE_ADMIN_PRIVATE_KEY',
    required: true,
    description: 'Firebase Admin Private Key',
    secret: true,
  },
  
  // Stripe
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    description: 'Stripe Publishable Key (Test or Live)',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe Secret Key (Test or Live)',
    secret: true,
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    description: 'Stripe Webhook Signing Secret',
    secret: true,
  },
  
  // App Config
  {
    name: 'NEXT_PUBLIC_APP_URL',
    required: false,
    description: 'Public app URL (for webhooks and emails)',
  },
];

interface ValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  mode: 'development' | 'production' | 'test';
}

export function validateEnv(): ValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  const mode = (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test';
  
  for (const config of ENV_VARS) {
    const value = process.env[config.name];
    
    if (!value || value === '' || value.startsWith('demo')) {
      if (config.required) {
        missing.push(config.name);
      } else {
        warnings.push(`Optional env var missing: ${config.name} - ${config.description}`);
      }
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    warnings,
    mode,
  };
}

export function logEnvStatus(): void {
  const result = validateEnv();
  
  console.log('\n🔐 Environment Variable Check');
  console.log('━'.repeat(50));
  console.log(`Mode: ${result.mode.toUpperCase()}`);
  
  if (result.valid) {
    console.log('✅ All required environment variables are set');
  } else {
    console.error('❌ Missing required environment variables:');
    result.missing.forEach(name => {
      const config = ENV_VARS.find(c => c.name === name);
      console.error(`   - ${name}: ${config?.description || 'Unknown'}`);
    });
  }
  
  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Optional environment variables:');
    result.warnings.forEach(warning => console.warn(`   ${warning}`));
  }
  
  // Security warnings
  console.log('\n🔒 Security Status:');
  
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  if (stripeKey.includes('pk_test')) {
    console.warn('   ⚠️  Using Stripe TEST mode');
  } else if (stripeKey.includes('pk_live')) {
    console.log('   ✅ Using Stripe LIVE mode');
  }
  
  if (result.mode === 'production' && !result.valid) {
    console.error('\n❌ CRITICAL: Cannot run in production with missing env vars!');
  }
  
  console.log('━'.repeat(50) + '\n');
}

/**
 * Throw error if required env vars are missing in production
 */
export function enforceRequiredEnv(): void {
  const result = validateEnv();
  
  if (!result.valid && result.mode === 'production') {
    throw new Error(
      `Missing required environment variables in production: ${result.missing.join(', ')}`
    );
  }
}

/**
 * Check if app is running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if Stripe is in live mode
 */
export function isStripeLiveMode(): boolean {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  return key.includes('pk_live');
}

/**
 * Get safe env var for logging (masks secrets)
 */
export function getSafeEnvValue(name: string): string {
  const config = ENV_VARS.find(c => c.name === name);
  const value = process.env[name];
  
  if (!value) return '<not set>';
  if (config?.secret) return '<hidden>';
  
  // Mask API keys partially
  if (value.length > 20) {
    return value.substring(0, 8) + '...' + value.substring(value.length - 4);
  }
  
  return value;
}
