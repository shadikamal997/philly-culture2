'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { collection, query, documentId, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';
import Link from 'next/link';
import ProgramChatButton from '@/components/chat/ProgramChatButton';

interface LearningItem {
  id: string;
  programId?: string;
  title: string;
  description: string;
  imageUrl?: string;
  meta: string;
  href: string;
  type: 'course' | 'program';
}

export default function MyCoursesPage() {
  const { user, userData } = useAuth();
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearningItems = async () => {
      if (!user?.email) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const loadedItems: LearningItem[] = [];

        if (userData?.enrolledCourses?.length) {
          const chunk = userData.enrolledCourses.slice(0, 10);
          const courseQuery = query(
            collection(db, 'courses'),
            where(documentId(), 'in', chunk)
          );
          const courseSnapshot = await getDocs(courseQuery);

          const courseItems = courseSnapshot.docs.map((doc) => {
            const data = doc.data() as any;
            return {
              id: doc.id,
              title: data.title || 'Course',
              description: data.description || 'Continue learning your purchased course.',
              imageUrl: data.thumbnailURL,
              meta: `${data.difficulty || 'All levels'} • ${data.duration || 0}h`,
              href: `/course/${doc.id}`,
              type: 'course' as const,
            };
          });

          loadedItems.push(...courseItems);
        }

        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('userEmail', '==', user.email)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);

        const activeEnrollments = enrollmentsSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as any))
          .filter((enrollment) => enrollment.status !== 'refunded');

        const uniqueProgramIds = Array.from(
          new Set(
            activeEnrollments
              .map((enrollment) => enrollment.programId)
              .filter(Boolean)
          )
        );

        const programMap = new Map<string, any>();

        for (let index = 0; index < uniqueProgramIds.length; index += 10) {
          const chunk = uniqueProgramIds.slice(index, index + 10);
          if (chunk.length === 0) continue;

          const programsQuery = query(
            collection(db, 'programs'),
            where(documentId(), 'in', chunk)
          );
          const programsSnapshot = await getDocs(programsQuery);

          programsSnapshot.docs.forEach((doc) => {
            programMap.set(doc.id, { id: doc.id, ...doc.data() });
          });
        }

        const programItems: LearningItem[] = activeEnrollments.map((enrollment) => {
          const program = programMap.get(enrollment.programId) || {};
          const slug = enrollment.programSlug || program.slug;
          return {
            id: enrollment.id,
            programId: enrollment.programId,
            title: enrollment.programTitle || program.title || 'Program',
            description:
              program.shortDescription ||
              program.fullDescription ||
              'Continue your enrolled program.',
            imageUrl: program.thumbnail,
            meta: `${program.programType || 'Program'} • ${program.totalHours || 0}h`,
            href: slug ? `/programs/${slug}` : '/programs',
            type: 'program',
          };
        });

        loadedItems.push(...programItems);

        setItems(loadedItems);
      } catch (err) {
        console.error('Failed to load learning items', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningItems();
  }, [user?.email, userData]);

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

      {items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-shadow">
                {item.imageUrl && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'program'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {item.type === 'program' ? 'Program' : 'Course'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.meta}
                    </span>
                    <Link
                      href={item.href}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add chat button for the first enrolled program (if any) */}
          {items.find(item => item.type === 'program' && item.programId) && (
            <ProgramChatButton
              programId={items.find(item => item.type === 'program' && item.programId)!.programId!}
              programTitle={items.find(item => item.type === 'program' && item.programId)!.title}
            />
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No enrollments yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't enrolled in any programs yet.</p>
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