'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOwnerBookings } from '@/services/liveSessionService';
import { LiveSessionBooking } from '@/types/liveSession';
import { Timestamp } from 'firebase/firestore';

export default function SessionsCalendar() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<LiveSessionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user?.uid) {
      loadBookings();
    }
  }, [user?.uid]);

  const loadBookings = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const allBookings = await getOwnerBookings(user.uid);
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dt: Date | Timestamp): Date => {
    return dt instanceof Timestamp ? dt.toDate() : new Date(dt);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getBookingsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dayDate = new Date(year, month, day);

    return bookings.filter((booking) => {
      const bookingDate = formatDateTime(booking.requestedDateTime);
      return (
        bookingDate.getFullYear() === year &&
        bookingDate.getMonth() === month &&
        bookingDate.getDate() === day
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}

          {/* Empty cells before first day */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dayBookings = getBookingsForDay(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === currentDate.getMonth() &&
              new Date().getFullYear() === currentDate.getFullYear();

            return (
              <div
                key={day}
                className={`aspect-square border border-gray-200 dark:border-gray-800 rounded-lg p-2 ${
                  isToday
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : 'bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {day}
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {dayBookings.map((booking) => {
                      const time = formatDateTime(booking.requestedDateTime);
                      return (
                        <div
                          key={booking.id}
                          className={`text-xs px-2 py-1 rounded truncate ${
                            booking.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                          title={`${time.getHours()}:${time
                            .getMinutes()
                            .toString()
                            .padStart(2, '0')} - ${booking.studentName}`}
                        >
                          {time.getHours()}:{time.getMinutes().toString().padStart(2, '0')}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Sessions List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upcoming Sessions
        </h3>
        <div className="space-y-3">
          {bookings
            .filter((b) => {
              const sessionDate = formatDateTime(b.requestedDateTime);
              return sessionDate > new Date() && (b.status === 'approved' || b.status === 'pending');
            })
            .sort((a, b) => {
              const dateA = formatDateTime(a.requestedDateTime).getTime();
              const dateB = formatDateTime(b.requestedDateTime).getTime();
              return dateA - dateB;
            })
            .slice(0, 5)
            .map((booking) => {
              const sessionDate = formatDateTime(booking.requestedDateTime);
              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.studentName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.programTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {sessionDate.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              );
            })}
          {bookings.filter((b) => {
            const sessionDate = formatDateTime(b.requestedDateTime);
            return sessionDate > new Date() && (b.status === 'approved' || b.status === 'pending');
          }).length === 0 && (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No upcoming sessions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
