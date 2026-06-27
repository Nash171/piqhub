'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ClientForm } from '@/components/ClientForm';
import { createEvent, updateEvent } from '@/lib/actions';
import { Event, EventStatus } from '@/types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  event?: Event;
}

const statusOptions: EventStatus[] = ['upcoming', 'open', 'locked', 'completed', 'hidden'];

export function EventModal({ isOpen, onClose, mode, event }: EventModalProps) {
  const isEdit = mode === 'edit';
  const action = isEdit ? updateEvent : createEvent;
  const title = isEdit ? 'Edit Event' : 'Create Event';
  const submitLabel = isEdit ? 'Save Changes' : 'Create Event';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <ClientForm
        action={action}
        successMessage={isEdit ? 'Event updated' : 'Event created'}
        onSuccess={onClose}
      >
        {isEdit && <input type="hidden" name="eventId" value={event?.id} />}
        <div className="space-y-4">
          <div>
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              name="name"
              required
              placeholder="e.g. World Cup Knockouts"
              defaultValue={event?.name}
            />
          </div>
          <div>
            <Label htmlFor="event-status">Status</Label>
            <select
              id="event-status"
              name="status"
              required
              defaultValue={event?.status ?? 'upcoming'}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all hover:border-slate-300 focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </ClientForm>
    </Modal>
  );
}
