// Check user email verification status
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

console.log('🔍 Checking auth for current user...');
console.log('Auth instance:', auth);
console.log('Current user:', auth.currentUser);

if (auth.currentUser) {
  console.log('✅ User found:');
  console.log('  Email:', auth.currentUser.email);
  console.log('  Email Verified:', auth.currentUser.emailVerified);
  console.log('  UID:', auth.currentUser.uid);
  
  // Check Firestore
  const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
  if (userDoc.exists()) {
    console.log('  Firestore role:', userDoc.data().role);
  }
} else {
  console.log('❌ No authenticated user found');
}
