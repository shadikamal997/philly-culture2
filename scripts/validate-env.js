#!/usr/bin/env node

/**
 * Environment variable validation script
 * Run before deployment: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '../.env.local');

const REQUIRED_VARS = [
  // Firebase Client
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  
  // Firebase Admin
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  
  // Stripe
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
];

const OPTIONAL_VARS = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
];

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const vars = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    
    if (key && value) {
      vars[key.trim()] = value.trim();
    }
  });
  
  return vars;
}

function validateEnv() {
  console.log('🔍 Validating environment variables...\n');
  
  const envVars = {
    ...parseEnvFile(ENV_FILE),
    ...process.env,
  };
  
  const missing = [];
  const warnings = [];
  
  // Check required vars
  REQUIRED_VARS.forEach(varName => {
    const value = envVars[varName];
    if (!value || value === '' || value.startsWith('demo')) {
      missing.push(varName);
    }
  });
  
  // Check optional vars
  OPTIONAL_VARS.forEach(varName => {
    const value = envVars[varName];
    if (!value || value === '') {
      warnings.push(varName);
    }
  });
  
  // Results
  if (missing.length === 0) {
    console.log('✅ All required environment variables are set\n');
  } else {
    console.error('❌ Missing required environment variables:\n');
    missing.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('');
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:\n');
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.warn('');
  }
  
  // Check Stripe mode
  const stripeKey = envVars['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'] || '';
  if (stripeKey.includes('pk_test')) {
    console.warn('🧪 Using Stripe TEST mode\n');
  } else if (stripeKey.includes('pk_live')) {
    console.log('💰 Using Stripe LIVE mode\n');
  }
  
  // Check Node environment
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`📦 Node environment: ${nodeEnv.toUpperCase()}\n`);
  
  // Exit with error if missing vars in production
  if (missing.length > 0 && nodeEnv === 'production') {
    console.error('❌ CRITICAL: Cannot run in production with missing environment variables!\n');
    process.exit(1);
  }
  
  if (missing.length > 0) {
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed\n');
}

validateEnv();
