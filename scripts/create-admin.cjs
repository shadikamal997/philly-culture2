/* eslint-disable */
const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
}

const db = admin.firestore();
const auth = admin.auth();

async function createAdmin() {
  const email = 'B13njn@gmail.com';
  const password = 'moOD123@';
  const name = 'Admin';
  const role = 'admin';

  let uid;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    console.log('User already exists, updating role...', uid);
  } catch {
    const newUser = await auth.createUser({ email, password, displayName: name });
    uid = newUser.uid;
    console.log('Created new Firebase Auth user:', uid);
  }

  // Set admin custom claim
  await auth.setCustomUserClaims(uid, { role });
  console.log('Custom claims set: { role: admin }');

  // Upsert Firestore profile
  await db.collection('users').doc(uid).set({
    uid,
    email,
    name,
    role,
    purchasedCourses: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log('Firestore profile saved.');
  console.log('');
  console.log('✅ Admin account ready!');
  console.log('   Email:   ', email);
  console.log('   Role:    ', role);
  console.log('   UID:     ', uid);
  process.exit(0);
}

createAdmin().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
