import { useState, useEffect, memo } from 'react';
import { render } from '@react-email/render';
import { EmailShell } from '@/components/emails/EmailShell';
import { EmailComponentRenderer, replacePlaceholders } from '@/components/emails/EmailComponentRenderer';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { EmailTemplate } from '@/lib/types';

const PREVIEW_DATA: Record<string, any> = {
  client_name: 'Jane Doe',
  business_name: 'Jungo Solutions',
  date: 'Monday, October 13, 2026',
  time: '7:00 PM',
  client_date: 'Monday, October 13, 2026',
  client_time: '7:00 PM',
  admin_date: 'Monday, October 13, 2026',
  admin_time: '2:00 PM',
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
  client_timezone: 'Europe/London',
  old_date: '2026-10-12',
  old_time: '10:00',
  new_date: '2026-10-13',
  new_time: '14:00',
  change_type: 'updated',
  change_details: 'Notes to client updated:\nLooking forward to our session. Please come prepared with your questions.',
  client_email: 'jane.doe@example.com',
  client_status: 'New client',
  meeting_location: 'Zoom',
  guests: 'sam.guest@example.com',
  session_list: [
    { date: '2026-10-13', start_time: '14:00' },
    { date: '2026-10-20', start_time: '14:00' },
    { date: '2026-10-27', start_time: '14:00' },
  ],
};

interface EmailPreviewProps {
  template: EmailTemplate;
}

function EmailPreviewInner({ template }: EmailPreviewProps) {
  const [html, setHtml] = useState('');
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setRendering(true);

    const tree = (
      <EmailShell previewText={replacePlaceholders(template.previewText ?? '', PREVIEW_DATA)} assetBaseUrl={window.location.origin}>
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
          setHtml('<p style="color:#8E8E8E;padding:24px;text-align:center;">Preview failed to render.</p>');
          setRendering(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [template]);

  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <span className="text-sm font-medium text-gray-600">Live Preview</span>
        {rendering && <LoadingSpinner size="sm" />}
      </div>
      <div className="flex-1 min-h-0 bg-gray-100 flex justify-center p-4">
        <iframe
          srcDoc={html}
          sandbox="allow-same-origin"
          title="Email Preview"
          className="h-full w-full max-w-[600px] bg-white border border-gray-200 rounded-lg shadow-sm"
        />
      </div>
    </div>
  );
}

export const EmailPreview = memo(EmailPreviewInner);
