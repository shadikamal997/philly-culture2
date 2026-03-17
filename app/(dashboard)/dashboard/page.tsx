'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';

export default function DashboardPage() {
  const { user, userData } = useAuth();
  const pathname = usePathname();
  const [orderCount, setOrderCount] = useState(0);
  const [programEnrollmentCount, setProgramEnrollmentCount] = useState(0);

  useEffect(() => {
    const fetchEnrollmentCount = async () => {
      if (!user?.email) {
        setOrderCount(0);
        return;
      }

      try {
        const enrollmentsQuery = query(
          collection(db, 'enrollments'),
          where('userEmail', '==', user.email)
        );
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const enrollmentDocs = enrollmentsSnapshot.docs.map((doc) => doc.data() as any);
        const activeEnrollments = enrollmentDocs.filter((enrollment) => enrollment.status !== 'refunded');
        setOrderCount(enrollmentDocs.length);
        setProgramEnrollmentCount(activeEnrollments.length);
      } catch (error) {
        console.error('Failed to load enrollment count:', error);
        setOrderCount(0);
        setProgramEnrollmentCount(0);
      }
    };

    fetchEnrollmentCount();
  }, [user?.email]);

  const navigation = [
    {
      name: 'My Courses',
      href: '/my-courses',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      description: 'View and access your enrolled courses',
      color: 'red'
    },
    {
      name: 'Certificates',
      href: '/certificates',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      description: 'View your earned certificates',
      color: 'orange'
    },
    {
      name: 'Orders',
      href: '/orders',
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      description: 'Track your order history',
      color: 'blue'
    },
    {
      name: 'Addresses',
      href: '/addresses',
      icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
      description: 'Manage your shipping addresses',
      color: 'green'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      description: 'Update your account information',
      color: 'purple'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {userData?.fullName || 'Student'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Access all your learning tools and manage your account from here.
        </p>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                isActive ? 'ring-2 ring-red-500 border-red-200 dark:border-red-800' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/20 flex items-center justify-center`}>
                  <svg
                    className={`w-6 h-6 text-${item.color}-600 dark:text-${item.color}-400`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-red-50 dark:to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
              {(userData?.enrolledCourses?.length || 0) + programEnrollmentCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Certificates Earned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{orderCount}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
          </div>
        </div>
      </div>
    </div>
  );
}