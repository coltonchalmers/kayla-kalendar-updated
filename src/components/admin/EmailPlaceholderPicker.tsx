import type { EmailTypeKey } from '@/lib/types';
import { getPlaceholdersForEmailType } from '@/lib/emailPlaceholders';

interface EmailPlaceholderPickerProps {
  emailType: EmailTypeKey;
  onInsert: (token: string) => void;
}

export default function EmailPlaceholderPicker({ emailType, onInsert }: EmailPlaceholderPickerProps) {
  const placeholders = getPlaceholdersForEmailType(emailType);

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-500 mb-2">Insert a booking detail</p>
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
    </div>
  );
}
