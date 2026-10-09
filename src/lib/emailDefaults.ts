import type { AllEmailTemplates, EmailTemplate, EmailComponent } from './types';

function makeId(): string {
  return crypto.randomUUID();
}

function heading(text: string, level: 1 | 2 | 3 = 1): EmailComponent {
  return { id: makeId(), type: 'heading', props: { type: 'heading', text, level, textAlign: 'left' } };
}

function text(text: string): EmailComponent {
  return { id: makeId(), type: 'text', props: { type: 'text', text, textAlign: 'left' } };
}

function button(btnText: string, href: string): EmailComponent {
  return { id: makeId(), type: 'button', props: { type: 'button', text: btnText, href, buttonColor: '#059669', textColor: '#FFFFFF', textAlign: 'center' } };
}

function spacer(height: number): EmailComponent {
  return { id: makeId(), type: 'spacer', props: { type: 'spacer', height } };
}

function divider(): EmailComponent {
  return { id: makeId(), type: 'divider', props: { type: 'divider', color: '#E5E7EB', padding: 16 } };
}

function staticBlock(type: EmailComponent['type']): EmailComponent {
  return { id: makeId(), type, props: { type } as any };
}

function labeledBlock(type: 'notesToClient' | 'clientNotes', label: string): EmailComponent {
  return { id: makeId(), type, props: { type, label } as any };
}

function manageBookingLink(btnText = 'Manage Your Booking'): EmailComponent {
  return { id: makeId(), type: 'manageBookingLink', props: { type: 'manageBookingLink', text: btnText, buttonColor: '#059669' } };
}

function makeTemplate(subject: string, previewText: string, children: EmailComponent[]): EmailTemplate {
  return {
    component: {
      id: makeId(),
      type: 'html',
      props: { type: 'html', content: '' },
      children,
    },
    subject,
    previewText,
  };
}

export const defaultEmailTemplates: AllEmailTemplates = {
  confirmation: makeTemplate(
    'Your meeting is confirmed',
    'Your meeting with {{business_name}} has been confirmed.',
    [
      heading('Your Meeting is Confirmed'),
      text('Hi {{client_name}},\n\nYour meeting with {{business_name}} has been confirmed.\n\nDate: {{date}}\nTime: {{time}}\nDuration: {{duration}} minutes'),
      spacer(12),
      staticBlock('zoom'),
      staticBlock('googleCalendar'),
      spacer(8),
      labeledBlock('notesToClient', 'Notes'),
      manageBookingLink(),
      divider(),
      staticBlock('footer'),
    ],
  ),

  recurring_confirmation: makeTemplate(
    'Your recurring meeting series is confirmed',
    'Your recurring meeting series with {{business_name}} has been confirmed.',
    [
      heading('Recurring Meeting Series Confirmed'),
      text('Hi {{client_name}},\n\nYour recurring meeting series with {{business_name}} has been confirmed.\n\nEach session is {{duration}} minutes long.'),
      spacer(8),
      staticBlock('sessionList'),
      spacer(8),
      labeledBlock('notesToClient', 'Notes'),
      manageBookingLink(),
      divider(),
      staticBlock('footer'),
    ],
  ),

  cancellation: makeTemplate(
    'Your meeting has been cancelled',
    'Your meeting with {{business_name}} scheduled for {{date}} at {{time}} has been cancelled.',
    [
      heading('Meeting Cancelled'),
      text('Hi {{client_name}},\n\nYour meeting with {{business_name}} scheduled for {{date}} at {{time}} has been cancelled.\n\n{{notes_to_client}}\n\nIf you believe this is an error, please contact us.'),
      divider(),
      staticBlock('footer'),
    ],
  ),

  reschedule: makeTemplate(
    'Your meeting has been rescheduled',
    'Your meeting with {{business_name}} has been rescheduled.',
    [
      heading('Meeting Rescheduled'),
      text('Hi {{client_name}},\n\nYour meeting with {{business_name}} has been rescheduled.\n\nDuration: {{duration}} minutes'),
      spacer(8),
      staticBlock('rescheduleDetails'),
      spacer(8),
      staticBlock('zoom'),
      staticBlock('googleCalendar'),
      labeledBlock('notesToClient', 'Notes'),
      manageBookingLink(),
      divider(),
      staticBlock('footer'),
    ],
  ),

  change: makeTemplate(
    'Your booking details have been updated',
    'Your meeting details with {{business_name}} have been updated.',
    [
      heading('Booking Updated'),
      text('Hi {{client_name}},\n\nYour meeting details with {{business_name}} have been updated.\n\nDate: {{date}}\nTime: {{time}}\nDuration: {{duration}} minutes'),
      spacer(8),
      staticBlock('changeDetails'),
      staticBlock('zoom'),
      labeledBlock('notesToClient', 'Notes'),
      manageBookingLink(),
      divider(),
      staticBlock('footer'),
    ],
  ),

  invite: makeTemplate(
    'You are invited to book a meeting',
    'You are invited to book a meeting with {{business_name}}.',
    [
      heading("You're Invited"),
      text('Hi {{client_name}},\n\nYou are invited to book a meeting with {{business_name}}.\n\nUse the link below to choose a time that works for you.'),
      button('Book Your Meeting', '{{booking_link}}'),
      spacer(8),
      labeledBlock('notesToClient', 'Notes'),
      divider(),
      staticBlock('footer'),
    ],
  ),

  notification: makeTemplate(
    'Reminder: Your upcoming meeting',
    'This is a reminder for your upcoming meeting with {{business_name}}.',
    [
      heading('Meeting Reminder'),
      text('Hi {{client_name}},\n\nThis is a reminder for your upcoming meeting with {{business_name}}.\n\nDate: {{date}}\nTime: {{time}}\nDuration: {{duration}} minutes'),
      spacer(8),
      staticBlock('zoom'),
      staticBlock('googleCalendar'),
      spacer(8),
      labeledBlock('notesToClient', 'Notes'),
      manageBookingLink(),
      divider(),
      staticBlock('footer'),
    ],
  ),

  admin_change_notification: makeTemplate(
    'A client has changed their booking',
    '{{client_name}} has {{change_type}} their booking.',
    [
      heading('Booking Changed by Client'),
      text('A client has made a change to their booking:\n\nClient: {{client_name}}\nEmail: {{client_email}}'),
      spacer(8),
      staticBlock('changeDetails'),
      divider(),
      staticBlock('footer'),
    ],
  ),

  admin_daily_summary: makeTemplate(
    "Today's meeting summary",
    'You have meetings scheduled today.',
    [
      heading("Today's Meetings"),
      text('Here is a summary of all your confirmed meetings for today:'),
      spacer(8),
      staticBlock('sessionList'),
      divider(),
      staticBlock('footer'),
    ],
  ),
};

export function mergeEmailTemplates(
  saved: AllEmailTemplates | null | undefined,
): AllEmailTemplates {
  const result = {} as AllEmailTemplates;
  const keys = Object.keys(defaultEmailTemplates) as (keyof AllEmailTemplates)[];
  for (const key of keys) {
    const savedTemplate = saved?.[key];
    result[key] = savedTemplate ?? defaultEmailTemplates[key];
  }
  return result;
}
