/**
 * 🔥 PHASE 4 - ACCESS CONTROL & EXPIRATION
 * 
 * Validates student access to programs and lessons:
 * - Access expiration checks
 * - Enrollment status validation
 * - Cohort timing validation
 * - Combined access control
 */

import { Timestamp } from "firebase/firestore";

export interface AccessCheckParams {
  enrollmentStatus: string;
  accessExpiresAt?: Timestamp | Date | null;
  isCohort?: boolean;
  startDate?: Timestamp | Date | null;
  enrollmentDeadline?: Timestamp | Date | null;
}

export interface AccessResult {
  hasAccess: boolean;
  reason?: string;
  expiresAt?: Date;
  startsAt?: Date;
  daysUntilExpiry?: number;
  daysUntilStart?: number;
}

/**
 * Check if access has expired
 */
export function checkAccessExpiration(
  accessExpiresAt?: Timestamp | Date | null
): { expired: boolean; expiresAt?: Date; daysUntilExpiry?: number } {
  if (!accessExpiresAt) {
    return { expired: false }; // Lifetime access
  }
  
  const now = new Date();
  const expiresAt = accessExpiresAt instanceof Timestamp 
    ? accessExpiresAt.toDate() 
    : accessExpiresAt;
  
  const expired = now > expiresAt;
  const daysUntilExpiry = expired 
    ? 0 
    : Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return { expired, expiresAt, daysUntilExpiry };
}

/**
 * Check if cohort program has started
 */
export function checkCohortTiming(
  isCohort: boolean = false,
  startDate?: Timestamp | Date | null
): { started: boolean; startsAt?: Date; daysUntilStart?: number } {
  if (!isCohort || !startDate) {
    return { started: true }; // Non-cohort programs are always "started"
  }
  
  const now = new Date();
  const startsAt = startDate instanceof Timestamp 
    ? startDate.toDate() 
    : startDate;
  
  const started = now >= startsAt;
  const daysUntilStart = started 
    ? 0 
    : Math.ceil((startsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return { started, startsAt, daysUntilStart };
}

/**
 * Validate enrollment status
 */
export function isValidEnrollmentStatus(status: string): boolean {
  const validStatuses = ["active", "completed"];
  return validStatuses.includes(status.toLowerCase());
}

/**
 * Comprehensive access check
 */
export function validateAccess(params: AccessCheckParams): AccessResult {
  const { enrollmentStatus, accessExpiresAt, isCohort, startDate } = params;
  
  // Check 1: Enrollment must be active or completed
  if (!isValidEnrollmentStatus(enrollmentStatus)) {
    return {
      hasAccess: false,
      reason: `Enrollment is ${enrollmentStatus}. Access denied.`
    };
  }
  
  // Check 2: Access expiration
  const { expired, expiresAt, daysUntilExpiry } = checkAccessExpiration(accessExpiresAt);
  if (expired) {
    return {
      hasAccess: false,
      reason: `Access expired on ${expiresAt?.toLocaleDateString()}`,
      expiresAt
    };
  }
  
  // Check 3: Cohort timing
  const { started, startsAt, daysUntilStart } = checkCohortTiming(isCohort, startDate);
  if (!started) {
    return {
      hasAccess: false,
      reason: `Program starts on ${startsAt?.toLocaleDateString()}`,
      startsAt,
      daysUntilStart
    };
  }
  
  // All checks passed
  return {
    hasAccess: true,
    reason: "Active access",
    expiresAt,
    daysUntilExpiry
  };
}

/**
 * Get access status message for display
 */
export function getAccessStatusMessage(result: AccessResult): string {
  if (result.hasAccess) {
    if (result.daysUntilExpiry && result.daysUntilExpiry > 0) {
      return `Access expires in ${result.daysUntilExpiry} days`;
    }
    return "Active access";
  }
  
  return result.reason || "Access denied";
}

/**
 * Check if access is expiring soon (within warning threshold)
 */
export function isAccessExpiringSoon(
  accessExpiresAt?: Timestamp | Date | null,
  warningDays: number = 7
): boolean {
  if (!accessExpiresAt) return false; // Lifetime access
  
  const { expired, daysUntilExpiry } = checkAccessExpiration(accessExpiresAt);
  
  if (expired) return false; // Already expired
  
  return (daysUntilExpiry || 0) <= warningDays;
}

/**
 * Format access duration for display
 */
export function formatAccessDuration(accessDuration: number): string {
  if (accessDuration === 0) return "Lifetime access";
  if (accessDuration === 1) return "1 day";
  if (accessDuration < 30) return `${accessDuration} days`;
  if (accessDuration < 365) {
    const months = Math.round(accessDuration / 30);
    return `${months} month${months > 1 ? "s" : ""}`;
  }
  const years = Math.round(accessDuration / 365);
  return `${years} year${years > 1 ? "s" : ""}`;
}

/**
 * Check if user can enroll in a cohort program
 */
export function canEnrollInCohort(
  isCohort: boolean = false,
  enrollmentDeadline?: Timestamp | Date | null,
  startDate?: Timestamp | Date | null
): { canEnroll: boolean; reason?: string } {
  if (!isCohort) {
    return { canEnroll: true }; // Non-cohort programs always open
  }
  
  const now = new Date();
  
  // Check enrollment deadline
  if (enrollmentDeadline) {
    const deadline = enrollmentDeadline instanceof Timestamp 
      ? enrollmentDeadline.toDate() 
      : enrollmentDeadline;
    
    if (now > deadline) {
      return { 
        canEnroll: false, 
        reason: `Enrollment closed on ${deadline.toLocaleDateString()}` 
      };
    }
  }
  
  // Check if program has already started
  if (startDate) {
    const start = startDate instanceof Timestamp 
      ? startDate.toDate() 
      : startDate;
    
    if (now > start) {
      return { 
        canEnroll: false, 
        reason: `Program started on ${start.toLocaleDateString()}. Enrollment closed.` 
      };
    }
  }
  
  return { canEnroll: true };
}
