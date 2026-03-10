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
 * POST /api/v1/courses/[courseId]/lessons/[lessonId]/complete
 * Mark a lesson as complete (requires enrollment verification)
 */
export async function POST(
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

    // 2. Verify user has access to course (server-side check)
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
        { error: 'You do not have access to this course' },
        { status: 403 }
      );
    }

    // 3. Verify lesson exists
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

    // 4. Get or create course progress
    const progressRef = adminDb
      .collection('users')
      .doc(user.uid)
      .collection('courseProgress')
      .doc(params.courseId);

    const progressDoc = await progressRef.get();
    const progressData = progressDoc.exists ? progressDoc.data() : null;

    const completedLessons = progressData?.completedLessons || [];

    // Check if already completed
    if (completedLessons.includes(params.lessonId)) {
      return NextResponse.json({
        message: 'Lesson already marked as complete',
        progress: progressData?.progress || 0,
      });
    }

    // Add lesson to completed list
    completedLessons.push(params.lessonId);

    // Get total lesson count
    const courseDoc = await adminDb.collection('courses').doc(params.courseId).get();
    const courseData = courseDoc.data();
    const totalLessons = courseData?.totalLessons || 1;

    // Calculate progress percentage
    const progress = Math.round((completedLessons.length / totalLessons) * 100);

    const updateData: any = {
      userId: user.uid,
      courseId: params.courseId,
      completedLessons,
      progress,
      lastAccessedAt: new Date(),
    };

    // If first time, add enrollment date
    if (!progressDoc.exists) {
      updateData.enrolledAt = new Date();
    }

    // If 100% complete, set completion date
    if (progress >= 100 && !progressData?.completedAt) {
      updateData.completedAt = new Date();
    }

    await progressRef.set(updateData, { merge: true });

    return NextResponse.json({
      message: 'Lesson marked as complete',
      progress,
      completedLessons: completedLessons.length,
      totalLessons,
      isComplete: progress >= 100,
    });

  } catch (error) {
    console.error('Error marking lesson complete:', error);
    return NextResponse.json(
      { error: 'Failed to mark lesson as complete' },
      { status: 500 }
    );
  }
}
