import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { requireAdmin } from '@/lib/roleGuard';
import { lessonSchema } from '@/lib/validation';

// GET /api/v1/admin/courses/[courseId]/lessons/[lessonId] - Get specific lesson
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  return requireAdmin(req, async () => {
    try {
      const lessonDoc = await adminDb
        .collection('courses')
        .doc(params.courseId)
        .collection('lessons')
        .doc(params.lessonId)
        .get();

      if (!lessonDoc.exists) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
      }

      return NextResponse.json({
        id: lessonDoc.id,
        ...lessonDoc.data()
      });

    } catch (error) {
      console.error('Error fetching lesson:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lesson' },
        { status: 500 }
      );
    }
  });
}

// PUT /api/v1/admin/courses/[courseId]/lessons/[lessonId] - Update lesson
export async function PUT(
  req: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  return requireAdmin(req, async () => {
    try {
      const body = await req.json();
      
      // Validate input
      const validatedData = lessonSchema.partial().parse(body);

      const lessonRef = adminDb
        .collection('courses')
        .doc(params.courseId)
        .collection('lessons')
        .doc(params.lessonId);

      const lessonDoc = await lessonRef.get();
      if (!lessonDoc.exists) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
      }

      await lessonRef.update({
        ...validatedData,
        updatedAt: new Date(),
      });

      const updated = await lessonRef.get();

      return NextResponse.json({
        success: true,
        lesson: {
          id: updated.id,
          ...updated.data()
        }
      });

    } catch (error: any) {
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Validation failed', details: error.errors },
          { status: 400 }
        );
      }

      console.error('Error updating lesson:', error);
      return NextResponse.json(
        { error: 'Failed to update lesson' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/v1/admin/courses/[courseId]/lessons/[lessonId] - Delete lesson
export async function DELETE(
  req: NextRequest,
  { params }: { params: { courseId: string; lessonId: string } }
) {
  return requireAdmin(req, async () => {
    try {
      const lessonRef = adminDb
        .collection('courses')
        .doc(params.courseId)
        .collection('lessons')
        .doc(params.lessonId);

      const lessonDoc = await lessonRef.get();
      if (!lessonDoc.exists) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
      }

      await lessonRef.delete();

      return NextResponse.json({
        success: true,
        message: 'Lesson deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting lesson:', error);
      return NextResponse.json(
        { error: 'Failed to delete lesson' },
        { status: 500 }
      );
    }
  });
}
