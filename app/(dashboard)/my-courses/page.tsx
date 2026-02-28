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

        const loadedCourses = snapshot.docs.map(doc => ({ courseId: doc.id, ...doc.data() } as Course));
        setCourses(loadedCourses);
      } catch (err) {
        console.error("Failed to load secure courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedCourses();
  }, [userData]);

  if (loading) return <div className="text-zinc-500 animate-pulse">Loading Video Library...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">My Library</h1>
      <p className="text-zinc-400 mb-8 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
        Access your purchased courses and masterclasses.
      </p>

      {courses.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center">
          <h2 className="text-xl font-bold mb-4">No courses yet.</h2>
          <p className="text-zinc-500 mb-6">Head over to the Academy to start learning.</p>
          <Link href="/academy" className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-lg transition-colors inline-block">
            Browse Academy
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <div key={course.courseId} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4 hover:border-amber-500 transition-colors">
              <div className="w-32 h-24 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                {course.thumbnailURL ? (
                  <img src={course.thumbnailURL} alt={course.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs border-dashed border-2 m-1">No Image</div>
                )}
              </div>
              <div className="flex flex-col justify-between w-full">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{course.title}</h3>
                  <span className="text-xs text-amber-500 font-bold uppercase">{course.difficulty}</span>
                </div>
                <Link href={`/dashboard/course/${course.courseId}`} className="text-sm font-bold bg-white text-black py-1 px-4 rounded-full text-center transition-opacity hover:opacity-80 w-max mt-2">
                  Resume Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}