import { NextRequest, NextResponse } from 'next/server';
import { approveSession } from '@/services/liveSessionService';
import { SessionApprovalRequest } from '@/types/liveSession';
import { emailService } from '@/services/emailService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';

export async function POST(request: NextRequest) {
  try {
    const body: SessionApprovalRequest = await request.json();

    // Validate required fields
    if (!body.bookingId || !body.status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Approve or reject the session
    await approveSession(body);

    // Get booking details for email
    const bookingDoc = await getDoc(doc(db, 'liveSessionBookings', body.bookingId));
    if (bookingDoc.exists()) {
      const booking = bookingDoc.data();

      try {
        if (body.status === 'approved') {
          await emailService.sendSessionApproval({
            studentName: booking.studentName,
            studentEmail: booking.studentEmail,
            programTitle: booking.programTitle,
            sessionDateTime: booking.requestedDateTime.toDate(),
            meetingLink: booking.meetingLink || '',
            sessionDuration: booking.sessionDuration,
          });
        } else if (body.status === 'rejected') {
          await emailService.sendSessionRejection({
            studentName: booking.studentName,
            studentEmail: booking.studentEmail,
            programTitle: booking.programTitle,
            requestedDateTime: booking.requestedDateTime.toDate(),
            reason: body.rejectionReason || 'Time slot not available',
          });
        }
      } catch (emailError) {
        console.error('Failed to send approval/rejection email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Session ${body.status} successfully`,
    });
  } catch (error) {
    console.error('Error approving/rejecting session:', error);
    return NextResponse.json(
      { error: 'Failed to process session approval' },
      { status: 500 }
    );
  }
}
