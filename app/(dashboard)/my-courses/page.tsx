'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { collection, query, documentId, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';
import Link from 'next/link';
import { Course } from '@/types/firestore/course';

export default function MyCoursesPage() {
  const { userData } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (!userData?.enrolledCourses?.length) {
        setLoading(false);
        return;
      }

      try {
        // Fetch course docs where ID is physically granted in user doc
        const chunk = userData.enrolledCourses.slice(0, 10);
        const q = query(
          collection(db, 'courses'),
          where(documentId(), 'in', chunk)
        );
        const snapshot = await getDocs(q);

        const loadedCourses = snapshot.docs.map(doc => ({
          courseId: doc.id,
          ...doc.data()
        } as Course));
        setCourses(loadedCourses);
      } catch (err) {
        console.error("Failed to load secure courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedCourses();
  }, [userData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-200 dark:border-red-900 border-t-red-600 dark:border-t-red-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Courses</h1>
        <p className="text-gray-600 dark:text-gray-400">Access and continue your enrolled courses</p>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.courseId} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow">
              {course.thumbnailURL && (
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={course.thumbnailURL}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{course.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {course.difficulty} • {course.duration}h
                  </span>
                  <Link
                    href={`/course/${course.courseId}`}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't enrolled in any courses yet.</p>
          <Link
            href="/programs"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Browse Programs
          </Link>
        </div>
      )}
    </div>
  );
}