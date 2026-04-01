'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAvailableTimeSlots } from '@/services/availabilityService';
import { getOwnerBookings, createSessionBooking } from '@/services/liveSessionService';
import { AvailableTimeSlot } from '@/types/liveSession';
import toast from 'react-hot-toast';

interface BookSessionModalProps {
  programId: string;
  programTitle: string;
  ownerId: string;
  sessionDuration: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookSessionModal({
  programId,
  programTitle,
  ownerId,
  sessionDuration,
  isOpen,
  onClose,
  onSuccess,
}: BookSessionModalProps) {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<AvailableTimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [studentNotes, setStudentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    if (isOpen && ownerId) {
      loadAvailableSlots();
    }
  }, [isOpen, ownerId, selectedWeek]);

  const loadAvailableSlots = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + (selectedWeek * 7));
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);

      // Get bookings to filter availability
      const bookings = await getOwnerBookings(ownerId, {
        dateFrom: startDate,
        dateTo: endDate,
      });

      const slots = await getAvailableTimeSlots(
        ownerId,
        startDate,
        endDate,
        sessionDuration,
        bookings
      );

      setAvailableSlots(slots.filter(s => s.available));
    } catch (error) {
      console.error('Error loading available slots:', error);
      toast.error('Failed to load available times');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !user) return;

    if (!userData) {
      toast.error('User data not loaded');
      return;
    }

    setSubmitting(true);
    try {
      await createSessionBooking(
        {
          programId,
          studentId: user.uid,
          studentName: userData.displayName || userData.fullName || 'Student',
          studentEmail: user.email || userData.email || '',
          requestedDateTime: selectedSlot,
          sessionDuration,
          studentNotes,
        },
        ownerId
      );

      toast.success('Session request sent! You\'ll receive an email when it\'s approved.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const groupSlotsByDate = () => {
    const grouped = new Map<string, AvailableTimeSlot[]>();
    availableSlots.forEach((slot) => {
      const dateKey = slot.dateTime.toLocaleDateString();
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(slot);
    });
    return grouped;
  };

  const slotsByDate = groupSlotsByDate();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Book Live Session
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {programTitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Week Navigation */}
          <div className="flex items-center justify-between mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <button
              onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
              disabled={selectedWeek === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              ← Previous Week
            </button>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedWeek === 0 ? 'This Week' : `${selectedWeek} Week${selectedWeek > 1 ? 's' : ''} Ahead`}
            </span>
            <button
              onClick={() => setSelectedWeek(selectedWeek + 1)}
              disabled={selectedWeek >= 4}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Next Week →
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : slotsByDate.size === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <p className="text-gray-600 dark:text-gray-400">
                No available time slots for this week.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Try another week or contact support via chat.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(slotsByDate.entries()).map(([date, slots]) => (
                <div key={date}>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {new Date(slots[0].dateTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(slot.dateTime)}
                        className={`p-3 text-sm font-medium rounded-lg transition-all ${
                          selectedSlot?.getTime() === slot.dateTime.getTime()
                            ? 'bg-red-600 text-white ring-2 ring-red-600 ring-offset-2'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-red-600 dark:hover:border-red-600'
                        }`}
                      >
                        {slot.dateTime.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {selectedSlot && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Notes for Instructor (Optional)
              </label>
              <textarea
                value={studentNotes}
                onChange={(e) => setStudentNotes(e.target.value)}
                placeholder="Any specific topics or questions you'd like to cover?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedSlot ? (
                <>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {selectedSlot.toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="ml-2">({sessionDuration} min)</span>
                </>
              ) : (
                'Select a time slot to continue'
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedSlot || submitting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Requesting...' : 'Request Session'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
