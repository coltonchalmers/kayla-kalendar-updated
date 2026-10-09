import { useState, useEffect, useCallback } from 'react';
import { Save, Check, Mail, Settings2, RotateCcw, ChevronDown, Calendar, Video, AlertTriangle, Link2, Unlink, Loader2, Send } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useAuth } from '@/hooks/useAuth';
import { triggerDummyEmail } from '@/lib/bookingEmails';
import { defaultEmailTemplates } from '@/lib/emailDefaults';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Select from '@/components/ui/Select';
import { classNames, getTimezoneOptions } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import EmailEditor from '@/components/admin/EmailEditor';
import { EmailPreview } from '@/components/admin/EmailPreview';
import type { AllEmailTemplates, EmailTypeKey } from '@/lib/types';

type TabId = 'general' | 'emails' | 'integrations';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

const EMAIL_ENABLE_TOGGLES: { key: string; label: string; settingKey: string }[] = [
  { key: 'confirmation', label: 'Confirmation', settingKey: 'email_confirmation_enabled' },
  { key: 'recurring_confirmation', label: 'Recurring Confirmation', settingKey: 'email_recurring_confirmation_enabled' },
  { key: 'cancellation', label: 'Cancellation', settingKey: 'email_cancellation_enabled' },
  { key: 'reschedule', label: 'Reschedule', settingKey: 'email_reschedule_enabled' },
  { key: 'change', label: 'Booking Changed', settingKey: 'email_change_enabled' },
  { key: 'invite', label: 'Invite', settingKey: 'email_invite_enabled' },
  { key: 'notification', label: 'Reminder', settingKey: 'email_notification_enabled' },
  { key: 'admin_change_notification', label: 'Admin Change Notification', settingKey: 'email_admin_change_enabled' },
];

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function GoogleCalendarCard({
  autoSync,
  onAutoSyncChange,
}: {
  autoSync: boolean;
  onAutoSyncChange: (v: boolean) => void;
}) {
  const { connection, loading, connecting, connect, disconnect, error } = useGoogleCalendar();
  const isConnected = !!connection && !connection.disconnected_at;

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Calendar className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Google Calendar</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        Automatically add every confirmed booking to your Google Calendar as a real event.
        Reschedules and cancellations sync automatically. This is separate from the
        "Include Google Calendar link in emails" toggle on the Emails tab — that link
        is for your clients to add the meeting to their own calendar.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking connection status...
        </div>
      ) : isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-jungo-green-50 border border-jungo-green-200">
            <div className="w-8 h-8 rounded-full bg-jungo-green-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-4 h-4 text-jungo-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-jungo-green-800">Connected</p>
              <p className="text-xs text-jungo-green-600 truncate">{connection?.google_email}</p>
            </div>
            <button
              onClick={disconnect}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
            >
              <Unlink className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={e => onAutoSyncChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-jungo-green-500 focus:ring-jungo-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Automatically add meetings to my Google Calendar</span>
          </label>

          {connection?.last_error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-800">Sync issue detected</p>
                <p className="text-xs text-amber-600 mt-0.5">{connection.last_error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Not connected</p>
              <p className="text-xs text-gray-400">Connect your Google account to enable auto-sync</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={connect}
            disabled={connecting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-jungo-green-600 rounded-lg hover:bg-jungo-green-700 transition-colors disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {connecting ? 'Connecting...' : 'Connect Google Calendar'}
          </button>
        </div>
      )}
    </Card>
  );
}

export default function SettingsPage() {
  const { settings, loading, updateSettings, resetSettings } = useSettings();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // General tab
  const [businessName, setBusinessName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [leadHours, setLeadHours] = useState('2');
  const [windowDays, setWindowDays] = useState('90');
  const [bufferMinutes, setBufferMinutes] = useState('15');
  const [slotIncrement, setSlotIncrement] = useState('15');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifLeadHours, setNotifLeadHours] = useState('24');
  const [notifEmail, setNotifEmail] = useState('');
  const [clientReminderLeadHours, setClientReminderLeadHours] = useState('24');
  const [adminReminderMode, setAdminReminderMode] = useState<'individual' | 'daily'>('individual');
  const [adminDailySummaryTime, setAdminDailySummaryTime] = useState('07:00');
  const [adminDailySummaryNightBefore, setAdminDailySummaryNightBefore] = useState(false);

  // Emails tab
  const [selectedEmailKey, setSelectedEmailKey] = useState<EmailTypeKey>('confirmation');
  const [emailTemplatesJson, setEmailTemplatesJson] = useState<AllEmailTemplates>(defaultEmailTemplates);
  const [emailTemplatesInitialized, setEmailTemplatesInitialized] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [emailEnableMap, setEmailEnableMap] = useState<Record<string, boolean>>({
    confirmation: true,
    recurring_confirmation: true,
    cancellation: true,
    reschedule: true,
    change: true,
    invite: true,
    notification: true,
    admin_change_notification: true,
  });

  // Integrations tab
  const [emailFromName, setEmailFromName] = useState('');
  const [emailFromAddress, setEmailFromAddress] = useState('');
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [zoomDefaultLink, setZoomDefaultLink] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [googleAutoSync, setGoogleAutoSync] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setBusinessName(settings.business_name);
      setContactEmail(settings.contact_email);
      setContactPhone(settings.contact_phone);
      setLeadHours(settings.booking_lead_hours.toString());
      setWindowDays(settings.booking_window_days.toString());
      setBufferMinutes((settings.buffer_minutes ?? 15).toString());
      setSlotIncrement((settings.slot_increment_minutes ?? 15).toString());
      setNotifEnabled(settings.notification_enabled ?? false);
      setNotifLeadHours(settings.notification_lead_hours?.toString() || '24');
      setNotifEmail(settings.notification_email || '');
      setClientReminderLeadHours((settings.client_reminder_lead_hours ?? 24).toString());
      setAdminReminderMode((settings.admin_reminder_mode as 'individual' | 'daily') || 'individual');
      setAdminDailySummaryTime(settings.admin_daily_summary_time || '07:00');
      setAdminDailySummaryNightBefore(settings.admin_daily_summary_night_before ?? false);

      setEmailEnableMap({
        confirmation: settings.email_confirmation_enabled ?? true,
        recurring_confirmation: settings.email_recurring_confirmation_enabled ?? true,
        cancellation: settings.email_cancellation_enabled ?? true,
        reschedule: settings.email_reschedule_enabled ?? true,
        change: settings.email_change_enabled ?? true,
        invite: settings.email_invite_enabled ?? true,
        notification: settings.email_notification_enabled ?? true,
        admin_change_notification: settings.email_admin_change_enabled ?? true,
      });

      if (!emailTemplatesInitialized && settings.email_templates_json) {
        setEmailTemplatesJson(settings.email_templates_json);
        setEmailTemplatesInitialized(true);
      } else if (!emailTemplatesInitialized) {
        setEmailTemplatesJson(defaultEmailTemplates);
        setEmailTemplatesInitialized(true);
      }

      setEmailFromName(settings.email_from_name || settings.business_name);
      setEmailFromAddress(settings.email_from_address || 'lindsey@jungosolutions.com');
      setZoomEnabled(settings.zoom_enabled ?? false);
      setZoomDefaultLink(settings.zoom_default_link || '');
      setSiteUrl(settings.site_url || '');
      setTimezone(settings.timezone || 'America/New_York');
      setGoogleAutoSync(settings.google_calendar_auto_sync ?? false);
    }
  }, [settings, emailTemplatesInitialized]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (contactEmail && !isValidEmail(contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    if (notifEmail && !isValidEmail(notifEmail)) {
      newErrors.notifEmail = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaved(false);
    setSaveError(false);
    try {
      await updateSettings({
        business_name: businessName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        booking_lead_hours: parseInt(leadHours) || 2,
        booking_window_days: parseInt(windowDays) || 90,
        buffer_minutes: parseInt(bufferMinutes) || 0,
        slot_increment_minutes: parseInt(slotIncrement) || 15,
        notification_enabled: notifEnabled,
        notification_lead_hours: parseInt(notifLeadHours) || 24,
        notification_email: notifEmail.trim(),
        client_reminder_lead_hours: parseInt(clientReminderLeadHours) || 24,
        admin_reminder_mode: adminReminderMode,
        admin_daily_summary_time: adminDailySummaryTime,
        admin_daily_summary_night_before: adminDailySummaryNightBefore,
        email_confirmation_enabled: emailEnableMap.confirmation,
        email_recurring_confirmation_enabled: emailEnableMap.recurring_confirmation,
        email_cancellation_enabled: emailEnableMap.cancellation,
        email_reschedule_enabled: emailEnableMap.reschedule,
        email_change_enabled: emailEnableMap.change,
        email_invite_enabled: emailEnableMap.invite,
        email_notification_enabled: emailEnableMap.notification,
        email_admin_change_enabled: emailEnableMap.admin_change_notification,
        email_templates_json: emailTemplatesJson,
        email_from_name: emailFromName,
        email_from_address: emailFromAddress.trim(),
        zoom_enabled: zoomEnabled,
        zoom_default_link: zoomDefaultLink.trim() || null,
        site_url: siteUrl.trim() || null,
        timezone,
        google_calendar_auto_sync: googleAutoSync,
      });
      setSaved(true);
      addToast('Settings saved successfully.', 'success');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setSaveError(true);
      addToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetSettings();
      setShowResetConfirm(false);
      setEmailTemplatesInitialized(false);
      addToast('All settings reset to defaults.', 'success');
    } catch (err) {
      console.error(err);
      addToast('Failed to reset settings.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleSendTestEmail = async () => {
    const adminEmail = user?.email;
    if (!adminEmail) {
      addToast('No admin email address found. Please log in again.', 'error');
      return;
    }

    setSendingTestEmail(true);
    try {
      const result = await triggerDummyEmail(
        selectedEmailKey as any,
        adminEmail,
        user?.id
      );
      if (result.success && result.sent) {
        addToast(`Test email sent to ${adminEmail}.`, 'success');
      } else if (result.success && result.skipped) {
        addToast(`Test email skipped: ${result.reason}`, 'error');
      } else {
        addToast(
          `Failed to send test email: ${result.error?.message || 'Unknown error'}`,
          'error'
        );
      }
    } catch (err) {
      addToast('Failed to send test email. Please try again.', 'error');
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  const selectedTemplate = emailTemplatesJson[selectedEmailKey]!;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={classNames(
              'px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in max-w-sm',
              toast.type === 'success'
                ? 'bg-jungo-green-600 text-white'
                : 'bg-red-500 text-white'
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Configure your scheduling preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('general')}
          className={classNames(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'general'
              ? 'border-jungo-green-500 text-jungo-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Settings2 className="w-4 h-4" />
          General
        </button>
        <button
          onClick={() => setActiveTab('emails')}
          className={classNames(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'emails'
              ? 'border-jungo-green-500 text-jungo-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Mail className="w-4 h-4" />
          Emails
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={classNames(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            activeTab === 'integrations'
              ? 'border-jungo-green-500 text-jungo-green-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Video className="w-4 h-4" />
          Integrations
        </button>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-8">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Business Information</h2>
            <div className="space-y-4">
              <Input label="Business Name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
              <Input label="Contact Email" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="admin@jungosolutions.com" error={errors.contactEmail} />
              <Input label="Contact Phone" type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="(555) 123-4567" />
              <Input
                label="Public Site URL"
                type="url"
                value={siteUrl}
                onChange={e => setSiteUrl(e.target.value)}
                placeholder="https://your-app.bolt.host"
                hint="The public address of your booking app. Used to build 'manage your booking' links in reminder emails sent by the automated scheduler. Booking emails triggered from the app detect this automatically."
              />
              <Select
                label="Your Timezone"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                options={getTimezoneOptions()}
                hint="Times shown on your calendar and in availability rules are in this timezone. Client booking pages convert to the client's local time automatically."
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Booking Rules</h2>
            <div className="space-y-4">
              <Input
                label="Minimum Lead Time (hours)"
                type="number"
                value={leadHours}
                onChange={e => setLeadHours(e.target.value)}
                min="0"
                hint="How far in advance clients must book. Also blocks clients from cancelling or rescheduling within this window."
              />
              <Input
                label="Booking Window (days)"
                type="number"
                value={windowDays}
                onChange={e => setWindowDays(e.target.value)}
                min="7"
                max="365"
                hint="How far ahead clients can see the calendar"
              />
              <Input
                label="Buffer Between Meetings (minutes)"
                type="number"
                value={bufferMinutes}
                onChange={e => setBufferMinutes(e.target.value)}
                min="0"
                max="120"
                hint="Padding time required between consecutive bookings"
              />
              <Select
                label="Time Slot Increment"
                value={slotIncrement}
                onChange={e => setSlotIncrement(e.target.value)}
                options={[
                  { value: '5', label: '5 minutes' },
                  { value: '10', label: '10 minutes' },
                  { value: '15', label: '15 minutes' },
                  { value: '20', label: '20 minutes' },
                  { value: '30', label: '30 minutes' },
                  { value: '60', label: '60 minutes' },
                ]}
              />
              <p className="text-xs text-gray-500 -mt-2">How far apart time slots are spaced on the booking calendar</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Admin Notifications</h2>
            <p className="text-sm text-gray-500 mb-5">Get notified about upcoming meetings before they happen.</p>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifEnabled}
                  onChange={e => setNotifEnabled(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-jungo-green-500 focus:ring-jungo-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable upcoming meeting notifications</span>
              </label>
              <Select
                label="Admin Reminder Mode"
                value={adminReminderMode}
                onChange={e => setAdminReminderMode(e.target.value as 'individual' | 'daily')}
                options={[
                  { value: 'individual', label: 'Individual Reminders (sent at lead time before each meeting)' },
                  { value: 'daily', label: 'Daily Summary (one email listing all meetings for the day)' },
                ]}
              />
              {adminReminderMode === 'individual' ? (
                <Input
                  label="Notify me this many hours before each meeting"
                  type="number"
                  value={notifLeadHours}
                  onChange={e => setNotifLeadHours(e.target.value)}
                  min="1"
                  max="168"
                  hint="e.g., 24 = notify 1 day before, 2 = notify 2 hours before"
                />
              ) : (
                <>
                  <Input
                    label="Daily Summary Time"
                    type="time"
                    value={adminDailySummaryTime}
                    onChange={e => setAdminDailySummaryTime(e.target.value)}
                    hint="When to send the daily summary (defaults to 7:00 AM)"
                  />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminDailySummaryNightBefore}
                      onChange={e => setAdminDailySummaryNightBefore(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-jungo-green-500 focus:ring-jungo-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Send the night before instead of the morning of</span>
                  </label>
                </>
              )}
              <Input
                label="Notification email"
                type="email"
                value={notifEmail}
                onChange={e => setNotifEmail(e.target.value)}
                placeholder="Leave blank to use contact email"
                hint="Where to send meeting reminders"
                error={errors.notifEmail}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Client Reminders</h2>
            <p className="text-sm text-gray-500 mb-5">Automatically remind clients about their upcoming meetings.</p>
            <Input
              label="Client Reminder Lead Time (hours)"
              type="number"
              value={clientReminderLeadHours}
              onChange={e => setClientReminderLeadHours(e.target.value)}
              min="1"
              max="168"
              hint="e.g., 24 = remind clients 1 day before, 2 = remind 2 hours before"
            />
          </Card>
        </div>
      )}

      {/* Emails Tab */}
      {activeTab === 'emails' && (
        <div className="space-y-6" style={{ maxWidth: 'none' }}>
          {/* Enable/Disable Toggles */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Email Types</h2>
            <p className="text-sm text-gray-500 mb-4">Toggle which email types are sent. Use the editor below to customize content.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EMAIL_ENABLE_TOGGLES.map(({ key, label, settingKey }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailEnableMap[key] ?? true}
                    onChange={e => setEmailEnableMap(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-jungo-green-500 focus:ring-jungo-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Test Email Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={<Send className="w-4 h-4" />}
              onClick={handleSendTestEmail}
              loading={sendingTestEmail}
              disabled={!user?.email}
            >
              Send Test Email
            </Button>
            <span className="text-xs text-gray-400">
              {user?.email
                ? `Sends a test of the "${selectedEmailKey.replace(/_/g, ' ')}" email to ${user.email} with placeholder data.`
                : 'Log in to enable test emails.'}
            </span>
          </div>

          {/* Editor + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Editor</h2>
              <EmailEditor
                templates={emailTemplatesJson}
                onChange={setEmailTemplatesJson}
                selectedKey={selectedEmailKey}
                onSelectedKeyChange={setSelectedEmailKey}
              />
            </Card>
            <div className="lg:sticky lg:top-4 self-start">
              <EmailPreview template={selectedTemplate} />
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-8">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Email Service</h2>
            <p className="text-sm text-gray-500 mb-5">
              Configure how outgoing booking emails appear to recipients. Emails are sent via Resend.
            </p>
            <Input
              label="From Name"
              value={emailFromName}
              onChange={e => setEmailFromName(e.target.value)}
              hint="The display name shown in the From field of booking emails"
            />
            <Input
              label="From Email Address"
              type="email"
              value={emailFromAddress}
              onChange={e => setEmailFromAddress(e.target.value)}
              placeholder="lindsey@jungosolutions.com"
              hint="The email address booking emails are sent from. This must be a domain verified with your email provider."
            />
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Zoom Integration</h2>
            <p className="text-sm text-gray-500 mb-5">
              A default or overridden Zoom join link is included in the confirmation email.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={zoomEnabled}
                onChange={e => setZoomEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-jungo-green-500 focus:ring-jungo-green-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable automatic Zoom meeting creation</span>
            </label>
            <div className="mt-4">
              <Input
                label="Default Zoom Link"
                value={zoomDefaultLink}
                onChange={e => setZoomDefaultLink(e.target.value)}
                placeholder="https://zoom.us/j/12345678901"
                hint="Your personal Zoom link, used for all meetings unless a meeting type or individual booking has its own link."
              />
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Bookings or meeting types with a manual Zoom link override will use that link instead of the default.
            </p>
          </Card>

          <GoogleCalendarCard
            autoSync={googleAutoSync}
            onAutoSyncChange={setGoogleAutoSync}
          />
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          loading={saving}
          icon={saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          size="lg"
        >
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
        {saved && <span className="text-sm text-jungo-green-600">Changes saved successfully.</span>}
        {saveError && <span className="text-sm text-red-500">Failed to save. Check your connection and try again.</span>}
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-3">Reset all settings to their default values. This clears business info, booking rules, notification preferences, email templates, and integration settings.</p>
        <Button
          variant="danger"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={() => setShowResetConfirm(true)}
        >
          Reset All Settings to Defaults
        </Button>
      </div>

      <Modal open={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Reset All Settings" maxWidth="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Are you sure you want to reset all settings?</p>
              <p className="text-sm text-red-700 mt-1">
                This will clear your business name, contact info, booking rules, notification preferences, email templates, and integration settings. Meeting types and bookings will not be affected. This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReset} loading={resetting} icon={<RotateCcw className="w-4 h-4" />}>Yes, Reset Everything</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
