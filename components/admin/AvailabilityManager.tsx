'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getOwnerAvailability,
  addAvailabilitySlot,
  deleteAvailabilitySlot,
} from '@/services/availabilityService';
import { AvailabilitySlot } from '@/types/liveSession';
import toast from 'react-hot-toast';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function AvailabilityManager() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    sessionDuration: 60,
    bufferTime: 15,
    timezone: 'America/New_York',
  });

  useEffect(() => {
    if (user?.uid) {
      loadAvailability();
    }
  }, [user?.uid]);

  const loadAvailability = async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const availability = await getOwnerAvailability(user.uid);
      setSlots(availability);
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    try {
      await addAvailabilitySlot(user.uid, {
        ownerId: user.uid,
        dayOfWeek: formData.dayOfWeek,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isAvailable: true,
        sessionDuration: formData.sessionDuration,
        bufferTime: formData.bufferTime,
        timezone: formData.timezone,
      });
      toast.success('Time slot added!');
      setShowAddForm(false);
      setFormData({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        sessionDuration: 60,
        bufferTime: 15,
        timezone: 'America/New_York',
      });
      loadAvailability();
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add time slot');
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!user?.uid) return;
    if (!confirm('Delete this time slot?')) return;

    try {
      await deleteAvailabilitySlot(slotId);
      toast.success('Time slot deleted');
      loadAvailability();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Failed to delete time slot');
    }
  };

  const groupSlotsByDay = () => {
    const grouped: { [key: number]: AvailabilitySlot[] } = {};
    slots.forEach((slot) => {
      if (!grouped[slot.dayOfWeek]) {
        grouped[slot.dayOfWeek] = [];
      }
      grouped[slot.dayOfWeek].push(slot);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDay();

  return (
    <div className="space-y-6">
      {/* Add Custom Slot */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Custom Time Slot
          </h3>
          <span className="text-2xl text-red-600">
            {showAddForm ? '−' : '+'}
          </span>
        </button>

        {showAddForm && (
          <form onSubmit={handleAddSlot} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Day of Week
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) =>
                  setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {DAYS_OF_WEEK.map((day, index) => (
                  <option key={index} value={index + 1}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.sessionDuration}
                  onChange={(e) =>
                    setFormData({ ...formData, sessionDuration: parseInt(e.target.value) })
                  }
                  min="15"
                  step="15"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buffer Time (minutes)
                </label>
                <input
                  type="number"
                  value={formData.bufferTime}
                  onChange={(e) =>
                    setFormData({ ...formData, bufferTime: parseInt(e.target.value) })
                  }
                  min="0"
                  step="5"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Add Time Slot
            </button>
          </form>
        )}
      </div>

      {/* Current Availability */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Your Weekly Availability
        </h3>

        {slots.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-600 dark:text-gray-400">
              No availability set. Add time slots or use a preset.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {DAYS_OF_WEEK.map((day, index) => {
              const daySlots = groupedSlots[index + 1] || [];
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="w-32 flex-shrink-0">
                    <p className="font-medium text-gray-900 dark:text-white">{day}</p>
                  </div>
                  <div className="flex-1">
                    {daySlots.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Not available
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm"
                          >
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <button
                              onClick={() => handleDeleteSlot(slot.id!)}
                              className="text-green-700 dark:text-green-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
