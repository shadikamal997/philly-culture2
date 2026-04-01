import { NextRequest, NextResponse } from 'next/server';
import { markAttendance } from '@/services/liveSessionService';
import { MarkAttendanceRequest } from '@/types/liveSession';
import { emailService } from '@/services/emailService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';

export async function POST(request: NextRequest) {
  try {
    const body: MarkAttendanceRequest = await request.json();

    // Validate required fields
    if (!body.bookingId || typeof body.attended !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mark attendance
    await markAttendance(body);

    // Get booking details for email
    const bookingDoc = await getDoc(doc(db, 'liveSessionBookings', body.bookingId));
    if (bookingDoc.exists()) {
      const booking = bookingDoc.data();

      // Send recording link if available and student attended
      if (body.attended && body.recordingUrl) {
        try {
          await emailService.sendSessionRecording({
            studentName: booking.studentName,
            studentEmail: booking.studentEmail,
            programTitle: booking.programTitle,
            recordingUrl: body.recordingUrl,
            sessionDate: booking.requestedDateTime.toDate(),
          });
        } catch (emailError) {
          console.error('Failed to send recording email:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: body.attended
        ? 'Attendance marked as completed'
        : 'Marked as no-show',
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { error: 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
