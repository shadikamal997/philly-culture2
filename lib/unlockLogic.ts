/**
 * 🔥 PHASE 4 - LESSON UNLOCK LOGIC
 * 
 * Determines which lessons should be unlocked based on:
 * - Instant: All lessons available immediately
 * - Drip: Lessons unlock over time (daily/weekly)
 * - Scheduled: Cohort-based unlock schedule
 */

import { Timestamp } from "firebase/firestore";

export interface UnlockParams {
  unlockType: "instant" | "drip" | "scheduled";
  enrolledAt: Timestamp | Date;
  lessonIndex: number; // 0-based index
  dripInterval?: number; // days between lessons
  startDate?: Timestamp | Date; // for cohort programs
  isCohort?: boolean;
}

export interface UnlockResult {
  isUnlocked: boolean;
  unlockDate?: Date;
  daysUntilUnlock?: number;
  reason?: string;
}

/**
 * Check if a specific lesson is unlocked for a student
 */
export function isLessonUnlocked(params: UnlockParams): UnlockResult {
  const { unlockType, enrolledAt, lessonIndex, dripInterval = 1, startDate, isCohort } = params;
  
  const now = new Date();
  
  // 🔹 INSTANT UNLOCK
  if (unlockType === "instant") {
    return {
      isUnlocked: true,
      unlockDate: enrolledAt instanceof Timestamp ? enrolledAt.toDate() : enrolledAt,
      reason: "All lessons available immediately"
    };
  }
  
  // 🔹 DRIP UNLOCK (Daily/Weekly)
  if (unlockType === "drip") {
    const enrollmentDate = enrolledAt instanceof Timestamp ? enrolledAt.toDate() : enrolledAt;
    const daysNeeded = lessonIndex * dripInterval;
    const unlockDate = new Date(enrollmentDate);
    unlockDate.setDate(unlockDate.getDate() + daysNeeded);
    
    const isUnlocked = now >= unlockDate;
    const daysUntilUnlock = isUnlocked 
      ? 0 
      : Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isUnlocked,
      unlockDate,
      daysUntilUnlock,
      reason: isUnlocked 
        ? `Unlocked ${daysNeeded} days after enrollment` 
        : `Unlocks in ${daysUntilUnlock} days`
    };
  }
  
  // 🔹 SCHEDULED UNLOCK (Cohort-Based)
  if (unlockType === "scheduled" && isCohort && startDate) {
    const cohortStartDate = startDate instanceof Timestamp ? startDate.toDate() : startDate;
    
    // Lesson unlock = start date + (lessonIndex * interval)
    const daysAfterStart = lessonIndex * (dripInterval || 1);
    const unlockDate = new Date(cohortStartDate);
    unlockDate.setDate(unlockDate.getDate() + daysAfterStart);
    
    const isUnlocked = now >= unlockDate;
    const daysUntilUnlock = isUnlocked 
      ? 0 
      : Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isUnlocked,
      unlockDate,
      daysUntilUnlock,
      reason: isUnlocked 
        ? `Unlocked on ${unlockDate.toLocaleDateString()}` 
        : `Unlocks on ${unlockDate.toLocaleDateString()} (${daysUntilUnlock} days)`
    };
  }
  
  // Default: locked
  return {
    isUnlocked: false,
    reason: "Unknown unlock configuration"
  };
}

/**
 * Get all unlocked lesson indices for a program
 */
export function getUnlockedLessons(
  totalLessons: number,
  enrollmentData: Omit<UnlockParams, "lessonIndex">
): number[] {
  const unlockedIndices: number[] = [];
  
  for (let i = 0; i < totalLessons; i++) {
    const result = isLessonUnlocked({
      ...enrollmentData,
      lessonIndex: i
    });
    
    if (result.isUnlocked) {
      unlockedIndices.push(i);
    }
  }
  
  return unlockedIndices;
}

/**
 * Calculate next unlock date
 */
export function getNextUnlockDate(
  totalLessons: number,
  enrollmentData: Omit<UnlockParams, "lessonIndex">
): Date | null {
  for (let i = 0; i < totalLessons; i++) {
    const result = isLessonUnlocked({
      ...enrollmentData,
      lessonIndex: i
    });
    
    if (!result.isUnlocked && result.unlockDate) {
      return result.unlockDate;
    }
  }
  
  return null; // All lessons unlocked
}

/**
 * Check if program has started (for cohort programs)
 */
export function hasProgramStarted(startDate?: Timestamp | Date): boolean {
  if (!startDate) return true; // Non-cohort programs are always started
  
  const start = startDate instanceof Timestamp ? startDate.toDate() : startDate;
  return new Date() >= start;
}

/**
 * Check if enrollment is still open (for cohort programs)
 */
export function isEnrollmentOpen(
  enrollmentDeadline?: Timestamp | Date,
  startDate?: Timestamp | Date
): boolean {
  const now = new Date();
  
  // Check enrollment deadline
  if (enrollmentDeadline) {
    const deadline = enrollmentDeadline instanceof Timestamp 
      ? enrollmentDeadline.toDate() 
      : enrollmentDeadline;
    if (now > deadline) return false;
  }
  
  // Check if program has started
  if (startDate) {
    const start = startDate instanceof Timestamp ? startDate.toDate() : startDate;
    if (now > start) return false; // Cannot enroll after start
  }
  
  return true;
}
