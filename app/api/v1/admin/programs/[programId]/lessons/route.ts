import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/firebase/firebaseAdmin';
import { requireAdmin } from '@/lib/roleGuard';

// GET /api/v1/admin/programs/[programId]/lessons - Get all lessons for a program
export async function GET(
  req: NextRequest,
  { params }: { params: { programId: string } }
) {
  return requireAdmin(req, async () => {
    try {
      const snapshot = await adminDb
        .collection('lessons')
        .where('programId', '==', params.programId)
        .orderBy('order', 'asc')
        .get();

      const lessons = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
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

// POST /api/v1/admin/programs/[programId]/lessons - Create a new lesson
export async function POST(
  req: NextRequest,
  { params }: { params: { programId: string } }
) {
  return requireAdmin(req, async () => {
    try {
      const body = await req.json();
      const { title, description, videoURL, content, duration, order, published } = body;

      if (!title || !order) {
        return NextResponse.json(
          { error: 'Title and order are required' },
          { status: 400 }
        );
      }

      const lessonData = {
        programId: params.programId,
        title,
        description: description || '',
        videoURL: videoURL || null,
        content: content || null,
        duration: duration || 0,
        order,
        published: published || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await adminDb.collection('lessons').add(lessonData);

      return NextResponse.json({
        success: true,
        lessonId: docRef.id,
        lesson: { id: docRef.id, ...lessonData },
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      return NextResponse.json(
        { error: 'Failed to create lesson' },
        { status: 500 }
      );
    }
  });
}
