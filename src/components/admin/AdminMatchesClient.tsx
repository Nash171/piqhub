'use client';

import { useState } from 'react';
import { Event, Match } from '@/types';
import { deleteMatch, setMatchWinner, resetMatchWinner } from '@/lib/actions';
import { ClientForm } from '@/components/ClientForm';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardTitle } from '@/components/ui/Card';
import { MatchModal } from './MatchModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface MatchWithEvent extends Match {
  event: Event;
}

interface AdminMatchesClientProps {
  events: Event[];
  matchesByEvent: { event: Event; matches: Match[] }[];
}

export function AdminMatchesClient({ events, matchesByEvent }: AdminMatchesClientProps) {
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchModalMode, setMatchModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMatch, setSelectedMatch] = useState<Match | undefined>();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<MatchWithEvent | undefined>();

  function openCreateModal() {
    setMatchModalMode('create');
    setSelectedMatch(undefined);
    setIsMatchModalOpen(true);
  }

  function openEditModal(match: Match) {
    setMatchModalMode('edit');
    setSelectedMatch(match);
    setIsMatchModalOpen(true);
  }

  function openDeleteModal(match: MatchWithEvent) {
    setMatchToDelete(match);
    setIsConfirmOpen(true);
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin: Matches</h1>
          <p className="mt-2 text-slate-600">Create matches and set winners.</p>
        </div>
        <Button onClick={openCreateModal}>Create Match</Button>
      </div>

      <Card>
        <CardTitle className="mb-5">Matches</CardTitle>
        {matchesByEvent.map(({ event, matches }) => (
          <div key={event.id} className="mb-8 last:mb-0">
            <h3 className="mb-3 text-lg font-bold text-slate-900">{event.name}</h3>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Teams
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Winner
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {matches.map((match) => (
                    <tr key={match.id}>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {match.team_a} vs {match.team_b}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {new Date(match.match_time).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            match.status === 'completed'
                              ? 'gray'
                              : match.status === 'locked'
                              ? 'yellow'
                              : 'green'
                          }
                        >
                          {match.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {match.winner
                          ? match.winner === 'team_a'
                            ? match.team_a
                            : match.team_b
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEditModal(match)}
                            disabled={match.status === 'completed'}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => openDeleteModal({ ...match, event })}
                          >
                            Delete
                          </Button>
                          {match.status !== 'completed' && new Date() >= new Date(match.match_time) && (
                            <ClientForm action={setMatchWinner} successMessage="Winner set">
                              <input type="hidden" name="matchId" value={match.id} />
                              <div className="flex flex-wrap gap-2">
                                <Button type="submit" name="winner" value="team_a" size="sm" variant="outline">
                                  {match.team_a} wins
                                </Button>
                                <Button type="submit" name="winner" value="team_b" size="sm" variant="outline">
                                  {match.team_b} wins
                                </Button>
                              </div>
                            </ClientForm>
                          )}
                          {match.status === 'completed' && (
                            <ClientForm action={resetMatchWinner} successMessage="Winner reset">
                              <input type="hidden" name="matchId" value={match.id} />
                              <Button type="submit" size="sm" variant="secondary">
                                Reset winner
                              </Button>
                            </ClientForm>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </Card>

      <MatchModal
        key={`match-${matchModalMode}-${selectedMatch?.id ?? 'new'}`}
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        mode={matchModalMode}
        match={selectedMatch}
        events={events}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Delete Match"
        message={
          matchToDelete
            ? `Are you sure you want to delete ${matchToDelete.team_a} vs ${matchToDelete.team_b}? This will also delete all bets on this match.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!matchToDelete) return;
          const formData = new FormData();
          formData.append('matchId', String(matchToDelete.id));
          await deleteMatch(formData);
          setIsConfirmOpen(false);
          setMatchToDelete(undefined);
        }}
      />
    </div>
  );
}
