import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/firebase/firebaseAdmin';
import ReactPDF from '@react-pdf/renderer';
import { generateCertificateDocument } from '@/components/certificates/CertificateTemplate';

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

// GET /api/v1/user/courses/:courseId/certificate - Generate and download certificate
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

    // Get user data
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userData = userDoc.data();

    // Get course data
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    const courseData = courseDoc.data();

    // Verify user has completed the course
    const progressDoc = await adminDb
      .collection('users')
      .doc(user.uid)
      .collection('progress')
      .doc(courseId)
      .get();

    if (!progressDoc.exists) {
      return NextResponse.json(
        { error: 'Course not started' },
        { status: 403 }
      );
    }

    const progressData = progressDoc.data();
    
    // Get all published lessons for this course
    const lessonsSnapshot = await adminDb
      .collection('courses')
      .doc(courseId)
      .collection('lessons')
      .where('isPublished', '==', true)
      .get();

    const totalLessons = lessonsSnapshot.size;
    const completedLessons = progressData?.completedLessons || [];

    // Check if all lessons are completed
    if (completedLessons.length < totalLessons) {
      return NextResponse.json(
        { 
          error: 'Course not completed',
          completed: completedLessons.length,
          total: totalLessons 
        },
        { status: 403 }
      );
    }

    // Generate certificate ID
    const certificateId = `CERT-${courseId.substring(0, 8).toUpperCase()}-${user.uid.substring(0, 8).toUpperCase()}-${Date.now()}`;

    // Generate PDF
    const completionDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const doc = generateCertificateDocument({
      recipientName: userData?.displayName || userData?.email || 'Student',
      courseName: courseData?.title || 'Course',
      completionDate,
      certificateId,
    });

    const buffer = await ReactPDF.renderToBuffer(doc);

    // Return PDF as download
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${courseId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}
