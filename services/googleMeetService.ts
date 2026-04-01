/**
 * Google Meet Integration Service
 * Auto-generates Google Meet links for live sessions
 */

export interface MeetingDetails {
  title: string;
  startTime: Date;
  duration: number; // minutes
  attendees: string[]; // email addresses
  description?: string;
}

export interface MeetingResult {
  meetingLink: string;
  meetingId: string;
  calendarEventId?: string;
}

/**
 * Generate a Google Meet link
 * Note: This requires Google Calendar API setup with OAuth2
 * For now, we'll return a placeholder implementation
 */
export async function generateGoogleMeetLink(
  details: MeetingDetails
): Promise<MeetingResult> {
  // Check if Google Calendar API is configured
  const hasGoogleAuth = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && 
                       process.env.GOOGLE_CLIENT_SECRET;

  if (!hasGoogleAuth) {
    // Fallback: Generate a manual meet link structure
    // In production, admin will need to create the actual link
    const meetingId = generateMeetingId();
    return {
      meetingLink: `https://meet.google.com/${meetingId}`,
      meetingId,
    };
  }

  // If Google API is configured, use it
  // This would be implemented via an API route to keep credentials secure
  try {
    const response = await fetch('/api/google-meet/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details),
    });

    if (!response.ok) {
      throw new Error('Failed to create Google Meet link');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating Google Meet link:', error);
    // Fallback to manual link
    const meetingId = generateMeetingId();
    return {
      meetingLink: `https://meet.google.com/${meetingId}`,
      meetingId,
    };
  }
}

/**
 * Generate a random meeting ID (10 characters, format: xxx-xxxx-xxx)
 */
function generateMeetingId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const segments = [3, 4, 3]; // Format: xxx-xxxx-xxx
  
  return segments
    .map(length => {
      return Array.from({ length }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
    })
    .join('-');
}

/**
 * Validate Google Meet link format
 */
export function isValidGoogleMeetLink(link: string): boolean {
  const meetRegex = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
  return meetRegex.test(link);
}

/**
 * Extract meeting ID from Google Meet link
 */
export function extractMeetingId(link: string): string | null {
  const match = link.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
  return match ? match[1] : null;
}

/**
 * Create calendar event data (.ics format)
 */
export function generateCalendarInvite(
  title: string,
  startTime: Date,
  duration: number,
  meetingLink: string,
  description?: string
): string {
  const endTime = new Date(startTime.getTime() + duration * 60000);
  
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Philly Culture Academy//Live Session//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@phillycultrue.com`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(startTime)}`,
    `DTEND:${formatDate(endTime)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description || 'Live session'}\\n\\nJoin meeting: ${meetingLink}`,
    `LOCATION:${meetingLink}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'DESCRIPTION:Reminder: Session starts in 1 hour',
    'ACTION:DISPLAY',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'DESCRIPTION:Reminder: Session starts in 24 hours',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return icsContent;
}

/**
 * Generate .ics file download link
 */
export function createIcsDownloadLink(icsContent: string): string {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}
