import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Load .env.local
const env = readFileSync('.env.local', 'utf8');
const vars = {};
for (const line of env.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) vars[m[1].trim()] = m[2].trim().replace(/^"|"$/g, '');
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: vars.FIREBASE_PROJECT_ID,
      clientEmail: vars.FIREBASE_CLIENT_EMAIL,
      privateKey: vars.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const auth = getAuth();
const db = getFirestore();

const toDelete = [
  { email: 'owner@philllyculture.com', uid: 'rer2B1JWqZUG9IvaaRaSu01lyJp2' },
  { email: 'shadialblaawe@gmail.com',  uid: 'VNTmZloHyPcq176Wm9fZNYBcDcT2' },
];

for (const account of toDelete) {
  try {
    await auth.deleteUser(account.uid);
    console.log(`✅ Deleted from Auth: ${account.email}`);
  } catch (e) {
    console.log(`⚠️  Auth delete failed for ${account.email}: ${e.message}`);
  }
  try {
    await db.collection('users').doc(account.uid).delete();
    console.log(`✅ Deleted from Firestore: ${account.email}`);
  } catch (e) {
    console.log(`⚠️  Firestore delete failed for ${account.email}: ${e.message}`);
  }
}

console.log('\nDone. Remaining admins:');
console.log('  OWNER  shadikamal21@gmail.com');
console.log('  ADMIN  B13njn@gmail.com');
