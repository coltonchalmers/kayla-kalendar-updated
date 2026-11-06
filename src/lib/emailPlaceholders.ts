import type { EmailTypeKey } from '@/lib/types';

export interface EmailPlaceholder {
  key: string;
  label: string;
}

const SHARED_PLACEHOLDERS: EmailPlaceholder[] = [
  { key: 'client_name', label: 'Client name' },
  { key: 'date', label: 'Booking date' },
  { key: 'time', label: 'Start time' },
  { key: 'duration', label: 'Duration (minutes)' },
  { key: 'client_email', label: 'Client email' },
  { key: 'client_status', label: 'New or existing client' },
  { key: 'meeting_location', label: 'Meeting location' },
  { key: 'guests', label: 'Guests' },
];

const CLIENT_PLACEHOLDERS: EmailPlaceholder[] = [
  { key: 'business_name', label: 'Business name' },
  { key: 'zoom_link', label: 'Zoom link' },
  { key: 'zoom_passcode', label: 'Zoom passcode' },
  { key: 'google_calendar_url', label: 'Google Calendar link' },
  { key: 'booking_link', label: 'Manage booking link' },
  { key: 'notes_to_client', label: 'Notes to client' },
  { key: 'business_contact_email', label: 'Contact email' },
  { key: 'business_contact_phone', label: 'Contact phone' },
];

const ADMIN_PLACEHOLDERS: EmailPlaceholder[] = [
  { key: 'zoom_link', label: 'Zoom link' },
  { key: 'zoom_passcode', label: 'Zoom passcode' },
  { key: 'client_notes', label: 'Client notes' },
  { key: 'admin_timezone', label: 'Your time zone' },
  { key: 'client_timezone', label: 'Client time zone' },
];

export function getPlaceholdersForEmailType(emailType: EmailTypeKey): EmailPlaceholder[] {
  const audience = emailType.startsWith('admin_') ? ADMIN_PLACEHOLDERS : CLIENT_PLACEHOLDERS;
  return [...SHARED_PLACEHOLDERS, ...audience];
}
