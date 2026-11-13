import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  listGoogleCalendars,
  updateGoogleBusySettings,
  type GoogleCalendarOption,
} from '@/lib/googleCalendarSync';
import type { GoogleCalendarConnection } from '@/lib/types';

interface GoogleBusyTimesSettingsProps {
  connection: GoogleCalendarConnection;
  onSaved: () => void;
}

export default function GoogleBusyTimesSettings({ connection, onSaved }: GoogleBusyTimesSettingsProps) {
  const [calendars, setCalendars] = useState<GoogleCalendarOption[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(connection.busy_calendar_ids);
  const [blockEnabled, setBlockEnabled] = useState(connection.block_busy_times);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listGoogleCalendars()
      .then(list => {
        if (!cancelled) setCalendars(list);
      })
      .catch(err => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Could not load your calendars');
      })
      .finally(() => {
        if (!cancelled) setLoadingCalendars(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const savedIds = connection.busy_calendar_ids;
  const dirty =
    blockEnabled !== connection.block_busy_times ||
    selectedIds.length !== savedIds.length ||
    selectedIds.some(id => !savedIds.includes(id));
  const needsCalendar = blockEnabled && selectedIds.length === 0;

  const toggleCalendar = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateGoogleBusySettings(connection.id, {
        busy_calendar_ids: selectedIds,
        block_busy_times: blockEnabled,
      });
      onSaved();
    } catch (err) {
      console.error('Error saving busy time settings:', err);
      setSaveError("Couldn't save your calendar settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Block busy times</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Clients can only book times that are free on the calendars you choose. Event titles are never shown to clients.
        </p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={blockEnabled}
          onChange={e => setBlockEnabled(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-jungo-green-500 focus:ring-jungo-green-500"
        />
        <span className="text-sm font-medium text-gray-700">Block times that conflict with my Google Calendar</span>
      </label>

      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Calendars to check</p>
        {loadingCalendars ? (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading calendars...
          </div>
        ) : loadError ? (
          <p className="text-xs text-red-600">{loadError}</p>
        ) : calendars.length === 0 ? (
          <p className="text-xs text-gray-400">No calendars found on this Google account.</p>
        ) : (
          <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
            {calendars.map(cal => (
              <label key={cal.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(cal.id)}
                  onChange={() => toggleCalendar(cal.id)}
                  className="w-4 h-4 rounded border-gray-300 text-jungo-green-500 focus:ring-jungo-green-500"
                />
                <span className="text-sm text-gray-700 truncate">{cal.name}</span>
                {cal.primary && <span className="text-xs text-gray-400 flex-shrink-0">Primary</span>}
              </label>
            ))}
          </div>
        )}
      </div>

      {needsCalendar && (
        <p className="text-xs text-amber-600">Choose at least one calendar to block busy times.</p>
      )}
      {saveError && <p className="text-xs text-red-600">{saveError}</p>}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!dirty || needsCalendar || saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-jungo-green-600 rounded-lg hover:bg-jungo-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save calendar settings'}
        </button>
      </div>
    </div>
  );
}
