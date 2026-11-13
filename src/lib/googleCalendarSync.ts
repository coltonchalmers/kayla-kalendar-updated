import { supabase } from '@/lib/supabase';

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-sync`;

const headers = () => ({
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
});

async function signedInHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please sign in again to manage Google Calendar');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export async function getGoogleAuthUrl(): Promise<string> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: await signedInHeaders(),
    body: JSON.stringify({ mode: 'auth-url' }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to get auth URL');
  }
  const data = await res.json();
  return data.url as string;
}

export async function disconnectGoogleCalendar(): Promise<void> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: await signedInHeaders(),
    body: JSON.stringify({ mode: 'disconnect' }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to disconnect');
  }
}

export async function triggerGoogleCalendarSync(bookingId: string): Promise<void> {
  try {
    await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ mode: 'sync', bookingId }),
    });
  } catch (err) {
    console.error('Google Calendar sync trigger failed:', err);
  }
}

export async function getConnection(userId: string) {
  const { data, error } = await supabase
    .from('google_calendar_connections')
    .select('id, google_email, connected_at, disconnected_at, last_sync_at, last_error, busy_calendar_ids, block_busy_times')
    .eq('user_id', userId)
    .is('disconnected_at', null)
    .maybeSingle();

  if (error) {
    console.error('Error fetching Google Calendar connection:', error);
    return null;
  }
  return data;
}

export interface GoogleCalendarOption {
  id: string;
  name: string;
  primary: boolean;
}

export async function listGoogleCalendars(): Promise<GoogleCalendarOption[]> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: await signedInHeaders(),
    body: JSON.stringify({ mode: 'list-calendars' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to load your calendars');
  if (!Array.isArray(data.calendars)) throw new Error('Unexpected calendar list response');
  return data.calendars as GoogleCalendarOption[];
}

export async function updateGoogleBusySettings(
  connectionId: string,
  settings: { busy_calendar_ids: string[]; block_busy_times: boolean }
): Promise<void> {
  const { error } = await supabase
    .from('google_calendar_connections')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', connectionId);
  if (error) throw error;
}

export interface BusyBlock {
  date: string;
  start_time: string;
  end_time: string;
}

export class SlotUnavailableError extends Error {
  constructor() {
    super('Google Calendar is unavailable right now');
    this.name = 'SlotUnavailableError';
  }
}

export function unavailableTimesMessage(contactPhone: string | null | undefined): string {
  const callPart = contactPhone ? ` or call Jungo at ${contactPhone}` : '';
  return `We couldn't confirm this time is free right now. Please come back in a few minutes${callPart}.`;
}

export async function fetchGoogleBusyBlocks(
  userId: string,
  startDate: string,
  endDate: string
): Promise<BusyBlock[]> {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ mode: 'busy', userId, startDate, endDate }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 503) throw new SlotUnavailableError();
  if (!res.ok) throw new Error(data.error || 'Failed to load busy times');
  if (!data.enabled) return [];
  if (!Array.isArray(data.blocks)) throw new SlotUnavailableError();
  return data.blocks as BusyBlock[];
}

