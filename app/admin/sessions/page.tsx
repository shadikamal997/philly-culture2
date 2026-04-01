'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminBookingRequests from '@/components/admin/AdminBookingRequests';
import AvailabilityManager from '@/components/admin/AvailabilityManager';
import AttendanceManager from '@/components/admin/AttendanceManager';
import SessionsCalendar from '@/components/admin/SessionsCalendar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Tab = 'requests' | 'availability' | 'attendance' | 'calendar';

export default function AdminSessionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('requests');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Live Session Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your live session bookings, availability, and attendance
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'requests'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📬 Booking Requests
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'availability'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📅 Availability
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'attendance'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              ✓ Attendance
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'calendar'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📆 Calendar
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'requests' && <AdminBookingRequests />}
          {activeTab === 'availability' && <AvailabilityManager />}
          {activeTab === 'attendance' && <AttendanceManager />}
          {activeTab === 'calendar' && <SessionsCalendar />}
        </div>
      </div>
    </div>
  );
}
