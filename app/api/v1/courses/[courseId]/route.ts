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

// GET /api/v1/courses/[courseId] - Get course details (requires enrollment or admin)
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseDoc = await adminDb.collection('courses').doc(params.courseId).get();
    
    if (!courseDoc.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const courseData = courseDoc.data();

    // Check if user is enrolled or admin
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    // Get lessons for this course
    const lessonsSnapshot = await adminDb
      .collection('courses')
      .doc(params.courseId)
      .collection('lessons')
      .orderBy('order', 'asc')
      .get();

    const lessons = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      id: courseDoc.id,
      ...courseData,
      lessons
    });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
