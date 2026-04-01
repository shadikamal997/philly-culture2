import { Timestamp } from 'firebase/firestore';

/**
 * Live session booking status
 */
export type SessionStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'no-show';

/**
 * Session type (1-on-1 or group)
 */
export type SessionType = 'individual' | 'group';

/**
 * Live session booking
 */
export interface LiveSessionBooking {
  id: string;
  programId: string;
  programTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  ownerId: string;
  
  // Session details
  requestedDateTime: Date | Timestamp;
  sessionDuration: number; // minutes
  sessionType: SessionType;
  status: SessionStatus;
  
  // Meeting details
  meetingLink?: string;
  meetingId?: string;
  
  // Attendance & recordings
  attendanceMarked: boolean;
  attended?: boolean;
  recordingUrl?: string;
  recordingTitle?: string;
  
  // Notes
  studentNotes?: string;
  adminNotes?: string;
  rejectionReason?: string;
  
  // Timestamps
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  approvedAt?: Date | Timestamp;
  completedAt?: Date | Timestamp;
  
  // Notifications
  reminderSent24h: boolean;
  reminderSent1h: boolean;
  confirmationEmailSent: boolean;
}

/**
 * Admin availability slot
 */
export interface AvailabilitySlot {
  id: string;
  ownerId: string;
  
  // Time slot
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format (e.g., "14:00")
  endTime: string;   // HH:mm format (e.g., "17:00")
  
  // Availability settings
  isAvailable: boolean;
  maxBookingsPerSlot?: number; // For group sessions
  sessionDuration: number; // minutes (default 60)
  bufferTime: number; // minutes between sessions (default 15)
  
  // Timezone
  timezone: string; // e.g., "America/New_York"
  
  // Exceptions (specific dates when NOT available)
  exceptions?: Date[] | Timestamp[];
  
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

/**
 * Specific date/time override (for one-time availability)
 */
export interface SpecificAvailability {
  id: string;
  ownerId: string;
  
  // Specific date & time
  date: Date | Timestamp;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  
  maxBookings: number;
  sessionDuration: number;
  
  createdAt: Date | Timestamp;
}

/**
 * Request to book a session
 */
export interface BookSessionRequest {
  programId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  requestedDateTime: Date;
  sessionDuration: number;
  studentNotes?: string;
}

/**
 * Request to approve/reject a session
 */
export interface SessionApprovalRequest {
  bookingId: string;
  status: 'approved' | 'rejected';
  meetingLink?: string; // Manual link if not auto-generated
  adminNotes?: string;
  rejectionReason?: string;
  rescheduleDateTime?: Date;
}

/**
 * Mark attendance request
 */
export interface MarkAttendanceRequest {
  bookingId: string;
  attended: boolean;
  recordingUrl?: string;
  recordingTitle?: string;
  adminNotes?: string;
}

/**
 * Available time slot for display
 */
export interface AvailableTimeSlot {
  dateTime: Date;
  duration: number;
  available: boolean;
  reason?: string; // If not available, reason why
}

/**
 * Session filters for dashboards
 */
export interface SessionFilters {
  status?: SessionStatus[];
  programId?: string;
  studentId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Attendance report data
 */
export interface AttendanceReport {
  studentId: string;
  studentName: string;
  studentEmail: string;
  programId: string;
  programTitle: string;
  totalSessions: number;
  attendedSessions: number;
  missedSessions: number;
  attendanceRate: number; // percentage
  sessions: LiveSessionBooking[];
}
