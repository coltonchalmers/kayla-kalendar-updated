import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { AdminSettings } from '@/lib/types';
import { mergeEmailTemplates } from '@/lib/emailDefaults';

export function useSettings(userId?: string) {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (signal?: AbortSignal) => {
    let query = supabase.from('admin_settings').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (signal) {
      query = query.abortSignal(signal);
    }
    const { data, error: queryError } = await query.maybeSingle();

    if (signal?.aborted) return;

    if (queryError) {
      console.error('Error fetching settings:', queryError);
      setError(queryError.message);
    } else if (data) {
      setSettings({ ...data, email_templates_json: mergeEmailTemplates(data.email_templates_json) });
      setError(null);
    } else {
      setSettings(null);
      setError(null);
    }
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    setLoading(true);

    fetchSettings(controller.signal)
      .then(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [fetchSettings, userId]);

  const ensureSettings = useCallback(async (userId: string) => {
    if (settings) return settings;

    const { data: existing } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const merged = { ...existing, email_templates_json: mergeEmailTemplates(existing.email_templates_json) };
      setSettings(merged);
      return merged;
    }

    const { data: created, error: createError } = await supabase
      .from('admin_settings')
      .upsert({ user_id: userId })
      .select()
      .single();

    if (createError) {
      console.error('Error creating settings:', createError);
      return null;
    }

    const mergedCreated = { ...created, email_templates_json: mergeEmailTemplates(created.email_templates_json) };
    setSettings(mergedCreated);
    return mergedCreated;
  }, [settings]);

  const updateSettings = useCallback(async (updates: Partial<AdminSettings>) => {
    if (!settings) return;

    const { data, error: mutationError } = await supabase
      .from('admin_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single();

    if (mutationError) {
      console.error('Error updating settings:', mutationError);
      throw mutationError;
    }

    const mergedData = { ...data, email_templates_json: mergeEmailTemplates(data.email_templates_json) };
    setSettings(mergedData);
    return mergedData;
  }, [settings]);

  const resetSettings = useCallback(async () => {
    if (!settings) return;

    const defaults = {
      business_name: '',
      contact_email: '',
      contact_phone: '',
      booking_lead_hours: 2,
      booking_window_days: 90,
      buffer_minutes: 15,
      slot_increment_minutes: 15,
      notification_enabled: false,
      notification_lead_hours: 24,
      notification_email: '',
      client_reminder_lead_hours: 24,
      admin_reminder_mode: 'individual',
      admin_daily_summary_time: '07:00',
      admin_daily_summary_night_before: false,
      email_invite_enabled: true,
      email_confirmation_enabled: true,
      email_notification_enabled: true,
      email_announcement_enabled: true,
      email_cancellation_enabled: true,
      email_reschedule_enabled: true,
      email_recurring_confirmation_enabled: true,
      email_change_enabled: true,
      email_include_company_info: true,
      email_include_zoom: true,
      email_include_phone: true,
      email_include_google_calendar: true,
      email_invite_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_confirmation_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_notification_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_announcement_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_cancellation_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_reschedule_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_recurring_confirmation_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_change_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_admin_change_enabled: true,
      email_admin_change_template: null,
      email_admin_change_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_admin_new_booking_notification_enabled: true,
      email_admin_new_booking_notification_template: null,
      email_admin_new_booking_notification_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_admin_event_notification_enabled: false,
      email_admin_event_notification_template: null,
      email_admin_event_notification_elements: { company_info: true, zoom: true, phone: true, google_calendar: true },
      email_admin_event_notification_lead_hours: 24,
      email_admin_daily_summary_enabled: false,
      email_invite_template: null,
      email_confirmation_template: null,
      email_notification_template: null,
      email_announcement_template: null,
      email_cancellation_template: null,
      email_reschedule_template: null,
      email_recurring_confirmation_template: null,
      email_change_template: null,
      email_templates_json: null,
      email_from_name: '',
      email_from_address: '',
      zoom_enabled: false,
      zoom_default_link: null,
      site_url: null,
      timezone: 'America/New_York',
      google_calendar_auto_sync: false,
    };

    const { data, error: mutationError } = await supabase
      .from('admin_settings')
      .update({ ...defaults, updated_at: new Date().toISOString() })
      .eq('id', settings.id)
      .select()
      .single();

    if (mutationError) {
      console.error('Error resetting settings:', mutationError);
      throw mutationError;
    }

    const mergedReset = { ...data, email_templates_json: mergeEmailTemplates(data.email_templates_json) };
    setSettings(mergedReset);
    return mergedReset;
  }, [settings]);

  return { settings, loading, error, fetchSettings, ensureSettings, updateSettings, resetSettings };
}
