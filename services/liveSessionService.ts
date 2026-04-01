import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';
import {
  LiveSessionBooking,
  BookSessionRequest,
  SessionApprovalRequest,
  MarkAttendanceRequest,
  SessionFilters,
  AttendanceReport,
} from '@/types/liveSession';
import { generateGoogleMeetLink } from '@/services/googleMeetService';

const BOOKINGS_COLLECTION = 'liveSessionBookings';

/**
 * Create a new session booking request
 */
export async function createSessionBooking(
  request: BookSessionRequest,
  ownerId: string
): Promise<string> {
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);

  // Get program details
  const programDoc = await getDoc(doc(db, 'programs', request.programId));
  const programData = programDoc.data();

  const booking: Omit<LiveSessionBooking, 'id'> = {
    programId: request.programId,
    programTitle: programData?.title || 'Program',
    studentId: request.studentId,
    studentName: request.studentName,
    studentEmail: request.studentEmail,
    ownerId,
    requestedDateTime: request.requestedDateTime,
    sessionDuration: request.sessionDuration,
    sessionType: programData?.sessionType || 'individual',
    status: 'pending',
    attendanceMarked: false,
    studentNotes: request.studentNotes || '',
    reminderSent24h: false,
    reminderSent1h: false,
    confirmationEmailSent: false,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  const docRef = await addDoc(bookingsRef, booking);
  return docRef.id;
}

/**
 * Approve or reject a session booking
 */
export async function approveSession(approval: SessionApprovalRequest): Promise<void> {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, approval.bookingId);
  const bookingDoc = await getDoc(bookingRef);

  if (!bookingDoc.exists()) {
    throw new Error('Booking not found');
  }

  const updates: any = {
    status: approval.status,
    updatedAt: serverTimestamp(),
  };

  if (approval.status === 'approved') {
    updates.approvedAt = serverTimestamp();
    
    // Generate Google Meet link if not provided
    if (!approval.meetingLink) {
      const bookingData = bookingDoc.data();
      const meetLink = await generateGoogleMeetLink({
        title: `${bookingData.programTitle} - Session with ${bookingData.studentName}`,
        startTime: bookingData.requestedDateTime instanceof Timestamp
          ? bookingData.requestedDateTime.toDate()
          : new Date(bookingData.requestedDateTime),
        duration: bookingData.sessionDuration,
        attendees: [bookingData.studentEmail],
      });
      updates.meetingLink = meetLink.meetingLink;
      updates.meetingId = meetLink.meetingId;
    } else {
      updates.meetingLink = approval.meetingLink;
    }

    if (approval.adminNotes) {
      updates.adminNotes = approval.adminNotes;
    }
  } else if (approval.status === 'rejected') {
    updates.rejectionReason = approval.rejectionReason || 'No reason provided';
    if (approval.adminNotes) {
      updates.adminNotes = approval.adminNotes;
    }
  }

  await updateDoc(bookingRef, updates);
}

/**
 * Mark attendance for a session
 */
export async function markAttendance(attendance: MarkAttendanceRequest): Promise<void> {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, attendance.bookingId);
  
  const updates: any = {
    attendanceMarked: true,
    attended: attendance.attended,
    status: attendance.attended ? 'completed' : 'no-show',
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (attendance.recordingUrl) {
    updates.recordingUrl = attendance.recordingUrl;
    updates.recordingTitle = attendance.recordingTitle || 'Session Recording';
  }

  if (attendance.adminNotes) {
    updates.adminNotes = attendance.adminNotes;
  }

  await updateDoc(bookingRef, updates);
}

/**
 * Cancel a session booking
 */
export async function cancelSession(bookingId: string, reason?: string): Promise<void> {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(bookingRef, {
    status: 'cancelled',
    adminNotes: reason || 'Session cancelled',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Reschedule a session
 */
export async function rescheduleSession(
  bookingId: string,
  newDateTime: Date,
  adminNotes?: string
): Promise<void> {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(bookingRef, {
    requestedDateTime: newDateTime,
    adminNotes: adminNotes || 'Session rescheduled',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get student's bookings for a program
 */
export async function getStudentBookings(
  studentId: string,
  programId?: string
): Promise<LiveSessionBooking[]> {
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  let q = query(
    bookingsRef,
    where('studentId', '==', studentId),
    orderBy('requestedDateTime', 'desc')
  );

  if (programId) {
    q = query(
      bookingsRef,
      where('studentId', '==', studentId),
      where('programId', '==', programId),
      orderBy('requestedDateTime', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LiveSessionBooking[];
}

/**
 * Get owner's bookings (all or filtered)
 */
export async function getOwnerBookings(
  ownerId: string,
  filters?: SessionFilters
): Promise<LiveSessionBooking[]> {
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  let q = query(
    bookingsRef,
    where('ownerId', '==', ownerId),
    orderBy('requestedDateTime', 'desc')
  );

  const snapshot = await getDocs(q);
  let bookings = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LiveSessionBooking[];

  // Apply client-side filters
  if (filters) {
    if (filters.status) {
      bookings = bookings.filter((b) => filters.status!.includes(b.status));
    }
    if (filters.programId) {
      bookings = bookings.filter((b) => b.programId === filters.programId);
    }
    if (filters.studentId) {
      bookings = bookings.filter((b) => b.studentId === filters.studentId);
    }
    if (filters.dateFrom) {
      bookings = bookings.filter((b) => {
        const bookingDate = b.requestedDateTime instanceof Timestamp
          ? b.requestedDateTime.toDate()
          : new Date(b.requestedDateTime);
        return bookingDate >= filters.dateFrom!;
      });
    }
    if (filters.dateTo) {
      bookings = bookings.filter((b) => {
        const bookingDate = b.requestedDateTime instanceof Timestamp
          ? b.requestedDateTime.toDate()
          : new Date(b.requestedDateTime);
        return bookingDate <= filters.dateTo!;
      });
    }
  }

  return bookings;
}

/**
 * Get a single booking by ID
 */
export async function getBooking(bookingId: string): Promise<LiveSessionBooking | null> {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const bookingDoc = await getDoc(bookingRef);

  if (!bookingDoc.exists()) {
    return null;
  }

  return {
    id: bookingDoc.id,
    ...bookingDoc.data(),
  } as LiveSessionBooking;
}

/**
 * Subscribe to real-time booking updates
 */
export function subscribeToBookings(
  ownerId: string,
  callback: (bookings: LiveSessionBooking[]) => void
): () => void {
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  const q = query(
    bookingsRef,
    where('ownerId', '==', ownerId),
    orderBy('requestedDateTime', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LiveSessionBooking[];
    callback(bookings);
  });
}

/**
 * Get attendance report for a student
 */
export async function getAttendanceReport(
  studentId: string,
  programId?: string
): Promise<AttendanceReport[]> {
  const bookings = await getStudentBookings(studentId, programId);

  // Group by program
  const programMap = new Map<string, LiveSessionBooking[]>();
  
  bookings.forEach((booking) => {
    if (!programMap.has(booking.programId)) {
      programMap.set(booking.programId, []);
    }
    programMap.get(booking.programId)!.push(booking);
  });

  const reports: AttendanceReport[] = [];

  for (const [progId, sessions] of programMap.entries()) {
    const completedSessions = sessions.filter((s) => s.attendanceMarked);
    const attendedSessions = completedSessions.filter((s) => s.attended);
    const missedSessions = completedSessions.filter((s) => !s.attended);

    if (sessions.length > 0) {
      const firstSession = sessions[0];
      reports.push({
        studentId,
        studentName: firstSession.studentName,
        studentEmail: firstSession.studentEmail,
        programId: progId,
        programTitle: firstSession.programTitle,
        totalSessions: completedSessions.length,
        attendedSessions: attendedSessions.length,
        missedSessions: missedSessions.length,
        attendanceRate: completedSessions.length > 0
          ? (attendedSessions.length / completedSessions.length) * 100
          : 0,
        sessions: sessions,
      });
    }
  }

  return reports;
}

/**
 * Get pending bookings count for owner
 */
export async function getPendingBookingsCount(ownerId: string): Promise<number> {
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  const q = query(
    bookingsRef,
    where('ownerId', '==', ownerId),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  return snapshot.size;
}

/**
 * Get upcoming sessions (approved and not yet completed)
 */
export async function getUpcomingSessions(
  userId: string,
  isOwner: boolean = false
): Promise<LiveSessionBooking[]> {
  const bookingsRef = collection(db, BOOKINGS_COLLECTION);
  const now = new Date();

  const field = isOwner ? 'ownerId' : 'studentId';
  const q = query(
    bookingsRef,
    where(field, '==', userId),
    where('status', '==', 'approved'),
    orderBy('requestedDateTime', 'asc')
  );

  const snapshot = await getDocs(q);
  const bookings = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LiveSessionBooking[];

  // Filter to only future sessions
  return bookings.filter((booking) => {
    const sessionDate = booking.requestedDateTime instanceof Timestamp
      ? booking.requestedDateTime.toDate()
      : new Date(booking.requestedDateTime);
    return sessionDate > now;
  });
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(
  bookingId: string,
  reminderType: '24h' | '1h'
): Promise<void> {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  const field = reminderType === '24h' ? 'reminderSent24h' : 'reminderSent1h';
  
  await updateDoc(bookingRef, {
    [field]: true,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mark confirmation email as sent
 */
export async function markConfirmationSent(bookingId: string): Promise<void> {
  const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
  await updateDoc(bookingRef, {
    confirmationEmailSent: true,
    updatedAt: serverTimestamp(),
  });
}
