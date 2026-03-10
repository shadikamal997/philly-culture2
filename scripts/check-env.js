#!/usr/bin/env node

/**
 * Quick Environment Variable Checker
 * Run: node scripts/check-env.js
 */

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
];

const optionalVars = [
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_APP_URL',
];

console.log('\n🔍 Checking Environment Variables...\n');

let missing = [];
let present = [];
let optional = [];

requiredVars.forEach(varName => {
  if (process.env[varName]) {
    present.push(varName);
    
    // Show truncated value for verification
    let value = process.env[varName];
    let display = value.length > 40 
      ? value.substring(0, 20) + '...' + value.substring(value.length - 10)
      : value;
    
    console.log(`✅ ${varName}`);
    console.log(`   ${display}\n`);
  } else {
    missing.push(varName);
    console.log(`❌ ${varName} - MISSING\n`);
  }
});

console.log('\n📋 Optional Variables:\n');

optionalVars.forEach(varName => {
  if (process.env[varName]) {
    optional.push(varName);
    console.log(`✅ ${varName} - Set`);
  } else {
    console.log(`⚠️  ${varName} - Not set`);
  }
});

console.log('\n====================================\n');
console.log(`✅ Present: ${present.length}/${requiredVars.length} required`);
console.log(`⚠️  Optional: ${optional.length}/${optionalVars.length}`);

if (missing.length > 0) {
  console.log(`\n❌ Missing ${missing.length} required variable(s):\n`);
  missing.forEach(v => console.log(`   - ${v}`));
  console.log('\n📖 See FIREBASE_SETUP_GUIDE.md for setup instructions\n');
  process.exit(1);
} else {
  console.log('\n🎉 All required environment variables are set!\n');
  console.log('Next steps:');
  console.log('  1. Run: npm run dev');
  console.log('  2. Visit: http://localhost:3000');
  console.log('  3. Test registration at: http://localhost:3000/register\n');
  process.exit(0);
}
