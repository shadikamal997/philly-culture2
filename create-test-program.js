const fs = require('fs');
const admin = require('firebase-admin');

// Load environment variables from .env.local
if (fs.existsSync('./.env.local')) {
  const envContent = fs.readFileSync('./.env.local', 'utf8');
  const envLines = envContent.split('\n');

  envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        process.env[key.trim()] = value.slice(1, -1);
      } else {
        process.env[key.trim()] = value;
      }
    }
  });
}

// Initialize Firebase Admin with environment variables
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

console.log('Project ID:', projectId ? 'Set' : 'Missing');
console.log('Client Email:', clientEmail ? 'Set' : 'Missing');
console.log('Private Key length:', privateKey ? privateKey.length : 0);

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase credentials');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  }),
});

const db = admin.firestore();

async function createTestProgram() {
  try {
    const programData = {
      title: 'Test Culinary Program',
      shortDescription: 'A test program for enrollment testing',
      fullDescription: 'This is a comprehensive test program to verify the enrollment system works correctly.',
      instructorName: 'Chef Test',
      basePrice: 99.99,
      programType: 'intensive',
      category: 'culinary',
      difficultyLevel: 'beginner',
      published: true,
      featured: false,
      totalHours: 10,
      language: 'en',
      videoIntroUrl: '',
      prerequisites: 'None',
      learningObjectives: 'Learn basic cooking skills',
      tags: 'test,cooking',
      maxStudents: 100,
      certificateEnabled: true,
      unlockType: 'instant',
      accessDuration: 0, // lifetime
      dripInterval: 1,
      isCohort: false,
      startDate: null,
      enrollmentDeadline: null,
      slug: 'test-culinary-program',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('programs').add(programData);
    console.log('✅ Test program created with ID:', docRef.id);
    console.log('Program slug:', programData.slug);
    console.log('Program URL: http://localhost:3002/programs/test-culinary-program');

  } catch (error) {
    console.error('❌ Error creating test program:', error);
  } finally {
    process.exit(0);
  }
}

createTestProgram();