import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';
import { AvailabilitySlot, SpecificAvailability, AvailableTimeSlot } from '@/types/liveSession';
import type { LiveSessionBooking } from '@/types/liveSession';

const AVAILABILITY_COLLECTION = 'adminAvailability';
const SPECIFIC_AVAILABILITY_COLLECTION = 'specificAvailability';

/**
 * Add recurring availability slot (e.g., every Monday 2-5pm)
 */
export async function addAvailabilitySlot(
  ownerId: string,
  slot: Omit<AvailabilitySlot, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const availabilityRef = collection(db, AVAILABILITY_COLLECTION);
  const docRef = await addDoc(availabilityRef, {
    ...slot,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Update availability slot
 */
export async function updateAvailabilitySlot(
  slotId: string,
  updates: Partial<Omit<AvailabilitySlot, 'id' | 'createdAt'>>
): Promise<void> {
  const slotRef = doc(db, AVAILABILITY_COLLECTION, slotId);
  await updateDoc(slotRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete availability slot
 */
export async function deleteAvailabilitySlot(slotId: string): Promise<void> {
  const slotRef = doc(db, AVAILABILITY_COLLECTION, slotId);
  await deleteDoc(slotRef);
}

/**
 * Get all availability slots for an owner
 */
export async function getOwnerAvailability(ownerId: string): Promise<AvailabilitySlot[]> {
  const availabilityRef = collection(db, AVAILABILITY_COLLECTION);
  const q = query(availabilityRef, where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as AvailabilitySlot[];
}

/**
 * Add specific date/time availability (one-time slot)
 */
export async function addSpecificAvailability(
  ownerId: string,
  availability: Omit<SpecificAvailability, 'id' | 'createdAt'>
): Promise<string> {
  const availabilityRef = collection(db, SPECIFIC_AVAILABILITY_COLLECTION);
  const docRef = await addDoc(availabilityRef, {
    ...availability,
    ownerId,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Get specific availabilities for an owner
 */
export async function getSpecificAvailabilities(ownerId: string): Promise<SpecificAvailability[]> {
  const availabilityRef = collection(db, SPECIFIC_AVAILABILITY_COLLECTION);
  const q = query(availabilityRef, where('ownerId', '==', ownerId));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as SpecificAvailability[];
}

/**
 * Calculate available time slots for a date range
 * Pass existing bookings to filter out booked slots
 */
export async function getAvailableTimeSlots(
  ownerId: string,
  startDate: Date,
  endDate: Date,
  sessionDuration: number = 60,
  existingBookings: LiveSessionBooking[] = []
): Promise<AvailableTimeSlot[]> {
  const slots: AvailableTimeSlot[] = [];

  // Get recurring availability
  const recurringSlots = await getOwnerAvailability(ownerId);
  
  // Get specific availabilities
  const specificSlots = await getSpecificAvailabilities(ownerId);

  const bookings = existingBookings;

  // Generate slots for each day in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];

    // Check recurring availability for this day of week
    const daySlots = recurringSlots.filter(
      (slot) => slot.isAvailable && slot.dayOfWeek === dayOfWeek
    );

    for (const slot of daySlots) {
      // Check if date is in exceptions
      const isException = slot.exceptions?.some((ex) => {
        const exDate = ex instanceof Timestamp ? ex.toDate() : new Date(ex);
        return exDate.toISOString().split('T')[0] === dateStr;
      });

      if (isException) continue;

      // Generate time slots within the availability window
      const [startHour, startMinute] = slot.startTime.split(':').map(Number);
      const [endHour, endMinute] = slot.endTime.split(':').map(Number);

      let currentTime = new Date(currentDate);
      currentTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(currentDate);
      endTime.setHours(endHour, endMinute, 0, 0);

      while (currentTime < endTime) {
        const slotEndTime = new Date(currentTime.getTime() + sessionDuration * 60000);
        
        if (slotEndTime <= endTime) {
          // Check if this slot is already booked
          const isBooked = bookings.some((booking: any) => {
            const bookingTime = booking.requestedDateTime instanceof Timestamp
              ? booking.requestedDateTime.toDate()
              : new Date(booking.requestedDateTime);
            
            return (
              (booking.status === 'approved' || booking.status === 'pending') &&
              bookingTime.getTime() === currentTime.getTime()
            );
          });

          slots.push({
            dateTime: new Date(currentTime),
            duration: sessionDuration,
            available: !isBooked,
            reason: isBooked ? 'Already booked' : undefined,
          });
        }

        // Move to next slot (including buffer time)
        currentTime = new Date(currentTime.getTime() + (sessionDuration + slot.bufferTime) * 60000);
      }
    }

    // Check specific availability for this date
    const specificForDate = specificSlots.filter((spec) => {
      const specDate = spec.date instanceof Timestamp ? spec.date.toDate() : new Date(spec.date);
      return specDate.toISOString().split('T')[0] === dateStr;
    });

    for (const spec of specificForDate) {
      const [startHour, startMinute] = spec.startTime.split(':').map(Number);
      const [endHour, endMinute] = spec.endTime.split(':').map(Number);

      let currentTime = new Date(currentDate);
      currentTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date(currentDate);
      endTime.setHours(endHour, endMinute, 0, 0);

      while (currentTime < endTime) {
        const slotEndTime = new Date(currentTime.getTime() + spec.sessionDuration * 60000);
        
        if (slotEndTime <= endTime) {
          // Check if already in slots or booked
          const existingSlot = slots.find(
            (s) => s.dateTime.getTime() === currentTime.getTime()
          );

          if (!existingSlot) {
            const isBooked = bookings.some((booking: any) => {
              const bookingTime = booking.requestedDateTime instanceof Timestamp
                ? booking.requestedDateTime.toDate()
                : new Date(booking.requestedDateTime);
              
              return (
                (booking.status === 'approved' || booking.status === 'pending') &&
                bookingTime.getTime() === currentTime.getTime()
              );
            });

            slots.push({
              dateTime: new Date(currentTime),
              duration: spec.sessionDuration,
              available: !isBooked,
              reason: isBooked ? 'Already booked' : undefined,
            });
          }
        }

        currentTime = new Date(currentTime.getTime() + spec.sessionDuration * 60000);
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort slots by date/time
  return slots.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
}

/**
 * Preset availability templates
 */
export const AVAILABILITY_PRESETS = {
  weekdays_9to5: {
    label: 'Weekdays 9am-5pm',
    slots: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
    ],
  },
  weekdays_afternoons: {
    label: 'Weekdays Afternoons (2pm-6pm)',
    slots: [
      { dayOfWeek: 1, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 2, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 3, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 4, startTime: '14:00', endTime: '18:00' },
      { dayOfWeek: 5, startTime: '14:00', endTime: '18:00' },
    ],
  },
  weekends: {
    label: 'Weekends 10am-4pm',
    slots: [
      { dayOfWeek: 0, startTime: '10:00', endTime: '16:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
    ],
  },
};
