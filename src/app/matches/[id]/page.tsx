import Link from 'next/link';
import { getMatchById, getRegistration, getBetForMatch, getBetsForMatch } from '@/lib/queries';
import { placeBet, updateBet } from '@/lib/actions';
import { calculateBetResult } from '@/lib/betting';
import { getSession } from '@/lib/session';
import { ClientForm } from '@/components/ClientForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MatchDetailPage({ params }: Props) {
  const { id } = await params;
  const matchId = parseInt(id, 10);
  const match = await getMatchById(matchId);
  if (!match) return notFound();

  const session = await getSession();
  const now = new Date();
  const matchTime = new Date(match.match_time);
  const isLocked = now >= matchTime || match.status === 'completed';

  const registration = session.user ? await getRegistration(match.event_id, session.user.id) : null;
  const myBet = session.user ? await getBetForMatch(matchId, session.user.id) : null;
  const allBets = isLocked ? await getBetsForMatch(matchId) : [];
  const myBetResult = myBet ? calculateBetResult(myBet, match, allBets) : null;

  const statusVariant = match.status === 'completed' ? 'gray' : isLocked ? 'yellow' : 'green';
  const statusLabel = match.status === 'completed' ? 'completed' : isLocked ? 'locked' : 'open';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href={`/events/${match.event_id}`}
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to event
      </Link>

      <Card className="mt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-2xl">
              {match.team_a} vs {match.team_b}
            </CardTitle>
            <CardDescription className="mt-1">
              Match starts at {matchTime.toLocaleString()}
            </CardDescription>
          </div>
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </div>
        {match.winner && (
          <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
            Winner: {match.winner === 'team_a' ? match.team_a : match.team_b}
          </div>
        )}
      </Card>

      {session.user && registration?.status === 'confirmed' && !isLocked && !myBet && (
        <Card className="mt-6">
          <CardTitle className="mb-1">Place Your Bet</CardTitle>
          <CardDescription className="mb-5">
            You have {registration.coins} coins available for this event.
          </CardDescription>
          <ClientForm action={placeBet} successMessage="Bet placed successfully">
            <input type="hidden" name="matchId" value={match.id} />
            <div className="space-y-5">
              <div>
                <Label>Pick a team</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <TeamRadio name="teamChosen" value="team_a" team={match.team_a} />
                  <TeamRadio name="teamChosen" value="team_b" team={match.team_b} />
                </div>
              </div>
              <div>
                <Label htmlFor="amount">Bet amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min={1}
                  max={registration.coins}
                  required
                  placeholder={`1 - ${registration.coins}`}
                />
              </div>
              <Button type="submit">Place Bet</Button>
            </div>
          </ClientForm>
        </Card>
      )}

      {session.user && registration && registration.status !== 'confirmed' && (
        <Card className="mt-6 border-dashed border-amber-300 bg-amber-50/50">
          <CardTitle className="mb-1 text-amber-900">
            {registration.status === 'pending' && 'Registration Pending Confirmation'}
            {registration.status === 'rejected' && 'Registration Rejected'}
            {registration.status === 'blocked' && 'Blocked for This Event'}
          </CardTitle>
          <CardDescription className="text-amber-700">
            {registration.status === 'pending' &&
              'Your registration is waiting for admin confirmation. You cannot place bets yet.'}
            {registration.status === 'rejected' &&
              'Your registration was rejected. You cannot place bets for this event.'}
            {registration.status === 'blocked' &&
              'You have been blocked from participating in this event.'}
          </CardDescription>
        </Card>
      )}

      {myBet && (
        <Card className="mt-6 bg-blue-50/50 border-blue-100">
          <CardTitle className="mb-2">Your Bet</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-slate-700">
              You bet <strong>{myBet.amount}</strong> coins on{' '}
              <strong>{myBet.team_chosen === 'team_a' ? match.team_a : match.team_b}</strong>
            </p>
            {myBetResult && (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  myBetResult.label === 'Won'
                    ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                    : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                }`}
              >
                {myBetResult.label} {myBetResult.amount >= 0 ? '+' : ''}
                {myBetResult.amount}
              </span>
            )}
          </div>
          {session.user && registration?.status === 'confirmed' && !isLocked && (
            <ClientForm action={updateBet} successMessage="Bet updated successfully" className="mt-5">
              <input type="hidden" name="matchId" value={match.id} />
              <div className="space-y-5">
                <div>
                  <Label>Pick a team</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <TeamRadio
                      name="teamChosen"
                      value="team_a"
                      team={match.team_a}
                      defaultChecked={myBet.team_chosen === 'team_a'}
                    />
                    <TeamRadio
                      name="teamChosen"
                      value="team_b"
                      team={match.team_b}
                      defaultChecked={myBet.team_chosen === 'team_b'}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="amount">Update bet amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min={1}
                    max={registration.coins + myBet.amount}
                    defaultValue={myBet.amount}
                    required
                    placeholder={`1 - ${registration.coins + myBet.amount}`}
                  />
                </div>
                <Button type="submit">Update Bet</Button>
              </div>
            </ClientForm>
          )}
        </Card>
      )}

      {!registration && session.user && (
        <Card className="mt-6">
          <CardTitle className="mb-2">Register to bet</CardTitle>
          <CardDescription className="mb-5">
            You must register for this event before you can place bets.
          </CardDescription>
          <Link href={`/events/${match.event_id}`}>
            <Button>Go to Event</Button>
          </Link>
        </Card>
      )}

      {isLocked && allBets.length > 0 && (
        <Card className="mt-6">
          <CardTitle className="mb-5">All Bets</CardTitle>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Player
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Team
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {allBets.map((bet) => {
                  const result = calculateBetResult(bet, match, allBets);
                  return (
                    <tr key={bet.id}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        Player #{bet.user_id}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {bet.team_chosen === 'team_a' ? match.team_a : match.team_b}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-slate-900">
                        {bet.amount}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold">
                        {result ? (
                          <span
                            className={
                              result.label === 'Won'
                                ? 'text-green-700'
                                : 'text-red-700'
                            }
                          >
                            {result.label} {result.amount >= 0 ? '+' : ''}
                            {result.amount}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function TeamRadio({
  name,
  value,
  team,
  defaultChecked,
}: {
  name: string;
  value: string;
  team: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="group relative flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-4 text-center transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white">
      <input
        type="radio"
        name={name}
        value={value}
        required
        defaultChecked={defaultChecked}
        className="sr-only"
      />
      <span className="font-semibold">{team}</span>
    </label>
  );
}
