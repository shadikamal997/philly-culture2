import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { requireAdmin } from '@/lib/roleGuard';

// PUT /api/v1/admin/programs/[programId]/lessons/[lessonId] - Update a lesson
export async function PUT(
  req: NextRequest,
  { params }: { params: { programId: string; lessonId: string } }
) {
  return requireAdmin(req, async () => {
    try {
      const body = await req.json();
      
      const updateData = {
        ...body,
        updatedAt: new Date(),
      };

      await adminDb
        .collection('lessons')
        .doc(params.lessonId)
        .update(updateData);

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating lesson:', error);
      return NextResponse.json(
        { error: 'Failed to update lesson' },
        { status: 500 }
      );
    }
  });
}

// DELETE /api/v1/admin/programs/[programId]/lessons/[lessonId] - Delete a lesson
export async function DELETE(
  req: NextRequest,
  { params }: { params: { programId: string; lessonId: string } }
) {
  return requireAdmin(req, async () => {
    try {
      await adminDb.collection('lessons').doc(params.lessonId).delete();
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      return NextResponse.json(
        { error: 'Failed to delete lesson' },
        { status: 500 }
      );
    }
  });
}
