import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';
import { z } from 'zod';

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

const updateProgressSchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean(),
});

// GET /api/v1/user/courses/:courseId/progress - Get user's progress for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;

    // Get progress document
    const progressDoc = await adminDb
      .collection('users')
      .doc(user.uid)
      .collection('progress')
      .doc(courseId)
      .get();

    if (!progressDoc.exists) {
      return NextResponse.json({
        completedLessons: [],
        lastAccessedAt: null,
      });
    }

    return NextResponse.json(progressDoc.data());
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// POST /api/v1/user/courses/:courseId/progress - Update user's progress
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = params;
    const body = await request.json();
    const { lessonId, completed } = updateProgressSchema.parse(body);

    const progressRef = adminDb
      .collection('users')
      .doc(user.uid)
      .collection('progress')
      .doc(courseId);

    const progressDoc = await progressRef.get();
    const currentData = progressDoc.exists ? progressDoc.data() : { completedLessons: [] };
    const completedLessons = currentData?.completedLessons || [];

    let updatedLessons = [...completedLessons];

    if (completed) {
      // Add lesson if not already in array
      if (!updatedLessons.includes(lessonId)) {
        updatedLessons.push(lessonId);
      }
    } else {
      // Remove lesson from array
      updatedLessons = updatedLessons.filter((id: string) => id !== lessonId);
    }

    // Update or create progress document
    await progressRef.set({
      completedLessons: updatedLessons,
      lastAccessedAt: new Date(),
    });

    return NextResponse.json({
      completedLessons: updatedLessons,
      lastAccessedAt: new Date(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}
