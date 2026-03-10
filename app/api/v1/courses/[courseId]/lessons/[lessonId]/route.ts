import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';

// Helper to verify auth token
async function getUserFromToken(req: NextRequest): Promise<{ uid: string } | null> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    
    try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);
        return { uid: decodedToken.uid };
    } catch {
        return null;
    }
}

/**
 * GET /api/v1/courses/[courseId]/lessons/[lessonId]
 * Securely fetch a specific lesson (requires enrollment verification)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  try {
    // 1. Authenticate user
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Verify course exists
    const courseDoc = await adminDb.collection('courses').doc(params.courseId).get();
    
    if (!courseDoc.exists) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // 3. Verify user has access to course (server-side check)
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isAdmin = userData.role === 'admin' || userData.role === 'owner';
    const purchasedCourses = userData.purchasedCourses || [];
    const hasAccess = purchasedCourses.includes(params.courseId);

    if (!isAdmin && !hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this course. Please purchase it first.' },
        { status: 403 }
      );
    }

    // 4. Fetch the lesson
    const lessonDoc = await adminDb
      .collection('courses')
      .doc(params.courseId)
      .collection('lessons')
      .doc(params.lessonId)
      .get();

    if (!lessonDoc.exists) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // 5. Return lesson data
    const lessonData = lessonDoc.data();
    return NextResponse.json({
      id: lessonDoc.id,
      ...lessonData,
    });

  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson' },
      { status: 500 }
    );
  }
}
