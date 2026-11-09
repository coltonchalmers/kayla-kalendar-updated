import { ChevronDown } from 'lucide-react';
import type { EmailTypeKey } from '@/lib/types';
import { getPlaceholdersForEmailType } from '@/lib/emailPlaceholders';

interface EmailPlaceholderPickerProps {
  emailType: EmailTypeKey;
  onInsert: (token: string) => void;
  collapsible?: boolean;
}

export default function EmailPlaceholderPicker({ emailType, onInsert, collapsible = false }: EmailPlaceholderPickerProps) {
  const placeholders = getPlaceholdersForEmailType(emailType);

  const chips = (
    <div className="flex flex-wrap gap-1.5">
      {placeholders.map((placeholder) => (
        <button
          key={placeholder.key}
          type="button"
          title={placeholder.label}
          onClick={() => onInsert(`{{${placeholder.key}}}`)}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-mono text-gray-700 transition-colors hover:border-jungo-green-300 hover:text-jungo-green-700"
        >
          {`{{${placeholder.key}}}`}
        </button>
      ))}
    </div>
  );

  if (collapsible) {
    return (
      <details className="group rounded-lg border border-gray-200 bg-gray-50">
        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900">
          Insert a booking detail
          <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="px-3 pb-3">{chips}</div>
      </details>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-500 mb-2">Insert a booking detail</p>
      {chips}
    </div>
  );
}
