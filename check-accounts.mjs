import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

async function checkAccount(email) {
  console.log(`\n\n========== Checking ${email} ==========`);
  
  try {
    // Get Firebase Auth user
    const authUser = await auth.getUserByEmail(email);
    console.log('\n📧 Firebase Auth Data:');
    console.log('  UID:', authUser.uid);
    console.log('  Email:', authUser.email);
    console.log('  Email Verified:', authUser.emailVerified);
    console.log('  Created:', new Date(authUser.metadata.creationTime));
    console.log('  Last Sign In:', new Date(authUser.metadata.lastSignInTime));
    console.log('  Custom Claims:', authUser.customClaims || 'None');
    
    // Get Firestore user data
    const userDoc = await db.collection('users').doc(authUser.uid).get();
    
    if (userDoc.exists) {
      console.log('\n📄 Firestore Data:');
      const data = userDoc.data();
      console.log('  Email:', data.email);
      console.log('  Role:', data.role);
      console.log('  Name:', data.name || 'Not set');
      console.log('  All fields:', Object.keys(data));
      console.log('  Full data:', JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ NO FIRESTORE DOCUMENT FOUND!');
      console.log('   This user exists in Firebase Auth but not in Firestore!');
    }
    
  } catch (error) {
    console.error(`\n❌ Error checking ${email}:`, error.message);
  }
}

// Check both accounts
await checkAccount('shadialblaawe@gmail.com');
await checkAccount('shadikamal21@gmail.com');

console.log('\n\n✅ Account comparison complete');
