import { adminDb, adminAuth } from './firebase/firebaseAdmin';

const targetEmail = 'shadikamal21@gmail.com';

async function setAdminRole() {
  try {
    console.log(`🔍 Looking for user: ${targetEmail}`);
    
    // Get user from Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(targetEmail);
    console.log(`✅ Found user in Auth:`, {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified
    });
    
    // Update Firestore document
    const userRef = adminDb.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      console.log('📄 Current user data:', userDoc.data());
      
      await userRef.update({
        role: 'owner',
        updatedAt: new Date()
      });
      
      console.log('✅ Successfully updated role to "owner"');
    } else {
      console.log('📝 User document does not exist, creating it...');
      
      await userRef.set({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || 'Admin',
        role: 'owner',
        enrolledCourses: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Successfully created user document with role "owner"');
    }
    
    // Verify the update
    const updatedDoc = await userRef.get();
    console.log('🎉 Final user data:', updatedDoc.data());
    
    console.log('\n✅ Done! You can now sign in as admin.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setAdminRole();
