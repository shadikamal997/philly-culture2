'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStudentBookings, cancelSession } from '@/services/liveSessionService';
import { LiveSessionBooking } from '@/types/liveSession';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface StudentSessionsListProps {
  programId?: string;
}

export default function StudentSessionsList({ programId }: StudentSessionsListProps) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<LiveSessionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    if (user?.uid) {
      loadSessions();
    }
  }, [user?.uid, programId]);

  const loadSessions = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const bookings = await getStudentBookings(user.uid, programId);
      setSessions(bookings);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this session?')) return;

    try {
      await cancelSession(bookingId, 'Cancelled by student');
      toast.success('Session cancelled');
      loadSessions();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
    }
  };

  const formatDateTime = (dt: Date | Timestamp): Date => {
    return dt instanceof Timestamp ? dt.toDate() : new Date(dt);
  };

  const getTimeUntilSession = (sessionDate: Date): string => {
    const now = new Date();
    const diff = sessionDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
    if (diff > 0) return 'soon';
    return 'past';
  };

  const filteredSessions = sessions.filter((session) => {
    const sessionDate = formatDateTime(session.requestedDateTime);
    const isPast = sessionDate < new Date();

    if (filter === 'upcoming') return !isPast && session.status === 'approved';
    if (filter === 'past') return isPast || session.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      'no-show': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="text-6xl mb-4">📅</div>
        <p className="text-gray-600 dark:text-gray-400 mb-2">No sessions yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Book your first live session to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          All ({sessions.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'upcoming'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'past'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Past
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {filteredSessions.map((session) => {
          const sessionDate = formatDateTime(session.requestedDateTime);
          const isPast = sessionDate < new Date();
          const timeUntil = getTimeUntilSession(sessionDate);

          return (
            <div
              key={session.id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {session.programTitle}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {sessionDate.toLocaleString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(session.status)}`}>
                  {session.status === 'no-show' ? 'No Show' : session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
              </div>

              {session.status === 'pending' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    ⏳ Awaiting approval from instructor
                  </p>
                </div>
              )}

              {session.status === 'approved' && !isPast && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800 dark:text-green-400 mb-2">
                    ✅ Confirmed • Starts {timeUntil}
                  </p>
                  {session.meetingLink && (
                    <a
                      href={session.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Live Session
                    </a>
                  )}
                </div>
              )}

              {session.status === 'rejected' && session.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-800 dark:text-red-400">
                    <strong>Reason:</strong> {session.rejectionReason}
                  </p>
                </div>
              )}

              {session.recordingUrl && (
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-purple-800 dark:text-purple-400 mb-2">
                    🎥 Recording Available
                  </p>
                  <a
                    href={session.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                  >
                    Watch Recording
                  </a>
                </div>
              )}

              {session.studentNotes && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <strong>Your notes:</strong> {session.studentNotes}
                </div>
              )}

              {session.adminNotes && (
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <strong>Instructor notes:</strong> {session.adminNotes}
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-500">
                <span>{session.sessionDuration} minutes</span>
                {session.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(session.id)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
