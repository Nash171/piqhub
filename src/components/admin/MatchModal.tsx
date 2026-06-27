'use client';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { ClientForm } from '@/components/ClientForm';
import { createMatch, updateMatch } from '@/lib/actions';
import { Event, Match } from '@/types';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  match?: Match;
  events: Event[];
}

function formatDateTimeLocal(value: string): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function MatchModal({ isOpen, onClose, mode, match, events }: MatchModalProps) {
  const isEdit = mode === 'edit';
  const action = isEdit ? updateMatch : createMatch;
  const title = isEdit ? 'Edit Match' : 'Create Match';
  const submitLabel = isEdit ? 'Save Changes' : 'Create Match';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <ClientForm
        action={action}
        successMessage={isEdit ? 'Match updated' : 'Match created'}
        onSuccess={onClose}
      >
        {isEdit && <input type="hidden" name="matchId" value={match?.id} />}
        <div className="space-y-4">
          {!isEdit ? (
            <div>
              <Label htmlFor="match-event">Event</Label>
              <select
                id="match-event"
                name="eventId"
                required
                defaultValue={match?.event_id ?? ''}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all hover:border-slate-300 focus:border-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
              >
                <option value="">Select event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="eventId" value={match?.event_id} />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="match-team-a">Team A</Label>
              <Input
                id="match-team-a"
                name="teamA"
                required
                placeholder="Team A"
                defaultValue={match?.team_a}
              />
            </div>
            <div>
              <Label htmlFor="match-team-b">Team B</Label>
              <Input
                id="match-team-b"
                name="teamB"
                required
                placeholder="Team B"
                defaultValue={match?.team_b}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="match-time">Match Time</Label>
            <Input
              id="match-time"
              name="matchTime"
              type="datetime-local"
              required
              defaultValue={match ? formatDateTimeLocal(match.match_time) : ''}
            />
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
