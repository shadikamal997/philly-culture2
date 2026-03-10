/**
 * 🔥 PHASE 4 - LESSON COMPLETION TRACKING
 * 
 * Handles:
 * - Marking lessons as completed
 * - Calculating completion percentage
 * - Updating enrollment records
 * - Determining certificate eligibility
 */

import { db } from "@/lib/firebase";
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";

export interface LessonProgress {
  id?: string;
  userId: string;
  userEmail: string;
  programId: string;
  lessonId: string;
  lessonIndex: number;
  completed: boolean;
  completedAt?: any;
  createdAt?: any;
}

/**
 * Mark a lesson as completed
 */
export async function markLessonComplete(params: {
  userId: string;
  userEmail: string;
  programId: string;
  lessonId: string;
  lessonIndex: number;
}): Promise<void> {
  const { userId, userEmail, programId, lessonId, lessonIndex } = params;
  
  try {
    // Check if already completed
    const progressQuery = query(
      collection(db, "lessonProgress"),
      where("userId", "==", userId),
      where("programId", "==", programId),
      where("lessonId", "==", lessonId)
    );
    
    const existingProgress = await getDocs(progressQuery);
    
    if (existingProgress.empty) {
      // Create new completion record
      await addDoc(collection(db, "lessonProgress"), {
        userId,
        userEmail,
        programId,
        lessonId,
        lessonIndex,
        completed: true,
        completedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      
      console.log(`✅ Lesson ${lessonId} marked complete for user ${userEmail}`);
    } else {
      // Already completed
      console.log(`Lesson ${lessonId} already completed for user ${userEmail}`);
    }
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    throw error;
  }
}

/**
 * Get completed lessons for a user's enrollment
 */
export async function getCompletedLessons(
  userId: string,
  programId: string
): Promise<LessonProgress[]> {
  try {
    const progressQuery = query(
      collection(db, "lessonProgress"),
      where("userId", "==", userId),
      where("programId", "==", programId),
      where("completed", "==", true)
    );
    
    const progressSnap = await getDocs(progressQuery);
    return progressSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LessonProgress[];
  } catch (error) {
    console.error("Error fetching completed lessons:", error);
    return [];
  }
}

/**
 * Calculate completion percentage
 */
export async function calculateCompletionPercent(
  userId: string,
  programId: string,
  totalLessons: number
): Promise<number> {
  if (totalLessons === 0) return 0;
  
  const completedLessons = await getCompletedLessons(userId, programId);
  const percent = (completedLessons.length / totalLessons) * 100;
  
  return Math.round(percent);
}

/**
 * Update enrollment completion percentage
 */
export async function updateEnrollmentProgress(
  enrollmentId: string,
  completionPercent: number
): Promise<void> {
  try {
    const enrollmentRef = doc(db, "enrollments", enrollmentId);
    await updateDoc(enrollmentRef, {
      completionPercent,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Updated enrollment ${enrollmentId} to ${completionPercent}% complete`);
  } catch (error) {
    console.error("Error updating enrollment progress:", error);
    throw error;
  }
}

/**
 * Check certificate eligibility
 */
export async function checkCertificateEligibility(
  enrollmentId: string,
  completionPercent: number,
  requiresFinalAssessment: boolean = false,
  finalAssessmentPassed: boolean = false
): Promise<boolean> {
  // Must have 100% completion
  if (completionPercent < 100) return false;
  
  // If program requires final assessment, check if passed
  if (requiresFinalAssessment && !finalAssessmentPassed) return false;
  
  // Update enrollment with certificate eligibility
  try {
    const enrollmentRef = doc(db, "enrollments", enrollmentId);
    await updateDoc(enrollmentRef, {
      certificateEligible: true,
      updatedAt: serverTimestamp()
    });
    
    console.log(`Certificate now eligible for enrollment ${enrollmentId}`);
    return true;
  } catch (error) {
    console.error("Error updating certificate eligibility:", error);
    return false;
  }
}

/**
 * Complete lesson and update progress (all-in-one)
 */
export async function completeLesson(params: {
  userId: string;
  userEmail: string;
  programId: string;
  lessonId: string;
  lessonIndex: number;
  enrollmentId: string;
  totalLessons: number;
}): Promise<{ completionPercent: number; certificateEligible: boolean }> {
  const { userId, userEmail, programId, lessonId, lessonIndex, enrollmentId, totalLessons } = params;
  
  // Mark lesson complete
  await markLessonComplete({ userId, userEmail, programId, lessonId, lessonIndex });
  
  // Calculate new completion percentage
  const completionPercent = await calculateCompletionPercent(userId, programId, totalLessons);
  
  // Update enrollment
  await updateEnrollmentProgress(enrollmentId, completionPercent);
  
  // Check certificate eligibility
  const certificateEligible = await checkCertificateEligibility(enrollmentId, completionPercent);
  
  return { completionPercent, certificateEligible };
}

/**
 * Check if a specific lesson is completed
 */
export async function isLessonCompleted(
  userId: string,
  programId: string,
  lessonId: string
): Promise<boolean> {
  try {
    const progressQuery = query(
      collection(db, "lessonProgress"),
      where("userId", "==", userId),
      where("programId", "==", programId),
      where("lessonId", "==", lessonId),
      where("completed", "==", true)
    );
    
    const progressSnap = await getDocs(progressQuery);
    return !progressSnap.empty;
  } catch (error) {
    console.error("Error checking lesson completion:", error);
    return false;
  }
}
