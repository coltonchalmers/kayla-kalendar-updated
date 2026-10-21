export type EmailComponentType =
  | 'heading'
  | 'text'
  | 'button'
  | 'divider'
  | 'spacer'
  | 'image'
  | 'row'
  | 'column'
  | 'link'
  | 'html'
  | 'zoom'
  | 'phoneContact'
  | 'googleCalendar'
  | 'notesToClient'
  | 'clientNotes'
  | 'manageBookingLink'
  | 'footer'
  | 'sessionList'
  | 'rescheduleDetails'
  | 'changeDetails';

export type TextAlign = 'left' | 'center' | 'right';

export interface HeadingProps {
  type: 'heading';
  text: string;
  level?: 1 | 2 | 3;
  textAlign?: TextAlign;
}

export interface TextProps {
  type: 'text';
  text: string;
  textAlign?: TextAlign;
}

export interface ButtonProps {
  type: 'button';
  text: string;
  href: string;
  buttonColor?: string;
  textColor?: string;
  textAlign?: TextAlign;
}

export interface DividerProps {
  type: 'divider';
  color?: string;
  padding?: number;
}

export interface SpacerProps {
  type: 'spacer';
  height?: number;
}

export interface ImageProps {
  type: 'image';
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface RowProps {
  type: 'row';
}

export interface ColumnProps {
  type: 'column';
  width?: number;
}

export interface LinkProps {
  type: 'link';
  text: string;
  href: string;
}

export interface HtmlProps {
  type: 'html';
  content: string;
}

export interface ZoomProps {
  type: 'zoom';
}

export interface PhoneContactProps {
  type: 'phoneContact';
}

export interface GoogleCalendarProps {
  type: 'googleCalendar';
}

export interface NotesToClientProps {
  type: 'notesToClient';
  label?: string;
}

export interface ClientNotesProps {
  type: 'clientNotes';
  label?: string;
}

export interface ManageBookingLinkProps {
  type: 'manageBookingLink';
  text?: string;
  buttonColor?: string;
}

export interface FooterProps {
  type: 'footer';
}

export interface SessionListProps {
  type: 'sessionList';
}

export interface RescheduleDetailsProps {
  type: 'rescheduleDetails';
}

export interface ChangeDetailsProps {
  type: 'changeDetails';
}

export type EmailComponentProps =
  | HeadingProps
  | TextProps
  | ButtonProps
  | DividerProps
  | SpacerProps
  | ImageProps
  | RowProps
  | ColumnProps
  | LinkProps
  | HtmlProps
  | ZoomProps
  | PhoneContactProps
  | GoogleCalendarProps
  | NotesToClientProps
  | ClientNotesProps
  | ManageBookingLinkProps
  | FooterProps
  | SessionListProps
  | RescheduleDetailsProps
  | ChangeDetailsProps;

export interface EmailComponent {
  id: string;
  type: EmailComponentType;
  props: EmailComponentProps;
  children?: EmailComponent[];
  locked?: boolean;
}

export interface EmailTemplate {
  component: EmailComponent;
  subject: string;
  previewText?: string;
}

export type EmailTypeKey =
  | 'confirmation'
  | 'recurring_confirmation'
  | 'cancellation'
  | 'reschedule'
  | 'change'
  | 'invite'
  | 'notification'
  | 'admin_change_notification'
  | 'admin_daily_summary'
  | 'admin_new_booking_notification'
  | 'admin_event_notification';

export interface AllEmailTemplates {
  confirmation: EmailTemplate | null;
  recurring_confirmation: EmailTemplate | null;
  cancellation: EmailTemplate | null;
  reschedule: EmailTemplate | null;
  change: EmailTemplate | null;
  invite: EmailTemplate | null;
  notification: EmailTemplate | null;
  admin_change_notification: EmailTemplate | null;
  admin_daily_summary: EmailTemplate | null;
  admin_new_booking_notification: EmailTemplate | null;
  admin_event_notification: EmailTemplate | null;
}

export interface EmailElements {
  company_info: boolean;
  zoom: boolean;
  phone: boolean;
  google_calendar: boolean;
}
