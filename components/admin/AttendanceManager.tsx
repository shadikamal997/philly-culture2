'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOwnerBookings, markAttendance, getAttendanceReport } from '@/services/liveSessionService';
import { LiveSessionBooking, AttendanceReport } from '@/types/liveSession';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function AttendanceManager() {
  const { user } = useAuth();
  const [completedSessions, setCompletedSessions] = useState<LiveSessionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<{ [key: string]: string }>({});
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [report, setReport] = useState<AttendanceReport[]>([]);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadCompletedSessions();
    }
  }, [user?.uid]);

  const loadCompletedSessions = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const bookings = await getOwnerBookings(user.uid);
      // Filter for approved sessions that should be marked for attendance
      const completed = bookings.filter(
        (b) => b.status === 'approved' || b.status === 'completed' || b.status === 'no-show'
      );
      setCompletedSessions(completed);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (
    bookingId: string,
    attended: boolean,
    recordingLink?: string,
    notes?: string
  ) => {
    setProcessingId(bookingId);
    try {
      await markAttendance({
        bookingId,
        attended,
        recordingUrl: recordingLink,
        adminNotes: notes,
      });
      toast.success(
        attended
          ? 'Marked as completed! Student notified.'
          : 'Marked as no-show. Student notified.'
      );
      loadCompletedSessions();
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
    } finally {
      setProcessingId(null);
    }
  };

  const loadAttendanceReport = async (programId: string) => {
    try {
      const reportData = await getAttendanceReport(programId);
      setReport(reportData);
      setShowReport(true);
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Failed to load report');
    }
  };

  const formatDateTime = (dt: Date | Timestamp): Date => {
    return dt instanceof Timestamp ? dt.toDate() : new Date(dt);
  };

  const isPastSession = (dt: Date | Timestamp): boolean => {
    const sessionDate = formatDateTime(dt);
    return sessionDate < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Sessions</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
            {completedSessions.length}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-300">
            {completedSessions.filter((s) => s.status === 'completed').length}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <p className="text-sm text-red-600 dark:text-red-400 mb-1">No-Shows</p>
          <p className="text-3xl font-bold text-red-900 dark:text-red-300">
            {completedSessions.filter((s) => s.status === 'no-show').length}
          </p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-300">
            {completedSessions.filter((s) => s.status === 'approved' && isPastSession(s.requestedDateTime)).length}
          </p>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Mark Attendance
        </h3>

        {completedSessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 dark:text-gray-400">No sessions to mark</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedSessions.map((session) => {
              const sessionDate = formatDateTime(session.requestedDateTime);
              const isPast = isPastSession(session.requestedDateTime);

              return (
                <div
                  key={session.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                        {session.studentName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {session.programTitle}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        session.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : session.status === 'no-show'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {session.status === 'approved' ? 'Pending Attendance' : session.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Session Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {sessionDate.toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-500">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {session.sessionDuration} minutes
                      </p>
                    </div>
                  </div>

                  {session.status === 'approved' && isPast && (
                    <div className="space-y-3 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Recording URL (optional)
                        </label>
                        <input
                          type="url"
                          value={recordingUrl[session.id] || ''}
                          onChange={(e) =>
                            setRecordingUrl({ ...recordingUrl, [session.id]: e.target.value })
                          }
                          placeholder="https://..."
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Admin Notes (optional)
                        </label>
                        <textarea
                          value={adminNotes[session.id] || ''}
                          onChange={(e) =>
                            setAdminNotes({ ...adminNotes, [session.id]: e.target.value })
                          }
                          placeholder="Session notes, topics covered, etc."
                          rows={2}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleMarkAttendance(
                              session.id,
                              true,
                              recordingUrl[session.id],
                              adminNotes[session.id]
                            )
                          }
                          disabled={processingId === session.id}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ✓ Student Attended
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(session.id, false)}
                          disabled={processingId === session.id}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          ✗ No-Show
                        </button>
                      </div>
                    </div>
                  )}

                  {session.status === 'completed' && (
                    <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <p className="text-sm text-green-800 dark:text-green-400">
                        ✓ Session completed
                      </p>
                      {session.recordingUrl && (
                        <p className="text-sm text-green-800 dark:text-green-400 mt-1">
                          Recording: <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer" className="underline">{session.recordingUrl}</a>
                        </p>
                      )}
                      {session.adminNotes && (
                        <p className="text-sm text-green-800 dark:text-green-400 mt-1">
                          Notes: {session.adminNotes}
                        </p>
                      )}
                    </div>
                  )}

                  {session.status === 'no-show' && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm text-red-800 dark:text-red-400">
                        ✗ Student did not attend
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
