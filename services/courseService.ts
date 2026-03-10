'use server';

import { adminDb as db } from '@/firebase/firebaseAdmin';
import { Course } from '@/types/firestore/course';
import { Timestamp } from 'firebase-admin/firestore';
import { emailService } from '@/services/emailService';

export interface EnrollUserInput {
  userId: string;
  courseId: string;
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  progress: number; // 0-100
  lastAccessedAt: Date;
  enrolledAt: Date;
  completedAt?: Date;
}

/**
 * Course Service
 * Handles course enrollment, progress tracking, and course management
 */
export class CourseService {
  /**
   * Enroll user in a course
   */
  async enrollUser(input: EnrollUserInput): Promise<void> {
    try {
      const { userId, courseId } = input;

      // Check if course exists
      const courseDoc = await db.collection('courses').doc(courseId).get();
      if (!courseDoc.exists) {
        throw new Error('Course not found');
      }

      const courseData = courseDoc.data() as Course;

      // Check if already enrolled
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      const purchasedCourses = userData?.purchasedCourses || [];

      if (purchasedCourses.includes(courseId)) {
        // Already enrolled
        return;
      }

      // Add course to user's purchased courses
      await db.collection('users').doc(userId).update({
        purchasedCourses: [...purchasedCourses, courseId],
        updatedAt: Timestamp.now(),
      });

      // Initialize course progress
      await this.initializeProgress({ userId, courseId });

      // Send enrollment confirmation email
      try {
        await emailService.sendEnrollmentConfirmation({
          recipientEmail: userData?.email || '',
          recipientName: userData?.displayName || 'Valued Student',
          courseName: courseData.title,
          courseUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/course/${courseId}`,
          enrollmentDate: new Date(),
        });
        console.log(`✅ Enrollment confirmation email sent to ${userData?.email} for course ${courseData.title}`);
      } catch (emailError) {
        console.error('❌ Failed to send enrollment confirmation email:', emailError);
        // Don't fail enrollment for email errors
      }

      // Log enrollment
      await db.collection('auditLogs').add({
        type: 'course_enrollment',
        userId,
        courseId,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw new Error('Failed to enroll user in course');
    }
  }

  /**
   * Initialize course progress for a user
   */
  private async initializeProgress(input: EnrollUserInput): Promise<void> {
    try {
      const progressRef = db
        .collection('users')
        .doc(input.userId)
        .collection('courseProgress')
        .doc(input.courseId);

      const progressData: CourseProgress = {
        userId: input.userId,
        courseId: input.courseId,
        completedLessons: [],
        progress: 0,
        lastAccessedAt: new Date(),
        enrolledAt: new Date(),
      };

      await progressRef.set(progressData);
    } catch (error) {
      console.error('Error initializing progress:', error);
      throw error;
    }
  }

  /**
   * Get user's course progress
   */
  async getProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    try {
      const progressDoc = await db
        .collection('users')
        .doc(userId)
        .collection('courseProgress')
        .doc(courseId)
        .get();

      if (!progressDoc.exists) {
        return null;
      }

      return progressDoc.data() as CourseProgress;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  /**
   * Mark lesson as completed
   */
  async markLessonComplete(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<void> {
    try {
      const progressRef = db
        .collection('users')
        .doc(userId)
        .collection('courseProgress')
        .doc(courseId);

      const progressDoc = await progressRef.get();
      if (!progressDoc.exists) {
        throw new Error('Progress not found');
      }

      const progressData = progressDoc.data() as CourseProgress;
      const completedLessons = progressData.completedLessons || [];

      if (completedLessons.includes(lessonId)) {
        return; // Already completed
      }

      // Add lesson to completed list
      completedLessons.push(lessonId);

      // Get total lesson count
      const courseDoc = await db.collection('courses').doc(courseId).get();
      const courseData = courseDoc.data() as Course;
      const totalLessons = courseData.totalLessons || 1;

      // Calculate progress percentage
      const progress = Math.round((completedLessons.length / totalLessons) * 100);

      const updateData: Partial<CourseProgress> = {
        completedLessons,
        progress,
        lastAccessedAt: new Date(),
      };

      // If 100% complete, set completion date
      if (progress >= 100) {
        updateData.completedAt = new Date();
      }

      await progressRef.update(updateData);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      throw new Error('Failed to mark lesson as complete');
    }
  }

  /**
   * Check if user has access to course
   */
  async hasAccess(userId: string, courseId: string): Promise<boolean> {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return false;
      }

      const userData = userDoc.data();
      const purchasedCourses = userData?.purchasedCourses || [];

      return purchasedCourses.includes(courseId);
    } catch (error) {
      console.error('Error checking course access:', error);
      return false;
    }
  }

  /**
   * Get all courses user is enrolled in
   */
  async getUserCourses(userId: string): Promise<Course[]> {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return [];
      }

      const userData = userDoc.data();
      const purchasedCourses = userData?.purchasedCourses || [];

      if (purchasedCourses.length === 0) {
        return [];
      }

      // Fetch all courses
      const courseDocs = await Promise.all(
        purchasedCourses.map((courseId: string) =>
          db.collection('courses').doc(courseId).get()
        )
      );

      return courseDocs
        .filter(doc => doc.exists)
        .map(doc => ({
          courseId: doc.id,
          ...doc.data(),
        })) as Course[];
    } catch (error) {
      console.error('Error getting user courses:', error);
      return [];
    }
  }

  /**
   * Get course enrollment count
   */
  async getEnrollmentCount(courseId: string): Promise<number> {
    try {
      const usersSnapshot = await db
        .collection('users')
        .where('purchasedCourses', 'array-contains', courseId)
        .count()
        .get();

      return usersSnapshot.data().count;
    } catch (error) {
      console.error('Error getting enrollment count:', error);
      return 0;
    }
  }

  /**
   * Get course completion rate
   */
  async getCompletionRate(courseId: string): Promise<number> {
    try {
      // This requires querying subcollections which is complex in Firestore
      // For now, return 0 and implement with Cloud Functions or batch queries
      return 0;
    } catch (error) {
      console.error('Error getting completion rate:', error);
      return 0;
    }
  }

  /**
   * Issue certificate for completed course
   */
  async issueCertificate(userId: string, courseId: string): Promise<string> {
    try {
      // Check if course is completed
      const progress = await this.getProgress(userId, courseId);
      if (!progress || progress.progress < 100) {
        throw new Error('Course not completed');
      }

      // Check if certificate already exists
      const existingCerts = await db
        .collection('users')
        .doc(userId)
        .collection('certificates')
        .where('courseId', '==', courseId)
        .limit(1)
        .get();

      if (!existingCerts.empty) {
        return existingCerts.docs[0].id; // Return existing certificate
      }

      // Create certificate
      const certRef = await db
        .collection('users')
        .doc(userId)
        .collection('certificates')
        .add({
          courseId,
          issuedAt: Timestamp.now(),
          certificateId: `CERT-${Date.now()}-${userId.substring(0, 8)}`,
        });

      return certRef.id;
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw new Error('Failed to issue certificate');
    }
  }
}

// Export singleton instance
export const courseService = new CourseService();
