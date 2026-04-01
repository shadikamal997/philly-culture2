import { NextRequest, NextResponse } from 'next/server';
import { createSessionBooking } from '@/services/liveSessionService';
import { BookSessionRequest } from '@/types/liveSession';
import { emailService } from '@/services/emailService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';

export async function POST(request: NextRequest) {
  try {
    const body: BookSessionRequest = await request.json();

    // Validate required fields
    if (!body.studentId || !body.programId || !body.requestedDateTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get program to find owner ID and title
    const programDoc = await getDoc(doc(db, 'programs', body.programId));
    const programData = programDoc.data();
    
    if (!programData) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    const ownerId = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'owner@example.com';

    // Create the booking
    const bookingId = await createSessionBooking(body, ownerId);

    // Send email notification to owner
    try {
      const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL || 'owner@example.com';
      await emailService.sendSessionBookingRequest({
        adminEmail: ownerEmail,
        adminName: 'Admin',
        studentName: body.studentName,
        studentEmail: body.studentEmail,
        programTitle: programData.title,
        requestedDateTime: new Date(body.requestedDateTime),
        sessionDuration: body.sessionDuration,
        studentNotes: body.studentNotes,
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.phillycultrue.com'}/admin/sessions`,
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      bookingId,
      message: 'Session booking created successfully',
    });
  } catch (error) {
    console.error('Error creating session booking:', error);
    return NextResponse.json(
      { error: 'Failed to create session booking' },
      { status: 500 }
    );
  }
}
