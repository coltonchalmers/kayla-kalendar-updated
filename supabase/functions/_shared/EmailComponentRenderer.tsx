import {
  Heading,
  Text,
  Button,
  Hr,
  Section,
  Link,
} from "npm:@react-email/components@0.0.36";
import type {
  EmailComponent,
  HeadingProps,
  TextProps,
  ButtonProps,
  DividerProps,
  SpacerProps,
  NotesToClientProps,
  ClientNotesProps,
  ManageBookingLinkProps,
} from './emailTypes.ts';
import { formatTime, formatDisplayDate, convertTimeSlotWithDate } from './emailUtils.ts';

export function replacePlaceholders(text: string, data: Record<string, any>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const value = data[key];
    if (value === undefined || value === null) return '';
    return String(value);
  });
}

interface EmailComponentRendererProps {
  component: EmailComponent;
  data: Record<string, any>;
}

export function EmailComponentRenderer({ component, data }: EmailComponentRendererProps) {
  switch (component.type) {
    case 'heading':
      return renderHeading(component.props as HeadingProps, data);
    case 'text':
      return renderText(component.props as TextProps, data);
    case 'button':
      return renderButton(component.props as ButtonProps, data);
    case 'divider':
      return renderDivider(component.props as DividerProps);
    case 'spacer':
      return renderSpacer(component.props as SpacerProps);
    case 'zoom':
      return renderZoom(data);
    case 'phoneContact':
      return renderPhoneContact(data);
    case 'googleCalendar':
      return renderGoogleCalendar(data);
    case 'notesToClient':
      return renderNotesToClient(component.props as NotesToClientProps, data);
    case 'clientNotes':
      return renderClientNotes(component.props as ClientNotesProps, data);
    case 'manageBookingLink':
      return renderManageBookingLink(component.props as ManageBookingLinkProps, data);
    case 'footer':
      return renderFooter(data);
    case 'sessionList':
      return renderSessionList(data);
    case 'rescheduleDetails':
      return renderRescheduleDetails(data);
    case 'changeDetails':
      return renderChangeDetails(data);
    default:
      return null;
  }
}

function renderHeading(props: HeadingProps, data: Record<string, any>) {
  const level = props.level ?? 1;
  const content = replacePlaceholders(props.text, data);
  const fontSize = level === 1 ? '28px' : level === 2 ? '24px' : '20px';
  const align = props.textAlign ?? 'left';

  return (
    <Heading
      as={level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3'}
      style={{
        color: '#6A4E3E',
        fontSize,
        fontWeight: 700,
        textAlign: align,
        margin: '0 0 16px 0',
        lineHeight: '1.2',
      }}
    >
      {content}
    </Heading>
  );
}

function renderText(props: TextProps, data: Record<string, any>) {
  const content = replacePlaceholders(props.text, data);
  const align = props.textAlign ?? 'left';

  return (
    <Text
      style={{
        color: '#1F2937',
        fontSize: '15px',
        lineHeight: '1.6',
        textAlign: align,
        margin: '0 0 16px 0',
      }}
    >
      {content}
    </Text>
  );
}

function renderButton(props: ButtonProps, data: Record<string, any>) {
  const text = replacePlaceholders(props.text, data);
  const href = replacePlaceholders(props.href, data);
  const bgColor = props.buttonColor ?? '#059669';
  const txtColor = props.textColor ?? '#FFFFFF';
  const align = props.textAlign ?? 'left';

  return (
    <Section style={{ textAlign: align, margin: '16px 0' }}>
      <Button
        href={href}
        style={{
          backgroundColor: bgColor,
          color: txtColor,
          display: 'inline-block',
          padding: '12px 24px',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        {text}
      </Button>
    </Section>
  );
}

function renderDivider(props: DividerProps) {
  const color = props.color ?? '#E5E7EB';
  const padding = props.padding ?? 16;

  return (
    <Hr
      style={{
        borderColor: color,
        borderTopWidth: '1px',
        margin: `${padding}px 0`,
      }}
    />
  );
}

function renderSpacer(props: SpacerProps) {
  const height = props.height ?? 20;

  return <Section style={{ height: `${height}px`, lineHeight: `${height}px` }} />;
}

function renderZoom(data: Record<string, any>) {
  if (!data.zoom_link) return null;

  return (
    <Section
      style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '8px',
      }}
    >
      <Text style={{ margin: 0, fontWeight: 600, color: '#166534', fontSize: '15px' }}>
        Zoom Meeting
      </Text>
      <Text style={{ margin: '8px 0 0 0' }}>
        <Link
          href={data.zoom_link}
          style={{ color: '#047857', wordBreak: 'break-all', fontSize: '14px' }}
        >
          {data.zoom_link}
        </Link>
      </Text>
      {data.zoom_passcode && (
        <Text style={{ margin: '4px 0 0 0', color: '#166534', fontSize: '14px' }}>
          Passcode: {data.zoom_passcode}
        </Text>
      )}
    </Section>
  );
}

function renderPhoneContact(data: Record<string, any>) {
  if (!data.business_contact_phone) return null;

  return (
    <Section
      style={{
        marginTop: '12px',
        padding: '12px',
        backgroundColor: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
      }}
    >
      <Text style={{ margin: 0, fontWeight: 600, color: '#374151', fontSize: '15px' }}>
        Phone
      </Text>
      <Text style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
        {data.business_contact_phone}
      </Text>
    </Section>
  );
}

function renderGoogleCalendar(data: Record<string, any>) {
  if (!data.google_calendar_url) return null;

  return (
    <Section style={{ marginTop: '12px' }}>
      <Button
        href={data.google_calendar_url}
        style={{
          display: 'inline-block',
          padding: '8px 16px',
          backgroundColor: '#1A73E8',
          color: '#FFFFFF',
          textDecoration: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        Add to Google Calendar
      </Button>
    </Section>
  );
}

function renderNotesToClient(props: NotesToClientProps, data: Record<string, any>) {
  if (!data.notes_to_client) return null;
  const label = props.label ?? 'Notes';

  return (
    <Section
      style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
      }}
    >
      <Text style={{ margin: 0, fontWeight: 600, color: '#374151', fontSize: '14px' }}>
        {label}
      </Text>
      <Text style={{ margin: '4px 0 0 0', color: '#4B5563', fontSize: '14px', lineHeight: '1.6' }}>
        {data.notes_to_client}
      </Text>
    </Section>
  );
}

function renderClientNotes(props: ClientNotesProps, data: Record<string, any>) {
  if (!data.client_notes) return null;
  const label = props.label ?? 'Client Notes';

  return (
    <Section
      style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
      }}
    >
      <Text style={{ margin: 0, fontWeight: 600, color: '#374151', fontSize: '14px' }}>
        {label}
      </Text>
      <Text style={{ margin: '4px 0 0 0', color: '#4B5563', fontSize: '14px', lineHeight: '1.6' }}>
        {data.client_notes}
      </Text>
    </Section>
  );
}

function renderManageBookingLink(props: ManageBookingLinkProps, data: Record<string, any>) {
  if (!data.booking_link) return null;
  const text = props.text ?? 'Manage Your Booking';
  const bgColor = props.buttonColor ?? '#059669';

  return (
    <Section style={{ marginTop: '16px', textAlign: 'center' }}>
      <Button
        href={data.booking_link}
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: bgColor,
          color: '#FFFFFF',
          textDecoration: 'none',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: 600,
        }}
      >
        {text}
      </Button>
    </Section>
  );
}

function renderFooter(data: Record<string, any>) {
  if (!data.business_name) return null;

  return (
    <Section style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
      <Text style={{ margin: 0, fontWeight: 600, color: '#374151', fontSize: '15px' }}>
        {data.business_name}
      </Text>
      {data.business_contact_email && (
        <Text style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
          {data.business_contact_email}
        </Text>
      )}
      {data.business_contact_phone && (
        <Text style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
          {data.business_contact_phone}
        </Text>
      )}
    </Section>
  );
}

interface SessionItem {
  date: string;
  start_time: string;
}

function renderSessionList(data: Record<string, any>) {
  const sessions: SessionItem[] = data.session_list;
  if (!sessions || !Array.isArray(sessions) || sessions.length === 0) return null;

  const adminTz = data.admin_timezone ?? 'America/New_York';
  const clientTz = data.client_timezone ?? adminTz;

  const formattedSessions = sessions.map((s) => {
    let dateStr = s.date;
    let timeStr = s.start_time;

    if (clientTz !== adminTz) {
      const converted = convertTimeSlotWithDate(s.start_time, s.date, adminTz, clientTz);
      dateStr = converted.date;
      timeStr = converted.time;
    }

    return {
      date: formatDisplayDate(dateStr),
      time: formatTime(timeStr),
    };
  });

  return (
    <Section style={{ marginTop: '16px' }}>
      <Text style={{ margin: '0 0 12px 0', fontWeight: 600, color: '#6A4E3E', fontSize: '16px' }}>
        Scheduled Sessions
      </Text>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {formattedSessions.map((s, i) => (
            <tr
              key={i}
              style={{
                backgroundColor: i % 2 === 0 ? '#F9FAFB' : '#FFFFFF',
              }}
            >
              <td
                style={{
                  padding: '8px 12px',
                  color: '#6B7280',
                  fontSize: '14px',
                  fontWeight: 600,
                  width: '32px',
                  verticalAlign: 'top',
                }}
              >
                {i + 1}.
              </td>
              <td
                style={{
                  padding: '8px 12px',
                  color: '#1F2937',
                  fontSize: '14px',
                }}
              >
                {s.date} at {s.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

function convertDateTime(
  dateStr: string,
  timeStr: string,
  data: Record<string, any>
): { date: string; time: string } {
  const adminTz = data.admin_timezone ?? 'America/New_York';
  const clientTz = data.client_timezone ?? adminTz;

  if (clientTz !== adminTz) {
    return convertTimeSlotWithDate(timeStr, dateStr, adminTz, clientTz);
  }
  return { date: dateStr, time: timeStr };
}

function renderRescheduleDetails(data: Record<string, any>) {
  if (!data.old_date && !data.new_date) return null;

  const oldConverted = data.old_date
    ? convertDateTime(data.old_date, data.old_time ?? '00:00', data)
    : null;
  const newConverted = data.new_date
    ? convertDateTime(data.new_date, data.new_time ?? '00:00', data)
    : null;

  const oldDisplay = oldConverted
    ? `${formatDisplayDate(oldConverted.date)} at ${formatTime(oldConverted.time)}`
    : '';
  const newDisplay = newConverted
    ? `${formatDisplayDate(newConverted.date)} at ${formatTime(newConverted.time)}`
    : '';

  return (
    <Section
      style={{
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ width: '50%', padding: '8px 12px', verticalAlign: 'top' }}>
              <Text style={{ margin: 0, color: '#6B7280', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
                Previous
              </Text>
              <Text
                style={{
                  margin: '4px 0 0 0',
                  color: '#6B7280',
                  fontSize: '15px',
                  textDecoration: 'line-through',
                }}
              >
                {oldDisplay}
              </Text>
            </td>
            <td style={{ width: '50%', padding: '8px 12px', verticalAlign: 'top' }}>
              <Text style={{ margin: 0, color: '#047857', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase' }}>
                New
              </Text>
              <Text style={{ margin: '4px 0 0 0', color: '#047857', fontSize: '15px', fontWeight: 600 }}>
                {newDisplay}
              </Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

function renderChangeDetails(data: Record<string, any>) {
  if (!data.change_type && !data.change_details) return null;

  const typeLabel = data.change_type
    ? data.change_type.charAt(0).toUpperCase() + data.change_type.slice(1)
    : '';

  return (
    <Section
      style={{
        marginTop: '16px',
        padding: '16px',
        backgroundColor: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
      }}
    >
      {typeLabel && (
        <Text style={{ margin: 0, fontWeight: 700, color: '#374151', fontSize: '16px' }}>
          {typeLabel}
        </Text>
      )}
      {data.change_details && (
        <Text
          style={{
            margin: typeLabel ? '8px 0 0 0' : '0',
            color: '#4B5563',
            fontSize: '14px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
          }}
        >
          {data.change_details}
        </Text>
      )}
    </Section>
  );
}
