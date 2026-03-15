import { NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';

export async function GET() {
  try {
    console.log('[Firebase Test] Starting test...');
    
    // Test 1: Check environment variables
    const envCheck = {
      hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    };

    console.log('[Firebase Test] Environment check:', envCheck);

    // Test 2: Try to fetch programs
    const programsSnapshot = await adminDb
      .collection('programs')
      .where('published', '==', true)
      .get();

    const programs = programsSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      published: doc.data().published,
    }));

    console.log('[Firebase Test] Programs found:', programs.length);

    return NextResponse.json({
      success: true,
      environment: envCheck,
      programsCount: programs.length,
      programs: programs,
      message: 'Firebase connection successful!',
    });
  } catch (error: any) {
    console.error('[Firebase Test] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      environment: {
        hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
        hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      }
    }, { status: 500 });
  }
}
