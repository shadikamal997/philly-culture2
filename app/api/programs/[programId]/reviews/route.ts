import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/firebase/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// GET /api/programs/[programId]/reviews — fetch all reviews for a program
export async function GET(
  _req: NextRequest,
  { params }: { params: { programId: string } }
) {
  try {
    const { programId } = params;

    const snapshot = await adminDb
      .collection('programReviews')
      .where('programId', '==', programId)
      .get();

    const reviews = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        };
      })
      .sort((a: any, b: any) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

// POST /api/programs/[programId]/reviews — submit a review (enrolled users only)
export async function POST(
  req: NextRequest,
  { params }: { params: { programId: string } }
) {
  try {
    const { programId } = params;

    // Verify auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 401 });
    }

    // Check if user is actually enrolled in this program
    const enrollmentSnap = await adminDb
      .collection('enrollments')
      .where('programId', '==', programId)
      .where('userEmail', '==', userEmail)
      .where('status', '==', 'active')
      .limit(1)
      .get();

    if (enrollmentSnap.empty) {
      return NextResponse.json(
        { error: 'You must be enrolled in this program to leave a review.' },
        { status: 403 }
      );
    }

    // Check if user already reviewed this program
    const existingReview = await adminDb
      .collection('programReviews')
      .where('programId', '==', programId)
      .where('userId', '==', uid)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      return NextResponse.json(
        { error: 'You have already reviewed this program.' },
        { status: 409 }
      );
    }

    // Parse and validate body
    const body = await req.json();
    const { rating, comment, displayName } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (!comment || comment.trim().length < 10) {
      return NextResponse.json({ error: 'Review comment must be at least 10 characters' }, { status: 400 });
    }
    if (comment.trim().length > 1000) {
      return NextResponse.json({ error: 'Review comment must be 1000 characters or less' }, { status: 400 });
    }

    // Fetch user data for display name fallback
    const userSnap = await adminDb.collection('users').doc(uid).get();
    const userData = userSnap.data();
    const reviewerName = displayName?.trim() || userData?.name || userData?.displayName || 'Anonymous';

    // Save review
    const reviewRef = await adminDb.collection('programReviews').add({
      programId,
      userId: uid,
      userEmail,
      reviewerName,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date(),
    });

    // Update program averageRating and reviewCount
    const allReviewsSnap = await adminDb
      .collection('programReviews')
      .where('programId', '==', programId)
      .get();

    const ratings = allReviewsSnap.docs.map((d) => d.data().rating as number);
    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    await adminDb.collection('programs').doc(programId).update({
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      reviewId: reviewRef.id,
      message: 'Review submitted successfully',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error submitting review:', error);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

// DELETE /api/programs/[programId]/reviews?reviewId=xxx — delete own review (or admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { programId: string } }
) {
  try {
    const { programId } = params;
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });
    }

    // Verify auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check if review exists
    const reviewSnap = await adminDb.collection('programReviews').doc(reviewId).get();
    if (!reviewSnap.exists) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const reviewData = reviewSnap.data();

    // Check admin role
    const userSnap = await adminDb.collection('users').doc(uid).get();
    const userRole = userSnap.data()?.role;
    const isAdmin = ['admin', 'superadmin', 'owner'].includes(userRole);

    // Only the author or an admin can delete
    if (reviewData?.userId !== uid && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the review
    await adminDb.collection('programReviews').doc(reviewId).delete();

    // Recalculate program averageRating
    const remainingSnap = await adminDb
      .collection('programReviews')
      .where('programId', '==', programId)
      .get();

    const ratings = remainingSnap.docs.map((d) => d.data().rating as number);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    await adminDb.collection('programs').doc(programId).update({
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, message: 'Review deleted successfully' });

  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
