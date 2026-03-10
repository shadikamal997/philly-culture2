import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { requireAdmin } from '@/lib/roleGuard';
import { lessonSchema } from '@/lib/validation';

// GET /api/v1/admin/courses/[courseId]/lessons - Get all lessons for a course
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  return requireAdmin(req, async () => {
    try {
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

      return NextResponse.json({ lessons });

    } catch (error) {
      console.error('Error fetching lessons:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lessons' },
        { status: 500 }
      );
    }
  });
}

// POST /api/v1/admin/courses/[courseId]/lessons - Create new lesson
export async function POST(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  return requireAdmin(req, async () => {
    try {
      const body = await req.json();
      
      // Validate input
      const validatedData = lessonSchema.parse(body);

      const lessonRef = await adminDb
        .collection('courses')
        .doc(params.courseId)
        .collection('lessons')
        .add({
          ...validatedData,
          courseId: params.courseId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const created = await lessonRef.get();

      return NextResponse.json({
        success: true,
        lesson: {
          id: created.id,
          ...created.data()
        }
      }, { status: 201 });

    } catch (error: any) {
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Error creating lesson:', error);
      return NextResponse.json(
        { error: 'Failed to create lesson' },
        { status: 500 }
      );
    }
  });
}
