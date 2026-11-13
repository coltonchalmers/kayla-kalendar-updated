import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import {
  getGoogleAuthUrl,
  disconnectGoogleCalendar,
  getConnection,
  GOOGLE_CALENDAR_CONNECTED_MESSAGE,
} from '@/lib/googleCalendarSync';
import type { GoogleCalendarConnection } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export function useGoogleCalendar() {
  const { user } = useAuth();
  const [connection, setConnection] = useState<GoogleCalendarConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupTimer = useRef<number | null>(null);

  const fetchConnection = useCallback(async () => {
    if (!user?.id) {
      setConnection(null);
      setLoading(false);
      return;
    }
    const data = await getConnection(user.id);
    setConnection(data as GoogleCalendarConnection | null);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== GOOGLE_CALENDAR_CONNECTED_MESSAGE) return;
      setConnecting(false);
      fetchConnection();
    };
    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
      if (popupTimer.current !== null) window.clearInterval(popupTimer.current);
    };
  }, [fetchConnection]);

  const connect = useCallback(async () => {
    if (!user?.id) return;
    setConnecting(true);
    setError(null);

    const popup = window.open('about:blank', 'google-calendar-connect', 'width=520,height=680');
    if (!popup) {
      setError('Your browser blocked the Google sign-in window. Allow pop-ups for this site and try again.');
      setConnecting(false);
      return;
    }

    try {
      const url = await getGoogleAuthUrl();
      popup.location.href = url;
    } catch (err) {
      popup.close();
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnecting(false);
      return;
    }

    popupTimer.current = window.setInterval(() => {
      if (popup.closed) {
        if (popupTimer.current !== null) window.clearInterval(popupTimer.current);
        popupTimer.current = null;
        setConnecting(false);
        fetchConnection();
      }
    }, 500);
  }, [user?.id, fetchConnection]);

  const disconnect = useCallback(async () => {
    if (!user?.id) return;
    setError(null);
    try {
      await disconnectGoogleCalendar();
      await fetchConnection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, [user?.id, fetchConnection]);

  return { connection, loading, connecting, error, connect, disconnect, refresh: fetchConnection };
}
