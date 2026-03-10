# 🔧 PHASE 4 DEVELOPER QUICK REFERENCE

Quick code snippets for using Phase 4 utilities in your components.

---

## 📦 IMPORTS

```typescript
// Unlock Logic
import { isLessonUnlocked, getUnlockedLessons, getNextUnlockDate } from '@/lib/unlockLogic';

// Access Control
import { validateAccess, checkAccessExpiration, canEnrollInCohort } from '@/lib/accessControl';

// Completion Tracking
import { completeLesson, getCompletedLessons, calculateCompletionPercent } from '@/lib/completionService';

// Firebase
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
```

---

## 🔓 CHECK IF LESSON IS UNLOCKED

```typescript
import { isLessonUnlocked } from '@/lib/unlockLogic';

const result = isLessonUnlocked({
  unlockType: enrollment.unlockType, // "instant" | "drip" | "scheduled"
  enrolledAt: enrollment.enrolledAt, // Timestamp
  lessonIndex: 2, // 0-based (third lesson)
  dripInterval: program.dripInterval || 1, // days
  startDate: program.startDate, // Timestamp (for cohort)
  isCohort: program.isCohort // boolean
});

if (result.isUnlocked) {
  // Show lesson content
  console.log("Lesson is unlocked!");
} else {
  // Show lock screen
  console.log(result.reason); // "Unlocks in 3 days"
  console.log(result.unlockDate); // Date object
  console.log(result.daysUntilUnlock); // 3
}
```

---

## 🎯 GET ALL UNLOCKED LESSONS

```typescript
import { getUnlockedLessons } from '@/lib/unlockLogic';

const totalLessons = 10;
const unlockedIndices = getUnlockedLessons(totalLessons, {
  unlockType: enrollment.unlockType,
  enrolledAt: enrollment.enrolledAt,
  dripInterval: program.dripInterval || 1,
  startDate: program.startDate,
  isCohort: program.isCohort
});

// Returns: [0, 1, 2] if first 3 lessons are unlocked

// Use in UI:
lessons.map((lesson, index) => {
  const locked = !unlockedIndices.includes(index);
  return (
    <div key={index} className={locked ? "opacity-50" : ""}>
      {locked && "🔒"} {lesson.title}
    </div>
  );
});
```

---

## 📅 GET NEXT UNLOCK DATE

```typescript
import { getNextUnlockDate } from '@/lib/unlockLogic';

const nextUnlock = getNextUnlockDate(10, {
  unlockType: enrollment.unlockType,
  enrolledAt: enrollment.enrolledAt,
  dripInterval: program.dripInterval || 1,
  startDate: program.startDate,
  isCohort: program.isCohort
});

if (nextUnlock) {
  console.log(`Next lesson unlocks on: ${nextUnlock.toLocaleDateString()}`);
} else {
  console.log("All lessons are unlocked!");
}
```

---

## 🚫 VALIDATE ACCESS (Before Showing Content)

```typescript
import { validateAccess } from '@/lib/accessControl';

const accessResult = validateAccess({
  enrollmentStatus: enrollment.status, // "active" | "expired" | "completed"
  accessExpiresAt: enrollment.accessExpiresAt, // Timestamp or null
  isCohort: program.isCohort, // boolean
  startDate: program.startDate // Timestamp or null
});

if (accessResult.hasAccess) {
  // Allow access
  console.log(accessResult.reason); // "Active access"
  console.log(accessResult.daysUntilExpiry); // 25
} else {
  // Deny access
  alert(accessResult.reason); // "Access expired on 3/1/2026"
  router.push('/dashboard');
}
```

---

## ⏰ CHECK IF ACCESS EXPIRING SOON

```typescript
import { isAccessExpiringSoon } from '@/lib/accessControl';

if (isAccessExpiringSoon(enrollment.accessExpiresAt, 7)) {
  // Warning: Access expires in less than 7 days
  showWarningBanner("Your access expires soon!");
}
```

---

## 📊 MARK LESSON AS COMPLETE

```typescript
import { completeLesson } from '@/lib/completionService';

const handleMarkComplete = async () => {
  try {
    const result = await completeLesson({
      userId: currentUser.uid, // From Firebase Auth
      userEmail: currentUser.email,
      programId: program.id,
      lessonId: lesson.id,
      lessonIndex: lesson.index,
      enrollmentId: enrollment.id,
      totalLessons: program.totalLessons
    });

    console.log(`Completion: ${result.completionPercent}%`);
    
    if (result.certificateEligible) {
      alert("🎉 Certificate ready!");
    }
  } catch (error) {
    console.error("Failed to mark complete:", error);
  }
};
```

---

## 📈 GET COMPLETION PERCENTAGE

```typescript
import { calculateCompletionPercent } from '@/lib/completionService';

const percent = await calculateCompletionPercent(
  userId,
  programId,
  totalLessons
);

console.log(`${percent}% complete`); // 30% complete
```

---

## ✅ CHECK IF SPECIFIC LESSON IS COMPLETED

```typescript
import { isLessonCompleted } from '@/lib/completionService';

const completed = await isLessonCompleted(
  userId,
  programId,
  "lesson-123"
);

if (completed) {
  // Show checkmark
  return <span>✓ Completed</span>;
}
```

---

## 📝 GET ALL COMPLETED LESSONS

```typescript
import { getCompletedLessons } from '@/lib/completionService';

const completedLessons = await getCompletedLessons(userId, programId);

console.log(`Completed ${completedLessons.length} lessons`);

completedLessons.forEach(lesson => {
  console.log(`Lesson ${lesson.lessonIndex}: ${lesson.completedAt.toDate()}`);
});
```

---

## 🎓 CHECK COHORT ENROLLMENT AVAILABILITY

```typescript
import { canEnrollInCohort } from '@/lib/accessControl';

const { canEnroll, reason } = canEnrollInCohort(
  program.isCohort,
  program.enrollmentDeadline,
  program.startDate
);

if (canEnroll) {
  // Show enroll button
  <EnrollButton programId={program.id} />
} else {
  // Show closed message
  <p>Enrollment closed: {reason}</p>
}
```

---

## 📆 FORMAT ACCESS DURATION

```typescript
import { formatAccessDuration } from '@/lib/accessControl';

formatAccessDuration(0);    // "Lifetime access"
formatAccessDuration(1);    // "1 day"
formatAccessDuration(7);    // "7 days"
formatAccessDuration(30);   // "1 month"
formatAccessDuration(90);   // "3 months"
formatAccessDuration(365);  // "1 year"
formatAccessDuration(730);  // "2 years"
```

---

## 🔍 FETCH USER'S ENROLLMENTS

```typescript
const fetchEnrollments = async (userEmail: string) => {
  const enrollmentsQuery = query(
    collection(db, "enrollments"),
    where("userEmail", "==", userEmail),
    where("status", "==", "active")
  );
  
  const snapshot = await getDocs(enrollmentsQuery);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

const enrollments = await fetchEnrollments("student@test.com");
```

---

## 🎯 FETCH PROGRAM WITH ENROLLMENT CHECK

```typescript
const fetchProgramWithEnrollment = async (
  programSlug: string,
  userEmail: string
) => {
  // Get program
  const programsQuery = query(
    collection(db, "programs"),
    where("slug", "==", programSlug)
  );
  const programSnap = await getDocs(programsQuery);
  
  if (programSnap.empty) return null;
  
  const program = { id: programSnap.docs[0].id, ...programSnap.docs[0].data() };
  
  // Check enrollment
  const enrollmentQuery = query(
    collection(db, "enrollments"),
    where("userEmail", "==", userEmail),
    where("programId", "==", program.id),
    where("status", "==", "active")
  );
  
  const enrollmentSnap = await getDocs(enrollmentQuery);
  const isEnrolled = !enrollmentSnap.empty;
  const enrollment = isEnrolled 
    ? { id: enrollmentSnap.docs[0].id, ...enrollmentSnap.docs[0].data() }
    : null;
  
  return { program, enrollment, isEnrolled };
};

const { program, enrollment, isEnrolled } = 
  await fetchProgramWithEnrollment("italian-cooking", "student@test.com");
```

---

## 🚀 COMPLETE LESSON VIEWER FLOW

```typescript
"use client";

import { useState, useEffect } from "react";
import { isLessonUnlocked } from "@/lib/unlockLogic";
import { validateAccess } from "@/lib/accessControl";
import { completeLesson, isLessonCompleted } from "@/lib/completionService";

export default function LessonPage({ params }: { params: { slug: string, lessonSlug: string } }) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function checkAccess() {
      // 1. Fetch enrollment
      const enrollment = await fetchEnrollment(userId, programId);
      
      // 2. Validate access
      const accessResult = validateAccess({
        enrollmentStatus: enrollment.status,
        accessExpiresAt: enrollment.accessExpiresAt,
        isCohort: program.isCohort,
        startDate: program.startDate
      });
      
      if (!accessResult.hasAccess) {
        setHasAccess(false);
        setLoading(false);
        return;
      }
      
      setHasAccess(true);
      
      // 3. Check unlock
      const unlockResult = isLessonUnlocked({
        unlockType: enrollment.unlockType,
        enrolledAt: enrollment.enrolledAt,
        lessonIndex: lesson.index,
        dripInterval: program.dripInterval,
        startDate: program.startDate,
        isCohort: program.isCohort
      });
      
      setIsUnlocked(unlockResult.isUnlocked);
      
      // 4. Check completion
      const completed = await isLessonCompleted(userId, programId, lesson.id);
      setIsCompleted(completed);
      
      setLoading(false);
    }
    
    checkAccess();
  }, []);
  
  const handleComplete = async () => {
    const result = await completeLesson({
      userId, userEmail, programId, lessonId: lesson.id,
      lessonIndex: lesson.index, enrollmentId, totalLessons
    });
    
    setIsCompleted(true);
    
    if (result.certificateEligible) {
      alert("Certificate ready!");
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (!hasAccess) return <div>Access Denied</div>;
  if (!isUnlocked) return <div>Lesson Locked</div>;
  
  return (
    <div>
      <video src={lesson.videoUrl} controls />
      {!isCompleted && (
        <button onClick={handleComplete}>Mark Complete</button>
      )}
    </div>
  );
}
```

---

## 📌 COMMON PATTERNS

### Show Progress Bar on Dashboard
```typescript
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-red-600 h-2 rounded-full"
    style={{ width: `${enrollment.completionPercent}%` }}
  />
</div>
```

### Show Unlock Badge
```typescript
<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
  {enrollment.unlockType.toUpperCase()}
</span>
```

### Show Expiration Warning
```typescript
{enrollment.accessExpiresAt && (
  <p className="text-sm text-orange-600">
    Expires: {enrollment.accessExpiresAt.toDate().toLocaleDateString()}
  </p>
)}
```

### Show Certificate Badge
```typescript
{enrollment.certificateEligible && (
  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
    🎓 CERTIFICATE READY
  </span>
)}
```

---

## 🎯 FIRESTORE COLLECTIONS

### enrollments
```typescript
{
  userId: string,
  userEmail: string,
  programId: string,
  status: "active" | "expired" | "completed",
  enrolledAt: Timestamp,
  accessExpiresAt: Timestamp | null,
  unlockType: "instant" | "drip" | "scheduled",
  completionPercent: 0-100,
  certificateEligible: boolean
}
```

### lessonProgress
```typescript
{
  userId: string,
  userEmail: string,
  programId: string,
  lessonId: string,
  lessonIndex: number,
  completed: boolean,
  completedAt: Timestamp
}
```

### programs
```typescript
{
  unlockType: "instant" | "drip" | "scheduled",
  accessDuration: number, // 0 = lifetime
  dripInterval: number | null,
  isCohort: boolean,
  startDate: Timestamp | null,
  enrollmentDeadline: Timestamp | null
}
```

---

## 🔥 READY TO BUILD

You now have all the utilities needed to build a complete lesson delivery system. Use these snippets as templates for your components!
