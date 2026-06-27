'use client';

import { useState } from 'react';
import { Event, EventStatus } from '@/types';
import { deleteEvent, recalculateEventPoints } from '@/lib/actions';
import { ClientForm } from '@/components/ClientForm';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardTitle } from '@/components/ui/Card';
import { EventModal } from './EventModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface AdminEventsClientProps {
  events: Event[];
}

function eventStatusBadgeVariant(status: EventStatus) {
  switch (status) {
    case 'open':
      return 'green';
    case 'upcoming':
      return 'yellow';
    case 'locked':
      return 'blue';
    case 'completed':
      return 'gray';
    case 'hidden':
      return 'red';
    default:
      return 'gray';
  }
}

export function AdminEventsClient({ events }: AdminEventsClientProps) {
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | undefined>();

  function openCreateModal() {
    setEventModalMode('create');
    setSelectedEvent(undefined);
    setIsEventModalOpen(true);
  }

  function openEditModal(event: Event) {
    setEventModalMode('edit');
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  }

  function openDeleteModal(event: Event) {
    setEventToDelete(event);
    setIsConfirmOpen(true);
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin: Events</h1>
          <p className="mt-2 text-slate-600">Create and manage prediction events.</p>
        </div>
        <Button onClick={openCreateModal}>Create Event</Button>
      </div>

      <Card>
        <CardTitle className="mb-5">Events</CardTitle>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{event.id}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{event.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant={eventStatusBadgeVariant(event.status)}>{event.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(event.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => openEditModal(event)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => openDeleteModal(event)}>
                        Delete
                      </Button>
                      <ClientForm action={recalculateEventPoints} successMessage="Points recalculated">
                        <input type="hidden" name="eventId" value={event.id} />
                        <Button type="submit" size="sm" variant="secondary">
                          Recalculate
                        </Button>
                      </ClientForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <EventModal
        key={`event-${eventModalMode}-${selectedEvent?.id ?? 'new'}`}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        mode={eventModalMode}
        event={selectedEvent}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Delete Event"
        message={
          eventToDelete
            ? `Are you sure you want to delete "${eventToDelete.name}"? This will also delete all matches, registrations, and bets for this event.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!eventToDelete) return;
          const formData = new FormData();
          formData.append('eventId', String(eventToDelete.id));
          await deleteEvent(formData);
          setIsConfirmOpen(false);
          setEventToDelete(undefined);
        }}
      />
    </div>
  );
}
