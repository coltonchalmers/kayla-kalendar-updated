import React from "npm:react@18.3.1";
import { render } from "npm:@react-email/render@1.1.2";
import { EmailShell } from './EmailShell.tsx';
import { EmailComponentRenderer, replacePlaceholders } from './EmailComponentRenderer.tsx';
import { mergeEmailTemplates } from './emailDefaults.ts';
import type { AllEmailTemplates, EmailTemplate, EmailTypeKey } from './emailTypes.ts';

export function mergeTemplates(saved: AllEmailTemplates | null | undefined): AllEmailTemplates {
  return mergeEmailTemplates(saved);
}

export async function renderTemplateHtml(
  template: EmailTemplate,
  data: Record<string, any>,
  logoUrl?: string,
): Promise<{ html: string; subject: string }> {
  const tree = (
    <EmailShell previewText={template.previewText ?? ''} logoUrl={logoUrl}>
      {(template.component.children ?? []).map((child) => (
        <EmailComponentRenderer key={child.id} component={child} data={data} />
      ))}
    </EmailShell>
  );

  const html = await render(tree);
  const subject = replacePlaceholders(template.subject, data);

  return { html, subject };
}

export function getTemplate(
  templates: AllEmailTemplates | null | undefined,
  emailType: string,
): EmailTemplate | null {
  if (!templates) return null;
  const key = mapEmailTypeToTemplateKey(emailType);
  if (!key) return null;
  return templates[key] ?? null;
}

export function mapEmailTypeToTemplateKey(emailType: string): EmailTypeKey | null {
  const map: Record<string, EmailTypeKey> = {
    confirmation: 'confirmation',
    recurring_confirmation: 'recurring_confirmation',
    cancellation: 'cancellation',
    reschedule: 'reschedule',
    change: 'change',
    invite: 'invite',
    notification: 'notification',
    reminder: 'notification',
    admin_change_notification: 'admin_change_notification',
    admin_daily_summary: 'admin_daily_summary',
    admin_reminder: 'admin_reminder',
  };
  return map[emailType] ?? null;
}

interface RenderResult {
  html: string;
  subject: string;
}

export async function renderEmailWithFallback(
  emailType: string,
  data: Record<string, any>,
  templates: AllEmailTemplates | null | undefined,
  fallback: () => RenderResult,
  logoUrl?: string,
): Promise<RenderResult> {
  try {
    const template = getTemplate(templates, emailType);
    if (!template) {
      console.warn(`[email-render] No template found for "${emailType}" in saved settings, using fallback.`);
      return fallback();
    }
    return await renderTemplateHtml(template, data, logoUrl);
  } catch (err) {
    console.warn(`[email-render] Failed to render template for "${emailType}", falling back to plain-text HTML:`, err);
    return fallback();
  }
}
