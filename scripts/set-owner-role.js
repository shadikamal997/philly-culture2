const admin = require('firebase-admin');

// Initialize Firebase Admin
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

if (!projectId) {
  console.error('❌ Missing FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  process.exit(1);
}

if (!clientEmail || !privateKey) {
  console.error('❌ Missing Firebase admin credentials');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function setOwnerRole() {
  try {
    const ownerEmail = 'owner@philllyculture.com';

    console.log('Looking up owner user by email...');

    // Get user by email
    const userRecord = await auth.getUserByEmail(ownerEmail);
    const uid = userRecord.uid;

    console.log('Found owner user:', uid);

    // Check current user data
    const userDoc = await db.collection('users').doc(uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('Current user data:', userData);

      if (userData?.role !== 'owner') {
        console.log('Updating role to owner...');
        await db.collection('users').doc(uid).update({
          role: 'owner',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Set custom claims
        await auth.setCustomUserClaims(uid, { role: 'owner' });

        console.log('✅ Owner role set successfully!');
      } else {
        console.log('✅ User already has owner role');
      }
    } else {
      console.log('❌ User document does not exist in Firestore');
      console.log('Creating user document with owner role...');

      await db.collection('users').doc(uid).set({
        uid: uid,
        email: ownerEmail,
        name: 'Owner',
        role: 'owner',
        purchasedCourses: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Set custom claims
      await auth.setCustomUserClaims(uid, { role: 'owner' });

      console.log('✅ Owner user document created with owner role!');
    }

  } catch (error) {
    console.error('❌ Error setting owner role:', error);
    process.exit(1);
  }
}

setOwnerRole();