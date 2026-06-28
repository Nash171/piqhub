import Link from 'next/link';
import { getEventById, getMatchesByEvent, getLeaderboard, getRegistration, getBetsByEvent } from '@/lib/queries';
import { calculateBetResult } from '@/lib/betting';
import type { Bet, EventStatus } from '@/types';
import { registerForEvent } from '@/lib/actions';
import { getSession } from '@/lib/session';
import { ClientForm } from '@/components/ClientForm';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LocalTime } from '@/components/LocalTime';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
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

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const eventId = parseInt(id, 10);
  const event = await getEventById(eventId);
  if (!event) return notFound();

  const session = await getSession();
  const isAdmin = session.user?.role === 'admin';
  if (event.status === 'hidden' && !isAdmin) {
    return notFound();
  }

  const matches = await getMatchesByEvent(eventId);
  const leaderboard = await getLeaderboard(eventId);
  const registration = session.user ? await getRegistration(eventId, session.user.id) : null;
  const allBets = await getBetsByEvent(eventId);
  const betsByMatch = allBets.reduce<Record<number, Bet[]>>((acc, bet) => {
    acc[bet.match_id] = acc[bet.match_id] ?? [];
    acc[bet.match_id].push(bet);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{event.name}</h1>
          <p className="mt-1 text-slate-600">Event details, matches, and leaderboard.</p>
        </div>
        <Badge variant={eventStatusBadgeVariant(event.status)}>{event.status}</Badge>
      </div>

      {!registration && session.user && event.status === 'open' && (
        <Card className="mb-8 border-dashed border-slate-300 bg-slate-50/50">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="mb-1">Register for this event</CardTitle>
              <CardDescription>You will receive 1000 coins to bet with.</CardDescription>
            </div>
            <ClientForm action={registerForEvent.bind(null, eventId)} successMessage="Registered for event">
              <Button type="submit">Register Now</Button>
            </ClientForm>
          </div>
        </Card>
      )}

      {registration?.status === 'confirmed' && (
        <Card className="mb-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-transparent">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="mb-1 text-white">Your Balance</CardTitle>
              <CardDescription className="text-slate-300">
                You have {registration.coins} coins for this event.
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{registration.coins}</div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">coins</div>
            </div>
          </div>
        </Card>
      )}

      {registration?.status === 'pending' && (
        <Card className="mb-8 border-dashed border-amber-300 bg-amber-50/50">
          <CardTitle className="mb-1 text-amber-900">Registration Pending</CardTitle>
          <CardDescription className="text-amber-700">
            Your registration is waiting for admin confirmation. You can view matches but cannot place bets yet.
          </CardDescription>
        </Card>
      )}

      {registration?.status === 'rejected' && (
        <Card className="mb-8 border-dashed border-red-300 bg-red-50/50">
          <CardTitle className="mb-1 text-red-900">Registration Rejected</CardTitle>
          <CardDescription className="text-red-700">
            Your registration was rejected. You cannot place bets for this event.
          </CardDescription>
        </Card>
      )}

      {registration?.status === 'blocked' && (
        <Card className="mb-8 border-dashed border-slate-400 bg-slate-100/50">
          <CardTitle className="mb-1 text-slate-900">Blocked for This Event</CardTitle>
          <CardDescription className="text-slate-600">
            You have been blocked from participating in this event.
          </CardDescription>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle className="mb-5">Matches</CardTitle>
          {matches.length === 0 ? (
            <p className="text-slate-600">No matches yet.</p>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const matchBets = betsByMatch[match.id] ?? [];
                const userBet = session.user
                  ? matchBets.find((bet) => bet.user_id === session.user!.id)
                  : undefined;
                const result = userBet ? calculateBetResult(userBet, match, matchBets) : null;
                const now = new Date();
                const matchTime = new Date(match.match_time);
                const isLocked = now >= matchTime || match.status === 'completed';
                const statusVariant = match.status === 'completed' ? 'gray' : isLocked ? 'yellow' : 'green';
                const statusLabel = match.status === 'completed' ? 'completed' : isLocked ? 'locked' : 'open';

                return (
                  <Link key={match.id} href={`/matches/${match.id}`} className="group block">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-slate-900">
                          {match.team_a} vs {match.team_b}
                        </span>
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-500">
                        <LocalTime iso={match.match_time} />
                      </p>
                      {match.winner && (
                        <p className="mt-2 text-sm font-semibold text-blue-600">
                          Winner: {match.winner === 'team_a' ? match.team_a : match.team_b}
                        </p>
                      )}
                      {userBet && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                          <span className="text-slate-600">
                            You bet <strong>{userBet.amount}</strong> on{' '}
                            {userBet.team_chosen === 'team_a' ? match.team_a : match.team_b}
                          </span>
                          {result && (
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                result.label === 'Won'
                                  ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                                  : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                              }`}
                            >
                              {result.label} {result.amount >= 0 ? '+' : ''}
                              {result.amount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle className="mb-5">Leaderboard</CardTitle>
          {leaderboard.length === 0 ? (
            <p className="text-slate-600">No players registered yet.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Player
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Coins
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.user_id} className={index === 0 ? 'bg-yellow-50/50' : ''}>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {index === 0 ? '🏆' : index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {entry.username}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                        {entry.coins}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
