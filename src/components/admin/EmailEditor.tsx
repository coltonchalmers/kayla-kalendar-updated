import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2, Plus } from 'lucide-react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import type {
  AllEmailTemplates,
  EmailTypeKey,
  EmailComponent,
  EmailComponentProps,
  EmailComponentType,
  TextAlign,
  HeadingProps,
  TextProps,
  ButtonProps,
  DividerProps,
  SpacerProps,
  ImageProps,
  LinkProps,
  HtmlProps,
  NotesToClientProps,
  ClientNotesProps,
  ManageBookingLinkProps,
} from '@/lib/types';

const EMAIL_TYPE_OPTIONS: { value: EmailTypeKey; label: string }[] = [
  { value: 'confirmation', label: 'Confirmation Email' },
  { value: 'recurring_confirmation', label: 'Recurring Confirmation Email' },
  { value: 'cancellation', label: 'Cancellation Email' },
  { value: 'reschedule', label: 'Reschedule Email' },
  { value: 'change', label: 'Booking Changed Email' },
  { value: 'invite', label: 'Invite Email' },
  { value: 'notification', label: 'Reminder Email' },
  { value: 'admin_change_notification', label: 'Admin Change Notification' },
  { value: 'admin_daily_summary', label: 'Admin Daily Summary' },
];

const COMPONENT_LABELS: Record<EmailComponentType, string> = {
  heading: 'Heading',
  text: 'Text Block',
  button: 'Button',
  divider: 'Divider',
  spacer: 'Spacer',
  image: 'Image',
  row: 'Row',
  column: 'Column',
  link: 'Link',
  html: 'HTML',
  zoom: 'Zoom Block',
  phoneContact: 'Phone Contact Block',
  googleCalendar: 'Google Calendar Button',
  notesToClient: 'Notes to Client Block',
  clientNotes: 'Client Notes Block',
  manageBookingLink: 'Manage Booking Link',
  footer: 'Footer Block',
  sessionList: 'Session List Block',
  rescheduleDetails: 'Reschedule Details Block',
  changeDetails: 'Change Details Block',
};

const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

const ADDABLE_BLOCKS: { type: EmailComponentType; label: string; group: string }[] = [
  { type: 'heading', label: 'Add Heading', group: 'Content' },
  { type: 'text', label: 'Add Text', group: 'Content' },
  { type: 'button', label: 'Add Button', group: 'Content' },
  { type: 'link', label: 'Add Link', group: 'Content' },
  { type: 'image', label: 'Add Image', group: 'Content' },
  { type: 'html', label: 'Add HTML', group: 'Content' },
  { type: 'divider', label: 'Add Divider', group: 'Structure' },
  { type: 'spacer', label: 'Add Spacer', group: 'Structure' },
  { type: 'zoom', label: 'Add Zoom Block', group: 'Dynamic Data' },
  { type: 'phoneContact', label: 'Add Phone Block', group: 'Dynamic Data' },
  { type: 'googleCalendar', label: 'Add Calendar Button', group: 'Dynamic Data' },
  { type: 'notesToClient', label: 'Add Notes to Client', group: 'Dynamic Data' },
  { type: 'clientNotes', label: 'Add Client Notes', group: 'Dynamic Data' },
  { type: 'manageBookingLink', label: 'Add Manage Booking Link', group: 'Dynamic Data' },
  { type: 'footer', label: 'Add Footer', group: 'Dynamic Data' },
  { type: 'sessionList', label: 'Add Session List', group: 'Dynamic Data' },
  { type: 'rescheduleDetails', label: 'Add Reschedule Details', group: 'Dynamic Data' },
  { type: 'changeDetails', label: 'Add Change Details', group: 'Dynamic Data' },
];

const STATIC_COMPONENT_TYPES: EmailComponentType[] = [
  'zoom',
  'phoneContact',
  'googleCalendar',
  'footer',
  'sessionList',
  'rescheduleDetails',
  'changeDetails',
];

function createDefaultComponent(type: EmailComponentType): EmailComponent {
  const id = crypto.randomUUID();
  const base = { id, type, props: { type } as EmailComponentProps };

  switch (type) {
    case 'heading':
      return { ...base, props: { type: 'heading', text: 'New Heading', level: 1, textAlign: 'left' } };
    case 'text':
      return { ...base, props: { type: 'text', text: 'Enter your text here.', textAlign: 'left' } };
    case 'button':
      return { ...base, props: { type: 'button', text: 'Click Here', href: '#', buttonColor: '#059669', textColor: '#FFFFFF', textAlign: 'center' } };
    case 'divider':
      return { ...base, props: { type: 'divider', color: '#E5E7EB', padding: 16 } };
    case 'spacer':
      return { ...base, props: { type: 'spacer', height: 20 } };
    case 'image':
      return { ...base, props: { type: 'image', src: '', alt: '', width: 200, height: 100 } };
    case 'link':
      return { ...base, props: { type: 'link', text: 'Link Text', href: '#' } };
    case 'html':
      return { ...base, props: { type: 'html', content: '<p>Custom HTML</p>' } };
    case 'notesToClient':
      return { ...base, props: { type: 'notesToClient', label: 'Notes' } };
    case 'clientNotes':
      return { ...base, props: { type: 'clientNotes', label: 'Client Notes' } };
    case 'manageBookingLink':
      return { ...base, props: { type: 'manageBookingLink', text: 'Manage Your Booking', buttonColor: '#059669' } };
    default:
      return base;
  }
}

function getComponentExcerpt(component: EmailComponent): string {
  const props = component.props as any;
  switch (component.type) {
    case 'heading':
    case 'text':
      return props.text?.slice(0, 60) ?? '';
    case 'button':
      return `${props.text ?? ''} -> ${props.href ?? ''}`;
    case 'link':
      return `${props.text ?? ''} -> ${props.href ?? ''}`;
    case 'image':
      return props.src ? `src: ${props.src.slice(0, 50)}` : 'No image URL set';
    case 'html':
      return props.content?.slice(0, 60) ?? '';
    case 'spacer':
      return `${props.height ?? 20}px height`;
    case 'divider':
      return 'Horizontal line';
    case 'notesToClient':
    case 'clientNotes':
      return `Label: ${props.label ?? 'Default'}`;
    case 'manageBookingLink':
      return props.text ?? 'Manage Your Booking';
    default:
      return 'Renders from booking data at send time';
  }
}

interface EmailEditorProps {
  templates: AllEmailTemplates;
  onChange: (newTemplates: AllEmailTemplates) => void;
  selectedKey: EmailTypeKey;
  onSelectedKeyChange: (key: EmailTypeKey) => void;
}

export default function EmailEditor({ templates, onChange, selectedKey, onSelectedKeyChange }: EmailEditorProps) {
  const [editingComponent, setEditingComponent] = useState<EmailComponent | null>(null);

  const selectedTemplate = templates[selectedKey]!;
  const components = selectedTemplate.component.children ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const updateTemplate = useCallback(
    (updates: Partial<typeof selectedTemplate>) => {
      onChange({
        ...templates,
        [selectedKey]: { ...selectedTemplate, ...updates },
      });
    },
    [templates, selectedKey, selectedTemplate, onChange],
  );

  const updateComponents = useCallback(
    (newChildren: EmailComponent[]) => {
      updateTemplate({
        component: { ...selectedTemplate.component, children: newChildren },
      });
    },
    [selectedTemplate, updateTemplate],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = components.findIndex((c) => c.id === active.id);
      const newIndex = components.findIndex((c) => c.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      updateComponents(arrayMove(components, oldIndex, newIndex));
    },
    [components, updateComponents],
  );

  const handleAddComponent = useCallback(
    (type: EmailComponentType) => {
      updateComponents([...components, createDefaultComponent(type)]);
    },
    [components, updateComponents],
  );

  const handleDeleteComponent = useCallback(
    (id: string) => {
      updateComponents(components.filter((c) => c.id !== id));
    },
    [components, updateComponents],
  );

  const handleSaveComponent = useCallback(
    (updated: EmailComponent) => {
      updateComponents(components.map((c) => (c.id === updated.id ? updated : c)));
      setEditingComponent(null);
    },
    [components, updateComponents],
  );

  const addGroups = Array.from(new Set(ADDABLE_BLOCKS.map((b) => b.group)));

  return (
    <div className="flex flex-col gap-5">
      <Select
        label="Email Type"
        value={selectedKey}
        onChange={(e) => onSelectedKeyChange(e.target.value as EmailTypeKey)}
        options={EMAIL_TYPE_OPTIONS}
      />

      <div className="grid grid-cols-1 gap-4">
        <Input
          label="Subject Line"
          value={selectedTemplate.subject}
          onChange={(e) => updateTemplate({ subject: e.target.value })}
          placeholder="Email subject..."
        />
        <Input
          label="Preview Text"
          value={selectedTemplate.previewText ?? ''}
          onChange={(e) => updateTemplate({ previewText: e.target.value })}
          placeholder="Short preview text shown in inbox..."
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Content Blocks</h3>
          <span className="text-xs text-gray-400">{components.length} block{components.length !== 1 ? 's' : ''}</span>
        </div>

        {components.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-400">No content blocks yet. Add one below to get started.</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {components.map((component) => (
                  <SortableItem
                    key={component.id}
                    component={component}
                    onEdit={() => setEditingComponent(component)}
                    onDelete={() => handleDeleteComponent(component.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Component</h3>
        <div className="space-y-3">
          {addGroups.map((group) => (
            <div key={group}>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">{group}</p>
              <div className="flex flex-wrap gap-2">
                {ADDABLE_BLOCKS.filter((b) => b.group === group).map((block) => (
                  <Button
                    key={block.type}
                    variant="outline"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                    onClick={() => handleAddComponent(block.type)}
                  >
                    {block.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {editingComponent && (
        <ComponentEditModal
          component={editingComponent}
          onClose={() => setEditingComponent(null)}
          onSave={handleSaveComponent}
        />
      )}
    </div>
  );
}

function SortableItem({
  component,
  onEdit,
  onDelete,
}: {
  component: EmailComponent;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: component.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 ${
        isDragging ? 'shadow-lg ring-2 ring-jungo-green-300' : 'hover:border-gray-300'
      } transition-all`}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {COMPONENT_LABELS[component.type]}
        </p>
        <p className="text-xs text-gray-400 truncate">{getComponentExcerpt(component)}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button variant="ghost" size="sm" icon={<Pencil className="w-3.5 h-3.5" />} onClick={onEdit}>
          <span className="sr-only">Edit</span>
        </Button>
        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}

function ComponentEditModal({
  component,
  onClose,
  onSave,
}: {
  component: EmailComponent;
  onClose: () => void;
  onSave: (updated: EmailComponent) => void;
}) {
  const [props, setProps] = useState<EmailComponentProps>({ ...component.props });

  const handleSave = () => {
    onSave({ ...component, props });
  };

  const update = (key: string, value: unknown) => {
    setProps((prev) => ({ ...prev, [key]: value }) as EmailComponentProps);
  };

  const label = COMPONENT_LABELS[component.type];
  const isStatic = STATIC_COMPONENT_TYPES.includes(component.type);

  return (
    <Modal open onClose={onClose} title={`Edit ${label}`} maxWidth="md">
      {isStatic ? (
        <div className="py-6 text-center">
          <p className="text-sm text-gray-500">
            This block has no editable properties. It automatically renders from the booking
            data when the email is sent.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {component.type === 'heading' && (
            <>
              <Input
                label="Text"
                value={(props as HeadingProps).text}
                onChange={(e) => update('text', e.target.value)}
              />
              <Select
                label="Heading Level"
                value={String((props as HeadingProps).level ?? 1)}
                onChange={(e) => update('level', Number(e.target.value) as 1 | 2 | 3)}
                options={[
                  { value: '1', label: 'H1 — Large' },
                  { value: '2', label: 'H2 — Medium' },
                  { value: '3', label: 'H3 — Small' },
                ]}
              />
              <Select
                label="Alignment"
                value={(props as HeadingProps).textAlign ?? 'left'}
                onChange={(e) => update('textAlign', e.target.value as TextAlign)}
                options={ALIGNMENT_OPTIONS}
              />
            </>
          )}

          {component.type === 'text' && (
            <>
              <Textarea
                label="Text"
                rows={5}
                value={(props as TextProps).text}
                onChange={(e) => update('text', e.target.value)}
              />
              <Select
                label="Alignment"
                value={(props as TextProps).textAlign ?? 'left'}
                onChange={(e) => update('textAlign', e.target.value as TextAlign)}
                options={ALIGNMENT_OPTIONS}
              />
            </>
          )}

          {component.type === 'button' && (
            <>
              <Input
                label="Button Text"
                value={(props as ButtonProps).text}
                onChange={(e) => update('text', e.target.value)}
              />
              <Input
                label="Link URL"
                value={(props as ButtonProps).href}
                onChange={(e) => update('href', e.target.value)}
                placeholder="https://..."
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Button Color"
                  type="color"
                  value={(props as ButtonProps).buttonColor ?? '#059669'}
                  onChange={(e) => update('buttonColor', e.target.value)}
                />
                <Input
                  label="Text Color"
                  type="color"
                  value={(props as ButtonProps).textColor ?? '#FFFFFF'}
                  onChange={(e) => update('textColor', e.target.value)}
                />
              </div>
              <Select
                label="Alignment"
                value={(props as ButtonProps).textAlign ?? 'left'}
                onChange={(e) => update('textAlign', e.target.value as TextAlign)}
                options={ALIGNMENT_OPTIONS}
              />
            </>
          )}

          {component.type === 'divider' && (
            <>
              <Input
                label="Line Color"
                type="color"
                value={(props as DividerProps).color ?? '#E5E7EB'}
                onChange={(e) => update('color', e.target.value)}
              />
              <Input
                label="Vertical Padding (px)"
                type="number"
                value={String((props as DividerProps).padding ?? 16)}
                onChange={(e) => update('padding', Number(e.target.value))}
              />
            </>
          )}

          {component.type === 'spacer' && (
            <Input
              label="Height (px)"
              type="number"
              value={String((props as SpacerProps).height ?? 20)}
              onChange={(e) => update('height', Number(e.target.value))}
            />
          )}

          {component.type === 'image' && (
            <>
              <Input
                label="Image URL"
                value={(props as ImageProps).src}
                onChange={(e) => update('src', e.target.value)}
                placeholder="https://..."
              />
              <Input
                label="Alt Text"
                value={(props as ImageProps).alt ?? ''}
                onChange={(e) => update('alt', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Width (px)"
                  type="number"
                  value={String((props as ImageProps).width ?? 200)}
                  onChange={(e) => update('width', Number(e.target.value))}
                />
                <Input
                  label="Height (px)"
                  type="number"
                  value={String((props as ImageProps).height ?? 100)}
                  onChange={(e) => update('height', Number(e.target.value))}
                />
              </div>
            </>
          )}

          {component.type === 'link' && (
            <>
              <Input
                label="Link Text"
                value={(props as LinkProps).text}
                onChange={(e) => update('text', e.target.value)}
              />
              <Input
                label="Link URL"
                value={(props as LinkProps).href}
                onChange={(e) => update('href', e.target.value)}
                placeholder="https://..."
              />
            </>
          )}

          {component.type === 'html' && (
            <Textarea
              label="HTML Content"
              rows={8}
              value={(props as HtmlProps).content}
              onChange={(e) => update('content', e.target.value)}
            />
          )}

          {component.type === 'notesToClient' && (
            <Input
              label="Label"
              value={(props as NotesToClientProps).label ?? ''}
              onChange={(e) => update('label', e.target.value)}
              placeholder="Notes"
            />
          )}

          {component.type === 'clientNotes' && (
            <Input
              label="Label"
              value={(props as ClientNotesProps).label ?? ''}
              onChange={(e) => update('label', e.target.value)}
              placeholder="Client Notes"
            />
          )}

          {component.type === 'manageBookingLink' && (
            <>
              <Input
                label="Button Text"
                value={(props as ManageBookingLinkProps).text ?? ''}
                onChange={(e) => update('text', e.target.value)}
              />
              <Input
                label="Button Color"
                type="color"
                value={(props as ManageBookingLinkProps).buttonColor ?? '#059669'}
                onChange={(e) => update('buttonColor', e.target.value)}
              />
            </>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        {!isStatic && <Button onClick={handleSave}>Save Changes</Button>}
      </div>
    </Modal>
  );
}
