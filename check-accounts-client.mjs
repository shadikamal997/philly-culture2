import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Initialize Firebase with environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkUserData(email) {
  console.log(`\n========== Checking ${email} ==========`);
  
  try {
    // Sign in temporarily to get the user
    const password = process.argv[2]; // Pass password as argument
    if (!password) {
      console.log('⚠️  Skipping - no password provided');
      return;
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('\n📧 Firebase Auth:');
    console.log('  UID:', user.uid);
    console.log('  Email:', user.email);
    console.log('  Email Verified:', user.emailVerified);
    
    // Get Firestore data
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      console.log('\n📄 Firestore Data:');
      const data = userDoc.data();
      console.log('  Email:', data.email);
      console.log('  Role:', data.role);
      console.log('  Name:', data.name || 'Not set');
      console.log('\n  All fields:', Object.keys(data).join(', '));
      console.log('\n  Full document:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ NO FIRESTORE DOCUMENT!');
    }
    
    await auth.signOut();
    
  } catch (error) {
    console.error(`❌ Error:`, error.code, error.message);
  }
}

// For now, just show what we need to check
console.log('\n🔍 Account Diagnostic Required\n');
console.log('We need to check why shadikamal21@gmail.com causes a loop.\n');
console.log('Possible causes:');
console.log('  1. Missing Firestore document');
console.log('  2. Invalid role in Firestore');
console.log('  3. Corrupted user data');
console.log('  4. Email not verified in Firebase Auth');
console.log('  5. Stale session cookies for this specific account');

console.log('\n\n💡 IMMEDIATE FIX: Clear ALL cookies and try again\n');
