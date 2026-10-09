import { useState, useEffect, memo } from 'react';
import { render } from '@react-email/render';
import { EmailShell } from '@/components/emails/EmailShell';
import { EmailComponentRenderer } from '@/components/emails/EmailComponentRenderer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { EmailTemplate } from '@/lib/types';

const PREVIEW_DATA: Record<string, any> = {
  client_name: 'Jane Doe',
  business_name: 'Jungo Solutions',
  date: 'Monday, October 13, 2026',
  time: '2:00 PM',
  duration: '30',
  booking_link: 'https://example.com/manage/abc123',
  notes_to_client: 'Looking forward to our session. Please come prepared with your questions.',
  client_notes: 'I would like to discuss the quarterly report.',
  zoom_link: 'https://zoom.us/j/123456789',
  zoom_passcode: '482910',
  google_calendar_url: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting',
  business_contact_email: 'contact@jungosolutions.com',
  business_contact_phone: '+1 (555) 123-4567',
  admin_timezone: 'America/New_York',
  client_timezone: 'America/New_York',
  old_date: '2026-10-12',
  old_time: '10:00',
  new_date: '2026-10-13',
  new_time: '14:00',
  change_type: 'rescheduled',
  change_details: 'The meeting was moved from October 12 at 10:00 AM to October 13 at 2:00 PM.',
  client_email: 'jane.doe@example.com',
  session_list: [
    { date: '2026-10-13', start_time: '14:00' },
    { date: '2026-10-20', start_time: '14:00' },
    { date: '2026-10-27', start_time: '14:00' },
  ],
};

interface EmailPreviewProps {
  template: EmailTemplate;
  logoUrl?: string;
}

function EmailPreviewInner({ template, logoUrl }: EmailPreviewProps) {
  const [html, setHtml] = useState('');
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setRendering(true);

    const tree = (
      <EmailShell previewText={template.previewText ?? ''} logoUrl={logoUrl}>
        {(template.component.children ?? []).map((child) => (
          <EmailComponentRenderer key={child.id} component={child} data={PREVIEW_DATA} />
        ))}
      </EmailShell>
    );

    render(tree)
      .then((result) => {
        if (!cancelled) {
          setHtml(result);
          setRendering(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Email render error:', err);
          setHtml('<p style="color:#999;padding:24px;text-align:center;">Preview failed to render.</p>');
          setRendering(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [template, logoUrl]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <span className="text-sm font-medium text-gray-600">Live Preview</span>
        {rendering && <LoadingSpinner size="sm" />}
      </div>
      <div className="flex-1 overflow-hidden bg-gray-100 flex items-start justify-center p-4">
        <iframe
          srcDoc={html}
          sandbox="allow-same-origin"
          title="Email Preview"
          className="w-full max-w-[600px] bg-white border border-gray-200 rounded-lg shadow-sm"
          style={{ minHeight: '600px', height: '100%' }}
        />
      </div>
    </div>
  );
}

export const EmailPreview = memo(EmailPreviewInner);
