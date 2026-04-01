#!/usr/bin/env node
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Load service account from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function checkOwner() {
  console.log('🔍 Checking for owner user in Firestore...\n');

  // Check environment variable (you'll need to set this in Vercel)
  const expectedOwnerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'owner@phillycultrue.com';
  console.log(`📧 Expected owner email: ${expectedOwnerEmail}\n`);

  try {
    // Query for users with owner role
    const ownersSnapshot = await db.collection('users')
      .where('role', 'in', ['owner', 'superadmin'])
      .get();

    if (ownersSnapshot.empty) {
      console.log('❌ NO OWNER FOUND IN DATABASE!');
      console.log('\n⚠️  This means chat creation will FAIL during enrollment.');
      console.log('\n📝 To fix this:');
      console.log('   1. Make sure you have signed up with your owner email');
      console.log('   2. Run: npm run set-admin <your-email> owner');
      console.log('   3. Or manually set role="owner" in Firebase Console\n');
      return;
    }

    console.log(`✅ Found ${ownersSnapshot.docs.length} owner/admin user(s):\n`);
    
    let foundExpectedOwner = false;
    
    ownersSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const isExpected = data.email === expectedOwnerEmail;
      
      if (isExpected) foundExpectedOwner = true;
      
      console.log(`${isExpected ? '✅' : '📋'} UID: ${doc.id}`);
      console.log(`   Email: ${data.email}`);
      console.log(`   Name: ${data.displayName || data.fullName || 'N/A'}`);
      console.log(`   Role: ${data.role}`);
      console.log('');
    });

    if (foundExpectedOwner) {
      console.log('✅ PERFECT! Your owner email is properly configured.');
      console.log('   💬 Chat system will work correctly!\n');
    } else {
      console.log('⚠️  WARNING: Expected owner email not found!');
      console.log(`   Expected: ${expectedOwnerEmail}`);
      console.log('\n   You have two options:');
      console.log('   1. Update NEXT_PUBLIC_OWNER_EMAIL to match an existing owner email above');
      console.log('   2. Set the role="owner" for your actual email address\n');
    }

    // Check if expected email exists in users collection at all
    const userQuery = await db.collection('users')
      .where('email', '==', expectedOwnerEmail)
      .get();

    if (userQuery.empty) {
      console.log(`❌ Email ${expectedOwnerEmail} does NOT exist in users collection`);
      console.log('   → This user needs to sign up first!\n');
    } else {
      const userData = userQuery.docs[0].data();
      console.log(`✅ Email ${expectedOwnerEmail} exists with role: ${userData.role}`);
      if (userData.role !== 'owner' && userData.role !== 'superadmin') {
        console.log('   ⚠️  But role needs to be "owner" or "superadmin"!\n');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkOwner().then(() => process.exit(0));
