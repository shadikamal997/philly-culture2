import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { verifyAuth } from '@/lib/authGuard';

// POST /api/v1/user/enroll - Enroll in a course
export async function POST(req: NextRequest) {
  try {
    const authUser = await verifyAuth(req);
    const { courseId } = await req.json();

      if (!courseId) {
        return NextResponse.json(
          { error: 'Course ID is required' },
          { status: 400 }
        );
      }

      // Check if course exists and is published
      const courseDoc = await adminDb.collection('courses').doc(courseId).get();
      
      if (!courseDoc.exists) {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }

      const courseData = courseDoc.data();
      if (!courseData?.isPublished) {
        return NextResponse.json(
          { error: 'Course is not available for enrollment' },
          { status: 400 }
        );
      }

      // Check if already enrolled
      const userDoc = await adminDb.collection('users').doc(authUser.uid).get();
      const userData = userDoc.data();
      const enrolledCourses = userData?.enrolledCourses || [];

      if (enrolledCourses.includes(courseId)) {
        return NextResponse.json(
          { message: 'Already enrolled in this course' },
          { status: 200 }
        );
      }

      // Add course to user's enrolled courses
      await adminDb.collection('users').doc(authUser.uid).update({
        enrolledCourses: [...enrolledCourses, courseId],
        updatedAt: new Date(),
      });

      // Create progress document
      await adminDb
        .collection('users')
        .doc(authUser.uid)
        .collection('courseProgress')
        .doc(courseId)
        .set({
          courseId,
          enrolledAt: new Date(),
          completedLessons: [],
          progress: 0,
          lastAccessedAt: new Date(),
        });

      return NextResponse.json({
        message: 'Successfully enrolled in course',
        courseId,
      });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}
