// Verify email for shadikamal21@gmail.com
import admin from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps || admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();

async function checkAndVerifyEmail() {
  const email = 'shadikamal21@gmail.com';
  
  try {
    const user = await auth.getUserByEmail(email);
    console.log('\n📧 User found:', email);
    console.log('UID:', user.uid);
    console.log('Email Verified:', user.emailVerified);
    console.log('Creation Time:', user.metadata.creationTime);
    
    if (!user.emailVerified) {
      console.log('\n⚠️  Email is NOT verified - fixing this now...');
      await auth.updateUser(user.uid, {
        emailVerified: true
      });
      console.log('✅ Email verification status updated to TRUE');
      console.log('🎉 You can now log in!');
    } else {
      console.log('\n✅ Email is already verified');
    }
    
    // Also check Firestore role
    const db = admin.firestore();
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (userDoc.exists) {
      console.log('\nFirestore Data:');
      console.log('  Role:', userDoc.data().role);
      console.log('  Email:', userDoc.data().email);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAndVerifyEmail();
