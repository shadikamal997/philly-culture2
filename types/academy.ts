import { Timestamp } from 'firebase/firestore';

export interface Lesson {
  lessonId?: string;
  programId: string;
  title: string;
  description: string;
  videoURL?: string;
  content?: string; // Rich text or markdown content
  duration: number; // in minutes
  order: number; // Lesson sequence
  published: boolean;
  
  // Unlock logic (optional, can override program defaults)
  unlockAfterDays?: number; // For drip content
  availableAfter?: Timestamp; // For scheduled cohorts
  
  // Resources
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LessonProgress {
  userId: string;
  userEmail: string;
  programId: string;
  lessonId: string;
  
  // Progress tracking
  completed: boolean;
  completedAt?: Timestamp;
  watchedDuration: number; // in seconds
  lastWatchedAt?: Timestamp;
  
  // Quiz/assessment (future)
  quizScore?: number;
  quizPassed?: boolean;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Program {
  programId?: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  instructorName: string;
  thumbnail: string;
  programType: 'intensive' | 'weekly' | 'professional';
  totalHours: number;
  basePrice: number;
  published: boolean;
  featured?: boolean;
  
  // Unlock & Access Control
  unlockType: 'instant' | 'drip' | 'scheduled';
  accessDuration: number; // 0 = lifetime, otherwise days
  dripInterval?: number; // days between lesson unlocks
  isCohort: boolean;
  startDate?: Timestamp;
  enrollmentDeadline?: Timestamp;
  
  // Stats (calculated)
  totalLessons?: number;
  totalEnrollments?: number;
  
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface Enrollment {
  enrollmentId?: string;
  
  // User identification
  userId: string;
  userEmail: string;
  customerName?: string;
  
  // Program identification
  programId: string;
  programSlug: string;
  programTitle: string;
  
  // Financial details
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  
  // Location for tax compliance
  state: string;
  city?: string;
  country: string;
  postalCode?: string;
  
  // Stripe data
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  
  // Status & Access Control
  status: 'active' | 'refunded' | 'expired' | 'suspended';
  enrolledAt: Timestamp;
  accessExpiresAt?: Timestamp; // null = lifetime
  unlockType: 'instant' | 'drip' | 'scheduled';
  startDate?: Timestamp; // For cohort programs
  
  // Progress tracking
  completionPercent: number;
  lastAccessedAt?: Timestamp;
  
  // Certificate
  certificateIssued: boolean;
  certificateEligible: boolean;
  certificateIssuedAt?: Timestamp;
  certificateId?: string;
  
  // Refund tracking
  refundStatus?: 'pending' | 'refunded';
  refundedAt?: Timestamp;
  stripeRefundId?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
