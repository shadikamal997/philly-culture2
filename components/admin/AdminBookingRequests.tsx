'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOwnerBookings, approveSession, cancelSession, rescheduleSession } from '@/services/liveSessionService';
import { LiveSessionBooking } from '@/types/liveSession';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function AdminBookingRequests() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<LiveSessionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadBookings();
    }
  }, [user?.uid, filter]);

  const loadBookings = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const allBookings = await getOwnerBookings(user.uid);
      setBookings(allBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId: string, meetingLink?: string) => {
    setProcessingId(bookingId);
    try {
      await approveSession({
        bookingId,
        status: 'approved',
        meetingLink,
      });
      toast.success('Session approved! Student has been notified.');
      loadBookings();
    } catch (error) {
      console.error('Error approving session:', error);
      toast.error('Failed to approve session');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    const reason = prompt('Reason for rejection (optional):');
    if (reason === null) return; // User cancelled

    setProcessingId(bookingId);
    try {
      await approveSession({
        bookingId,
        status: 'rejected',
        rejectionReason: reason || 'Time slot not available',
      });
      toast.success('Session rejected. Student has been notified.');
      loadBookings();
    } catch (error) {
      console.error('Error rejecting session:', error);
      toast.error('Failed to reject session');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDateTime = (dt: Date | Timestamp): Date => {
    return dt instanceof Timestamp ? dt.toDate() : new Date(dt);
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const approvedCount = bookings.filter(b => b.status === 'approved').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">Pending Requests</p>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-300">{pendingCount}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <p className="text-sm text-green-600 dark:text-green-400 mb-1">Approved Sessions</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-300">{approvedCount}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">{bookings.length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white dark:bg-gray-900 p-2 rounded-lg border border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-red-600 text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          All ({bookings.length})
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'pending' ? 'No pending requests' : 'No bookings found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const sessionDate = formatDateTime(booking.requestedDateTime);
            const isPast = sessionDate < new Date();

            return (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {booking.studentName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : booking.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {booking.studentEmail}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Program</p>
                    <p className="font-medium text-gray-900 dark:text-white">{booking.programTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Requested Time</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {sessionDate.toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Duration: {booking.sessionDuration} min
                    </p>
                  </div>
                </div>

                {booking.studentNotes && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Student Notes:</p>
                    <p className="text-gray-900 dark:text-white">{booking.studentNotes}</p>
                  </div>
                )}

                {booking.meetingLink && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-800 dark:text-green-400 mb-2">
                      Meeting Link: <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="underline break-all">{booking.meetingLink}</a>
                    </p>
                  </div>
                )}

                {booking.status === 'pending' && (
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleApprove(booking.id)}
                      disabled={processingId === booking.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processingId === booking.id ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      disabled={processingId === booking.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ✗ Reject
                    </button>
                  </div>
                )}

                {booking.status === 'approved' && booking.meetingLink && (
                  <div className="mt-4">
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Session
                    </a>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Requested {new Date(booking.createdAt instanceof Timestamp ? booking.createdAt.toDate() : booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
